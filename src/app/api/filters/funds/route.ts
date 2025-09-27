/**
 * API endpoint for funds filter data
 * Returns list of available funds from pw_fundlist based on appeal_id
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createErrorResponse, logDatabaseError } from '@/lib/database/errorHandler';
import { getSequelizeInstance } from '@/lib/database/sequelize';
import { QueryTypes } from 'sequelize';

interface FundResponse {
  id: number;
  fund_name: string;
  is_active: boolean;
  appeal_id: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appealId = searchParams.get('appeal_id');
    const appealIds = searchParams.get('appeal_ids');

    // Fetch funds from database using the exact query you specified
    let funds: any[] = [];
    try {
      const sequelize = getSequelizeInstance();

      if (appealIds) {
        // Handle multiple appeal IDs (comma-separated)
        const appealIdArray = appealIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (appealIdArray.length > 0) {
          const placeholders = appealIdArray.map(() => '?').join(',');
          const query = `SELECT * FROM pw_fundlist WHERE appeal_id IN (${placeholders})`;
          funds = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: appealIdArray
          });
        } else {
          // Invalid appeal IDs, return empty
          funds = [];
        }
      } else if (appealId) {
        // Handle single appeal ID (backward compatibility)
        const query = 'SELECT * FROM pw_fundlist WHERE appeal_id = :appeal_id';
        funds = await sequelize.query(query, {
          type: QueryTypes.SELECT,
          replacements: { appeal_id: appealId }
        });
      } else {
        // Get all funds when no appeal is selected
        const query = 'SELECT * FROM pw_fundlist';
        funds = await sequelize.query(query, {
          type: QueryTypes.SELECT
        });
      }
    } catch (e) {
      console.error('Database error:', e);
      // DB unavailable: return empty list gracefully
      const response = NextResponse.json({
        success: true,
        data: [],
        count: 0,
        filters: { appeal_id: appealId, appeal_ids: appealIds },
        message: 'Database unavailable; returning empty funds list'
      });
      response.headers.set('Cache-Control', 'no-cache');
      return response;
    }

    // Transform data for frontend
    const responseData: FundResponse[] = funds.map((fund: any) => ({
      id: fund.id,
      fund_name: fund.fund_name || fund.name || 'Unnamed Fund',
      is_active: fund.disable === 0,
      appeal_id: fund.appeal_id
    }));

    // Set cache headers for filter data
    const response = NextResponse.json({
      success: true,
      data: responseData,
      count: responseData.length,
      filters: { appeal_id: appealId, appeal_ids: appealIds },
      message: `Retrieved ${responseData.length} funds${
        appealIds ? ` for ${appealIds.split(',').length} appeals` :
        appealId ? ` for appeal ${appealId}` : ''
      }`
    });

    response.headers.set('Cache-Control', 'public, max-age=1800, stale-while-revalidate=300');
    return response;

  } catch (error) {
    console.error('Error fetching funds:', error);

    logDatabaseError(error, {
      operation: 'fetchFunds',
      requestId: crypto.randomUUID(),
      appealId: request.nextUrl.searchParams.get('appeal_id'),
      appealIds: request.nextUrl.searchParams.get('appeal_ids')
    });

    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Health check for funds endpoint
 */
export async function HEAD() {
  try {
    const sequelize = getSequelizeInstance();
    const result = await sequelize.query('SELECT COUNT(*) as count FROM pw_fundlist', {
      type: QueryTypes.SELECT
    }) as any[];

    const count = result[0]?.count || 0;
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Funds': count.toString(),
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}