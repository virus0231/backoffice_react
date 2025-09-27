/**
 * API endpoint for appeals filter data
 * Returns list of available appeals from pw_appeal table for filter dropdown
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createErrorResponse, logDatabaseError } from '@/lib/database/errorHandler';
import { getSequelizeInstance } from '@/lib/database/sequelize';
import { QueryTypes } from 'sequelize';

interface AppealResponse {
  id: number;
  appeal_name: string;
  status: 'active' | 'inactive';
  start_date: string | null;
  end_date: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // Fetch appeals from database using the exact query you specified
    let appeals: any[] = [];
    try {
      const sequelize = getSequelizeInstance();

      // Use the exact query you specified
      const query = 'SELECT * FROM pw_appeal';

      appeals = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
    } catch (e) {
      console.error('Database error:', e);
      // DB unavailable: return empty list gracefully
      const response = NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Database unavailable; returning empty appeals list'
      });
      response.headers.set('Cache-Control', 'no-cache');
      return response;
    }

    // Transform data for frontend
    const responseData: AppealResponse[] = appeals.map((appeal: any) => ({
      id: appeal.id,
      appeal_name: appeal.appeal_name || appeal.name || 'Unnamed Appeal',
      // Fix status logic: disable = 0 means active, disable = 1 means inactive
      status: (appeal.disable === 0 || appeal.disable === null || appeal.disable === undefined) ? 'active' : 'inactive',
      start_date: appeal.start_date ? new Date(appeal.start_date).toISOString() : null,
      end_date: appeal.end_date ? new Date(appeal.end_date).toISOString() : null
    }));

    // Set cache headers for filter data (1 hour cache)
    const response = NextResponse.json({
      success: true,
      data: responseData,
      count: responseData.length,
      message: `Retrieved ${responseData.length} appeals`
    });

    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
    return response;

  } catch (error) {
    console.error('Error fetching appeals:', error);

    logDatabaseError(error, {
      operation: 'fetchAppeals',
      requestId: crypto.randomUUID()
    });

    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Health check for appeals endpoint
 */
export async function HEAD() {
  try {
    const sequelize = getSequelizeInstance();
    const result = await sequelize.query('SELECT COUNT(*) as count FROM pw_appeal', {
      type: QueryTypes.SELECT
    }) as any[];

    const count = result[0]?.count || 0;
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Appeals': count.toString(),
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
