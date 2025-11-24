// Static mock responses used to bypass all live API calls.
// Each endpoint shape returns minimal-but-sane data that matches what the UI expects.

const iso = (d: Date) => d.toISOString().slice(0, 10);

const buildDateSeries = (length: number) => {
  const today = new Date();
  return Array.from({ length }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (length - 1 - i));
    return iso(d);
  });
};

const buildAnalyticsTrend = (length = 14, base = 500, step = 35) => {
  return buildDateSeries(length).map((date, idx) => ({
    period: date,
    amount: base + idx * step,
    count: 20 + idx,
  }));
};

const buildValueTrend = (length = 14, base = 1200, step = 25) => {
  return buildDateSeries(length).map((date, idx) => ({
    date,
    value: base + idx * step,
  }));
};

const buildStackedSeries = <T extends Record<string, number>>(
  keys: Array<keyof T>,
  length = 10
): Array<T & { date: string }> => {
  return buildDateSeries(length).map((date, idx) => {
    const row: Record<string, number | string> = { date };
    keys.forEach((key, kIdx) => {
      row[key as string] = 50 + idx * 5 + kIdx * 10;
    });
    return row as T & { date: string };
  });
};

const buildTable = (entries: Array<{ label: string; value: number; total?: number }>) =>
  entries.map((entry) => ({
    frequency: entry.label,
    donations: Math.round(entry.value),
    totalRaised: entry.total ?? entry.value * 25,
  }));

export function getMockApiResponse(url: string): any | null {
  try {
    const parsed = new URL(url, 'http://localhost');
    const path = parsed.pathname;
    const search = parsed.searchParams;

    // Filters: appeals
    if (path.includes('/filters/appeals')) {
      return {
        success: true,
        data: [
          { id: 1, appeal_name: 'General Fund', status: 'active', start_date: null, end_date: null },
          { id: 2, appeal_name: 'Education Drive', status: 'active', start_date: null, end_date: null },
          { id: 3, appeal_name: 'Relief Campaign', status: 'inactive', start_date: null, end_date: null },
        ],
        count: 3,
        message: 'static data',
      };
    }

    // Filters: funds list
    if (path.includes('/filters/funds')) {
      const appealIds = search.get('appeal_ids') || '';
      const appealIdList = appealIds ? appealIds.split(',').map((id) => Number(id)) : [1, 2];
      return {
        success: true,
        data: [
          { id: 101, fund_name: 'Scholarships', is_active: true, appeal_id: appealIdList[0] || 1, category: 'Education' },
          { id: 102, fund_name: 'Food Support', is_active: true, appeal_id: appealIdList[1] || 2, category: 'Relief' },
          { id: 103, fund_name: 'Operations', is_active: false, appeal_id: appealIdList[0] || 1, category: 'Admin' },
        ],
        count: 3,
        filters: { appeal_id: appealIds || null, include_inactive: true },
        message: 'static data',
      };
    }

    // Analytics (total raised, installments, etc.)
    if (path.includes('/analytics')) {
      const trendData = buildAnalyticsTrend();
      const totalAmount = trendData.reduce((sum, row) => sum + row.amount, 0);
      const totalCount = trendData.reduce((sum, row) => sum + row.count, 0);
      return {
        data: {
          totalAmount,
          totalCount,
          trendData,
        },
      };
    }

    // Recurring plans
    if (path.includes('/recurring-plans')) {
      const metric = search.get('metric') || 'active-plans';
      const trendData = buildValueTrend().map((row, idx) => ({
        date: row.date,
        value: row.value + (metric === 'new-plans' ? idx * 2 : 0),
      }));
      return {
        data: {
          metric,
          trendData,
        },
      };
    }

    // Recurring revenue (MRR, share-of-revenue, donation-amounts)
    if (path.includes('/recurring-revenue')) {
      const metric = search.get('metric') || 'mrr';
      if (metric === 'donation-amounts') {
        return {
          data: {
            metric,
            trendData: [
              { amount_range: '$0-25', plan_count: 40, percentage: 35 },
              { amount_range: '$25-100', plan_count: 55, percentage: 48 },
              { amount_range: '$100+', plan_count: 12, percentage: 17 },
            ],
          },
        };
      }

      const trendData = buildValueTrend().map((row) => ({
        date: row.date,
        value: metric === 'share-of-revenue' ? Math.round((row.value % 50) + 10) : row.value,
      }));

      return {
        data: {
          metric,
          trendData,
        },
      };
    }

    // Frequencies chart/table
    if (path.includes('/frequencies')) {
      const metric = search.get('metric');
      if (metric === 'chart') {
        const chartData = buildStackedSeries<{ monthly: number; one_time: number; yearly: number; weekly: number; daily: number }>(
          ['monthly', 'one_time', 'yearly', 'weekly', 'daily']
        );
        return { success: true, data: { chartData } };
      }
      if (metric === 'table') {
        return {
          success: true,
          data: {
            tableData: buildTable([
              { label: 'Monthly', value: 120, total: 18000 },
              { label: 'One-time', value: 95, total: 9200 },
              { label: 'Yearly', value: 15, total: 7500 },
              { label: 'Weekly', value: 30, total: 2100 },
              { label: 'Daily', value: 10, total: 400 },
            ]),
          },
        };
      }
    }

    // Payment methods chart/table
    if (path.includes('/payment-methods')) {
      const metric = search.get('metric');
      if (metric === 'chart') {
        const dates = buildDateSeries(10);
        const chartData = dates.flatMap((date, idx) => [
          { date, paymenttype: 'card', amount: 150 + idx * 10 },
          { date, paymenttype: 'ach', amount: 90 + idx * 8 },
          { date, paymenttype: 'paypal', amount: 40 + idx * 5 },
        ]);
        return { success: true, data: { chartData } };
      }
      if (metric === 'table') {
        return {
          success: true,
          data: {
            tableData: [
              { payment_method: 'Card', donation_count: 220, total_raised: 28000 },
              { payment_method: 'ACH', donation_count: 140, total_raised: 16500 },
              { payment_method: 'PayPal', donation_count: 70, total_raised: 5200 },
            ],
          },
        };
      }
    }

    // Campaigns (funds chart/table)
    if (path.endsWith('/funds.php') && !path.includes('/filters/funds')) {
      const metric = search.get('metric');
      const dates = buildDateSeries(10);
      if (metric === 'chart') {
        const chartData = dates.flatMap((date, idx) => [
          { date, appeal_id: 1, appeal_name: 'General Fund', amount: 200 + idx * 12 },
          { date, appeal_id: 2, appeal_name: 'Education Drive', amount: 140 + idx * 9 },
        ]);
        return { success: true, data: { chartData } };
      }
      if (metric === 'table') {
        return {
          success: true,
          data: {
            tableData: [
              { appeal_id: 1, appeal_name: 'General Fund', donation_count: 320, total_raised: 42000 },
              { appeal_id: 2, appeal_name: 'Education Drive', donation_count: 210, total_raised: 31500 },
            ],
          },
        };
      }
    }

    // Countries chart/table
    if (path.includes('/countries')) {
      const metric = search.get('metric');
      const dates = buildDateSeries(10);
      if (metric === 'chart') {
        const chartData = dates.flatMap((date, idx) => [
          { date, country_code: 'US', amount: 180 + idx * 11 },
          { date, country_code: 'CA', amount: 75 + idx * 6 },
          { date, country_code: 'GB', amount: 60 + idx * 5 },
        ]);
        return { success: true, data: { chartData } };
      }
      if (metric === 'table') {
        return {
          success: true,
          data: {
            tableData: [
              { country_code: 'US', donation_count: 280, total_raised: 36000 },
              { country_code: 'CA', donation_count: 110, total_raised: 12800 },
              { country_code: 'GB', donation_count: 90, total_raised: 10400 },
            ],
          },
        };
      }
    }

    // Day/time heatmap
    if (path.includes('/day-time')) {
      const heatmapData = [];
      for (let day = 0; day < 7; day++) {
        for (let hour of [9, 12, 15, 18]) {
          heatmapData.push({
            day_of_week: day,
            hour_of_day: hour,
            donation_count: 2 + day + Math.floor(hour / 6),
            total_raised: 50 * (1 + day) + hour * 3,
          });
        }
      }
      return { success: true, data: { heatmapData } };
    }

    // Retention cohorts
    if (path.includes('/retention')) {
      return {
        success: true,
        data: {
          retentionData: [
            { cohort: '2024-01', count: 120, retention: [100, 92, 88, 83, 80, 77, 75, 73, 71, 70, 69, 68] },
            { cohort: '2024-06', count: 95, retention: [100, 90, 86, 82, 78, 75, 73, 71, 70, 69, 68, 67] },
          ],
        },
      };
    }

    // Authentication endpoints
    if (path.includes('/login') || path.includes('/add_user')) {
      return {
        success: true,
        token: 'static-token',
        user: { id: 1, email: 'demo@example.com', name: 'Demo User' },
        message: 'static auth response',
      };
    }

    // Monitoring dashboard
    if (url.includes('website-uptime-monitor-jet.vercel.app/api/dashboard')) {
      const now = new Date().toISOString();
      return {
        success: true,
        timestamp: now,
        executionTime: '120ms',
        overallStats: {
          totalClients: 3,
          clientsUp: 3,
          clientsDown: 0,
          overallUptimePercentage: 99.9,
          avgResponseTime: 180,
        },
        clients: [
          {
            name: 'Main Site',
            url: 'https://example.org',
            currentStatus: { status: 'Up', statusCode: 200, responseTime: 180, error: null, timestamp: now },
            statistics: {
              totalChecks: 144,
              upCount: 143,
              downCount: 1,
              uptimePercentage: 99.3,
              avgResponseTime: 185,
              minResponseTime: 140,
              maxResponseTime: 260,
              lastCheck: now,
            },
            recentHistory: buildDateSeries(12).map((date, idx) => ({
              timestamp: `${date}T12:00:00Z`,
              status: 'Up',
              statusCode: 200,
              responseTime: 150 + idx * 3,
              error: null,
            })),
          },
        ],
        dataRange: {
          totalLogs: 500,
          oldestLog: buildDateSeries(30)[0],
          newestLog: now,
        },
      };
    }

    // Monitoring client history
    if (url.includes('website-uptime-monitor-jet.vercel.app/api/client-history')) {
      const dates = buildDateSeries(12);
      return {
        success: true,
        timestamp: new Date().toISOString(),
        executionTime: '90ms',
        client: { name: 'Main Site', url: 'https://example.org' },
        dataPoints: dates.map((date) => ({
          timestamp: `${date}T12:00:00Z`,
          status: 'Up',
          statusCode: 200,
          responseTime: 170,
          error: null,
        })),
        hourlyAggregated: dates.map((date, idx) => ({
          hour: `${date}T12:00:00Z`,
          avgResponseTime: 160 + idx * 2,
          minResponseTime: 140,
          maxResponseTime: 220,
          uptimePercentage: 100,
          totalChecks: 12,
          upCount: 12,
          downCount: 0,
        })),
        statistics: {
          totalChecks: 144,
          upCount: 144,
          downCount: 0,
          uptimePercentage: 100,
          avgResponseTime: 175,
          minResponseTime: 140,
          maxResponseTime: 230,
          firstCheck: dates[0],
          lastCheck: dates[dates.length - 1],
        },
      };
    }

    // Generic default
    return { success: true, data: {} };
  } catch (err) {
    console.warn('Failed to build mock API response', err);
    return null;
  }
}
