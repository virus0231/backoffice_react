/**
 * API endpoint for appeals filter data
 * Returns list of available appeals/campaigns for filter dropdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { CampaignModel } from '@/lib/database/models/Campaign';
import { createErrorResponse, logDatabaseError } from '@/lib/database/errorHandler';

interface AppealResponse {
  id: string;
  appeal_name: string;
  status: 'active' | 'inactive';
  start_date: string | null;
  end_date: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // Build query conditions
    const whereConditions: any = {};
    if (!includeInactive) {
      whereConditions.isActive = true;
    }

    // Fetch appeals from database
    const appeals = await CampaignModel.findAll({
      where: whereConditions,
      order: [
        ['isActive', 'DESC'], // Active appeals first
        ['appealName', 'ASC']  // Then alphabetical
      ],
      attributes: ['id', 'appealName', 'isActive', 'startDate', 'endDate']
    });

    // Transform data for frontend
    const responseData: AppealResponse[] = appeals.map(appeal => ({
      id: appeal.id,
      appeal_name: appeal.appealName,
      status: appeal.isActive ? 'active' : 'inactive',
      start_date: appeal.startDate ? appeal.startDate.toISOString() : null,
      end_date: appeal.endDate ? appeal.endDate.toISOString() : null
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
    const count = await CampaignModel.count();
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