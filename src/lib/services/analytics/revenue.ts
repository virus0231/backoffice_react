import { getSequelizeInstance } from '@/lib/database/sequelize';
import { QueryTypes } from 'sequelize';

export type Granularity = 'daily' | 'weekly';
export type FrequencyFilter = 'all' | 'one-time' | 'recurring' | 'recurring-first' | 'recurring-next';

interface BaseParams {
  startDate: Date;
  endDate: Date;
  appealId?: number | string | null;
  fundId?: number | string | null;
  frequency?: FrequencyFilter;
}

function buildBaseWhereConditions(p: BaseParams): { whereClause: string; replacements: any } {
  const conditions: string[] = [];
  const replacements: any = {
    startDate: p.startDate,
    endDate: p.endDate
  };

  // Base conditions
  conditions.push("t.status = 'completed'");
  conditions.push("t.date >= :startDate");
  conditions.push("t.date <= :endDate");

  // Appeal filter
  if (p.appealId) {
    conditions.push("td.appeal_id = :appealId");
    replacements.appealId = parseInt(String(p.appealId));
  }

  // Fund filter
  if (p.fundId) {
    conditions.push("td.fundlist_id = :fundId");
    replacements.fundId = parseInt(String(p.fundId));
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    replacements
  };
}

function getFrequencyCondition(frequency: FrequencyFilter): string {
  switch (frequency) {
    case 'one-time':
      return 'AND td.freq = 0';
    case 'recurring':
      return 'AND td.freq = 1';
    case 'recurring-first':
      return 'AND td.freq = 1 AND t.order_id NOT REGEXP "_"';
    case 'recurring-next':
      return 'AND td.freq = 1 AND t.order_id REGEXP "_"';
    default:
      return '';
  }
}

export async function aggregateRevenue(
  p: BaseParams,
  kind: 'total-raised' | 'first-installments' | 'one-time'
) {
  const sequelize = getSequelizeInstance();
  const { whereClause, replacements } = buildBaseWhereConditions(p);

  let frequencyCondition = '';
  if (kind === 'one-time') {
    frequencyCondition = 'AND td.freq = 0';
  } else if (kind === 'first-installments') {
    frequencyCondition = 'AND td.freq = 1 AND t.order_id NOT REGEXP "_"';
  } else {
    // total-raised = one-time + first installments
    frequencyCondition = 'AND (td.freq = 0 OR (td.freq = 1 AND t.order_id NOT REGEXP "_"))';
  }

  // Apply global frequency override if specified
  if (p.frequency && p.frequency !== 'all') {
    frequencyCondition = getFrequencyCondition(p.frequency);
  }

  const query = `
    SELECT
      COALESCE(SUM(t.totalamount), 0) as totalAmount,
      COUNT(*) as donationCount,
      COALESCE(AVG(t.totalamount), 0) as averageDonation
    FROM pw_transactions t
    JOIN pw_transaction_details td ON t.TID = td.TID
    ${whereClause}
    ${frequencyCondition}
  `;

  const results = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements
  });

  const result = results[0] as any;
  return {
    totalAmount: Number(result.totalAmount || 0),
    donationCount: Number(result.donationCount || 0),
    averageDonation: Number(result.averageDonation || 0),
  };
}

export async function revenueTrend(
  p: BaseParams,
  kind: 'total-raised' | 'first-installments' | 'one-time',
  granularity: Granularity
) {
  const sequelize = getSequelizeInstance();
  const { whereClause, replacements } = buildBaseWhereConditions(p);

  let frequencyCondition = '';
  if (kind === 'one-time') {
    frequencyCondition = 'AND td.freq = 0';
  } else if (kind === 'first-installments') {
    frequencyCondition = 'AND td.freq = 1 AND t.order_id NOT REGEXP "_"';
  } else {
    // total-raised = one-time + first installments
    frequencyCondition = 'AND (td.freq = 0 OR (td.freq = 1 AND t.order_id NOT REGEXP "_"))';
  }

  // Apply global frequency override if specified
  if (p.frequency && p.frequency !== 'all') {
    frequencyCondition = getFrequencyCondition(p.frequency);
  }

  const dateFormat = granularity === 'weekly' ? '%Y-%u' : '%Y-%m-%d';

  const query = `
    SELECT
      DATE_FORMAT(t.date, '${dateFormat}') as period,
      COALESCE(SUM(t.totalamount), 0) as amount,
      COUNT(*) as count
    FROM pw_transactions t
    JOIN pw_transaction_details td ON t.TID = td.TID
    ${whereClause}
    ${frequencyCondition}
    GROUP BY DATE_FORMAT(t.date, '${dateFormat}')
    ORDER BY DATE_FORMAT(t.date, '${dateFormat}') ASC
  `;

  const results = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements
  });

  return results.map((r: any) => ({
    date: r.period,
    amount: Number(r.amount || 0),
    count: Number(r.count || 0)
  }));
}