import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Package prices in cents (MYR)
const PACKAGE_PRICES: Record<string, number> = {
  single: 5000,   // RM50
  monthly: 18000, // RM180
  term: 45000,    // RM450
};

function getStripe(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    console.warn('STRIPE_SECRET_KEY not configured');
    return null;
  }

  return new Stripe(apiKey);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json(
        {
          error: 'Payment system not configured',
          message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.',
          code: 'STRIPE_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { studentId, packageType, quantity = 1 } = body;

    if (!studentId || !packageType) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, packageType' },
        { status: 400 }
      );
    }

    const unitAmount = PACKAGE_PRICES[packageType];
    if (!unitAmount) {
      return NextResponse.json(
        { error: `Invalid package type: ${packageType}` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'fpx'],
        line_items: [
          {
            price_data: {
              currency: 'myr',
              product_data: {
                name: `SamSwim ${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package`,
                description: `Swimming lessons package for student`,
              },
              unit_amount: unitAmount,
            },
            quantity,
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}/portal?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/portal?payment=cancelled`,
        metadata: {
          studentId,
          packageType,
        },
      });

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (stripeError) {
      console.error('Stripe API Error:', stripeError);

      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Failed to create checkout session';

      return NextResponse.json(
        {
          error: 'Payment processing failed',
          message: errorMessage,
          code: 'STRIPE_ERROR'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout API Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
