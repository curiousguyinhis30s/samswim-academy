import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPocketBase } from '@/lib/pocketbase/client';

export const dynamic = 'force-dynamic';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// Helper function to log activity
async function logActivity(pb: ReturnType<typeof getPocketBase>, tenantId: string, action: string, details: Record<string, unknown>) {
  try {
    await pb.collection('activity_logs').create({
      tenant_id: tenantId,
      action: action,
      details: details,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Helper function to send notification (placeholder)
function sendNotification(message: string) {
  console.log(`[NOTIFICATION SERVICE] ${message}`);
  // TODO: Implement email/SMS/push notification logic
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const pb = getPocketBase();

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata?.payment_id && session.payment_status === 'paid') {
          // Update payment status to paid
          await pb.collection('payments').update(metadata.payment_id, {
            status: 'paid',
            reference: session.payment_intent as string,
          });

          // Grant lessons based on package type
          const lessonsToGrant = metadata.package_type === 'term' ? 12 :
                                 metadata.package_type === 'monthly' ? 4 : 1;

          // Create booking credits
          await pb.collection('booking_credits').create({
            student_id: metadata.student_id,
            tenant_id: metadata.tenant_id,
            credits: lessonsToGrant,
            payment_id: metadata.payment_id,
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
          });

          // Log activity
          await logActivity(pb, metadata.tenant_id!, 'payment_completed', {
            amount: session.amount_total,
            currency: session.currency,
            student_id: metadata.student_id,
            package_type: metadata.package_type,
          });

          sendNotification(`Payment successful for student ${metadata.student_id}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        if (metadata?.payment_id) {
          await pb.collection('payments').update(metadata.payment_id, {
            status: 'failed',
          });

          await logActivity(pb, metadata.tenant_id!, 'payment_failed', {
            error: paymentIntent.last_payment_error?.message,
            payment_id: metadata.payment_id,
          });

          sendNotification(`Payment failed for payment ${metadata.payment_id}. Admin notified.`);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;

        if (metadata?.tenant_id) {
          await pb.collection('subscriptions').create({
            tenant_id: metadata.tenant_id,
            student_id: metadata.student_id,
            subscription_id: subscription.id,
            status: subscription.status,
            plan_id: subscription.items.data[0]?.price.id,
          });

          await logActivity(pb, metadata.tenant_id, 'subscription_created', {
            subscription_id: subscription.id,
          });

          sendNotification(`New subscription started for tenant ${metadata.tenant_id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find subscription by subscription_id
        try {
          const records = await pb.collection('subscriptions').getList(1, 1, {
            filter: `subscription_id = "${subscription.id}"`,
          });

          if (records.items.length > 0) {
            const subRecord = records.items[0];

            await pb.collection('subscriptions').update(subRecord.id, {
              status: 'cancelled',
            });

            await logActivity(pb, subRecord.tenant_id, 'subscription_cancelled', {
              subscription_id: subscription.id,
            });

            sendNotification(`Subscription cancelled for tenant ${subRecord.tenant_id}`);
          }
        } catch (error) {
          console.error('Error finding subscription:', error);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;

        if (subscriptionId) {
          try {
            const records = await pb.collection('subscriptions').getList(1, 1, {
              filter: `subscription_id = "${subscriptionId}"`,
            });

            if (records.items.length > 0) {
              const subRecord = records.items[0];

              // Record payment
              await pb.collection('payments').create({
                tenant_id: subRecord.tenant_id,
                student_id: subRecord.student_id,
                amount: (invoice.amount_paid || 0) / 100,
                currency: invoice.currency?.toUpperCase() || 'MYR',
                status: 'paid',
                payment_method: 'stripe_subscription',
                reference: invoice.id,
              });

              // Grant monthly credits
              await pb.collection('booking_credits').create({
                student_id: subRecord.student_id,
                tenant_id: subRecord.tenant_id,
                credits: 4, // Monthly package
                expires_at: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
              });

              await logActivity(pb, subRecord.tenant_id, 'renewal_payment', {
                invoice_id: invoice.id,
                amount: invoice.amount_paid,
              });

              sendNotification(`Recurring payment received for tenant ${subRecord.tenant_id}`);
            }
          } catch (error) {
            console.error('Error processing invoice:', error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
