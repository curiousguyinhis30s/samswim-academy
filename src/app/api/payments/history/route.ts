import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase/client';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  reference: string;
  student_id: string;
  student_name: string;
}

// Demo data for fallback
const DEMO_PAYMENTS: Payment[] = [
  {
    id: 'demo_1',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    amount: 180,
    currency: 'MYR',
    status: 'paid',
    payment_method: 'FPX',
    reference: 'cs_demo_001',
    student_id: 'stu_1',
    student_name: 'Ahmad bin Ali',
  },
  {
    id: 'demo_2',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    amount: 50,
    currency: 'MYR',
    status: 'pending',
    payment_method: 'Card',
    reference: 'cs_demo_002',
    student_id: 'stu_2',
    student_name: 'Sarah Lee',
  },
  {
    id: 'demo_3',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    amount: 450,
    currency: 'MYR',
    status: 'paid',
    payment_method: 'FPX',
    reference: 'cs_demo_003',
    student_id: 'stu_1',
    student_name: 'Ahmad bin Ali',
  },
  {
    id: 'demo_4',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    amount: 180,
    currency: 'MYR',
    status: 'paid',
    payment_method: 'Card',
    reference: 'cs_demo_004',
    student_id: 'stu_3',
    student_name: 'Muhammad Imran',
  },
  {
    id: 'demo_5',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    amount: 50,
    currency: 'MYR',
    status: 'failed',
    payment_method: 'FPX',
    reference: 'cs_demo_005',
    student_id: 'stu_4',
    student_name: 'Nurul Aina',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const status = searchParams.get('status');
  const dateRange = searchParams.get('dateRange');

  try {
    const pb = getPocketBase();
    const tenantId = searchParams.get('tenant_id') || 'demo-tenant';

    const filters: string[] = [`tenant_id = "${tenantId}"`];

    if (studentId && studentId !== 'all') {
      filters.push(`student_id = "${studentId}"`);
    }
    if (status && status !== 'all') {
      filters.push(`status = "${status}"`);
    }
    if (dateRange) {
      const now = new Date();
      let daysBack = 0;
      if (dateRange === 'last7') daysBack = 7;
      else if (dateRange === 'last30') daysBack = 30;
      else if (dateRange === 'last90') daysBack = 90;

      if (daysBack > 0) {
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        filters.push(`created >= "${startDate.toISOString()}"`);
      }
    }

    const records = await pb.collection('payments').getList(1, 100, {
      filter: filters.join(' && '),
      sort: '-created',
      expand: 'student_id',
    });

    const payments: Payment[] = records.items.map((record) => {
      const r = record as unknown as {
        id: string;
        created: string;
        amount: number;
        currency: string;
        status: string;
        payment_method: string;
        reference: string;
        student_id: string;
        expand?: { student_id?: { name?: string } };
      };

      return {
        id: r.id,
        created_at: r.created,
        amount: r.amount || 0,
        currency: r.currency || 'MYR',
        status: r.status || 'pending',
        payment_method: r.payment_method || 'Unknown',
        reference: r.reference || r.id,
        student_id: r.student_id,
        student_name: r.expand?.student_id?.name || 'Unknown Student',
      };
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.warn('PocketBase fetch failed, returning demo data:', error);

    // Filter demo data based on query params
    let filteredPayments = [...DEMO_PAYMENTS];

    if (studentId && studentId !== 'all') {
      filteredPayments = filteredPayments.filter((p) => p.student_id === studentId);
    }
    if (status && status !== 'all') {
      filteredPayments = filteredPayments.filter((p) => p.status === status);
    }
    if (dateRange) {
      const now = new Date();
      let daysBack = 0;
      if (dateRange === 'last7') daysBack = 7;
      else if (dateRange === 'last30') daysBack = 30;
      else if (dateRange === 'last90') daysBack = 90;

      if (daysBack > 0) {
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        filteredPayments = filteredPayments.filter((p) => new Date(p.created_at) >= startDate);
      }
    }

    return NextResponse.json(filteredPayments);
  }
}
