/**
 * API endpoint for funds filter data
 * Returns list of available funds with optional appeal-based filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { FundModel } from '@/lib/database/models/Fund';
import { DonationModel } from '@/lib/database/models/Donation';
import { createErrorResponse, logDatabaseError } from '@/lib/database/errorHandler';

interface FundResponse {
  id: string;
  fund_name: string;
  is_active: boolean;
  category?: string;
  appeal_id?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appealId = searchParams.get('appeal_id');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // Build query conditions
    const whereConditions: any = {};
    if (!includeInactive) {
      whereConditions.isActive = true;
    }

    let funds;

    if (appealId) {
      // Get funds that have been used with the specific appeal
      // This creates a cascading relationship based on actual donation data
      funds = await FundModel.findAll({
        where: whereConditions,
        include: [{
          model: DonationModel,
          where: {
            campaignId: appealId
          },
          attributes: [], // We don't need donation attributes, just the join
          required: true  // INNER JOIN to only get funds used with this appeal
        }],
        order: [
          ['isActive', 'DESC'],
          ['displayOrder', 'ASC'],
          ['fundName', 'ASC']
        ],
        attributes: ['id', 'fundName', 'isActive', 'category'],
        group: ['FundModel.id'] // Group by fund to avoid duplicates
      });
    } else {
      // Get all funds (no appeal filter)
      funds = await FundModel.findAll({
        where: whereConditions,
        order: [
          ['isActive', 'DESC'],
          ['displayOrder', 'ASC'],
          ['fundName', 'ASC']
        ],
        attributes: ['id', 'fundName', 'isActive', 'category']
      });
    }

    // Transform data for frontend
    const responseData: FundResponse[] = funds.map(fund => ({
      id: fund.id,
      fund_name: fund.fundName,
      is_active: fund.isActive,
      category: fund.category || undefined,
      appeal_id: appealId || undefined
    }));

    // Set cache headers (shorter cache for appeal-specific requests)
    const cacheMaxAge = appealId ? 1800 : 3600; // 30 min vs 1 hour
    const response = NextResponse.json({
      success: true,
      data: responseData,
      count: responseData.length,
      filters: {
        appeal_id: appealId,
        include_inactive: includeInactive
      },
      message: appealId
        ? `Retrieved ${responseData.length} funds for appeal ${appealId}`
        : `Retrieved ${responseData.length} funds`
    });

    response.headers.set('Cache-Control', `public, max-age=${cacheMaxAge}, stale-while-revalidate=600`);
    return response;

  } catch (error) {
    console.error('Error fetching funds:', error);

    logDatabaseError(error, {
      operation: 'fetchFunds',
      requestId: crypto.randomUUID()
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
    const count = await FundModel.count();
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