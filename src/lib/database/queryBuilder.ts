/**
 * Query Builder Utilities
 * Provides parameterized query functions for filtering and aggregation
 */

import { Op, WhereOptions, FindOptions, Includeable } from 'sequelize';
import { DonationModel, DonorModel, CampaignModel, FundModel } from './models';

// Date range filter interface
export interface DateRangeFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

// Universal filter interface
export interface UniversalFilter {
  dateRange?: DateRangeFilter;
  campaignIds?: string[];
  fundIds?: string[];
  donorIds?: string[];
  status?: string[];
  paymentMethods?: string[];
  frequency?: number[];
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Builds date range WHERE clause for donations
 */
export function buildDateRangeFilter(dateRange?: DateRangeFilter): WhereOptions {
  if (!dateRange) return {};

  const conditions: any = {};

  if (dateRange.startDate) {
    conditions[Op.gte] = new Date(dateRange.startDate);
  }

  if (dateRange.endDate) {
    conditions[Op.lte] = new Date(dateRange.endDate);
  }

  // Check if conditions has any properties (including Symbols)
  const hasConditions = Object.keys(conditions).length > 0 || Object.getOwnPropertySymbols(conditions).length > 0;

  return hasConditions
    ? { donationDate: conditions }
    : {};
}

/**
 * Builds WHERE clause from universal filter
 */
export function buildUniversalFilter(filter: UniversalFilter): WhereOptions {
  const where: WhereOptions = {};

  // Date range filtering
  if (filter.dateRange) {
    Object.assign(where, buildDateRangeFilter(filter.dateRange));
  }

  // Campaign filtering
  if (filter.campaignIds && filter.campaignIds.length > 0) {
    where.campaignId = { [Op.in]: filter.campaignIds };
  }

  // Fund filtering
  if (filter.fundIds && filter.fundIds.length > 0) {
    where.fundId = { [Op.in]: filter.fundIds };
  }

  // Donor filtering
  if (filter.donorIds && filter.donorIds.length > 0) {
    where.donorId = { [Op.in]: filter.donorIds };
  }

  // Status filtering
  if (filter.status && filter.status.length > 0) {
    where.status = { [Op.in]: filter.status };
  }

  // Payment method filtering
  if (filter.paymentMethods && filter.paymentMethods.length > 0) {
    where.paymentMethod = { [Op.in]: filter.paymentMethods };
  }

  // Frequency filtering
  if (filter.frequency && filter.frequency.length > 0) {
    where.frequency = { [Op.in]: filter.frequency };
  }

  // Amount range filtering
  if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
    const amountConditions: any = {};

    if (filter.minAmount !== undefined) {
      amountConditions[Op.gte] = filter.minAmount;
    }

    if (filter.maxAmount !== undefined) {
      amountConditions[Op.lte] = filter.maxAmount;
    }

    where.amount = amountConditions;
  }

  return where;
}

/**
 * Query donations with universal filtering
 */
export async function queryDonations(
  filter: UniversalFilter = {},
  options: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    includeDonor?: boolean;
    includeCampaign?: boolean;
    includeFund?: boolean;
  } = {}
) {
  const where = buildUniversalFilter(filter);

  const include: Includeable[] = [];

  if (options.includeDonor) {
    include.push({ model: DonorModel, as: 'donor' });
  }

  if (options.includeCampaign) {
    include.push({ model: CampaignModel, as: 'campaign' });
  }

  if (options.includeFund) {
    include.push({ model: FundModel, as: 'fund' });
  }

  const findOptions: FindOptions = {
    where,
    include,
    limit: options.limit,
    offset: options.offset,
    order: options.orderBy
      ? [[options.orderBy, options.orderDirection || 'DESC']]
      : [['donationDate', 'DESC']]
  };

  return await DonationModel.findAndCountAll(findOptions);
}

/**
 * Get donation aggregations (sum, count, avg) with filtering
 */
export async function getDonationAggregations(filter: UniversalFilter = {}) {
  const where = buildUniversalFilter(filter);

  const [totalResult, countResult, avgResult] = await Promise.all([
    DonationModel.sum('amount', { where }),
    DonationModel.count({ where }),
    DonationModel.findOne({
      attributes: [
        [DonationModel.sequelize!.fn('AVG', DonationModel.sequelize!.col('amount')), 'avgAmount']
      ],
      where,
      raw: true
    })
  ]);

  return {
    totalAmount: totalResult || 0,
    donationCount: countResult || 0,
    averageAmount: (avgResult as any)?.avgAmount || 0
  };
}

/**
 * Get donations grouped by time period
 */
export async function getDonationsByTimePeriod(
  period: 'day' | 'week' | 'month' | 'year',
  filter: UniversalFilter = {}
) {
  const where = buildUniversalFilter(filter);

  let dateFormat: string;
  switch (period) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      break;
    case 'week':
      dateFormat = '%Y-%u';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'year':
      dateFormat = '%Y';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  const results = await DonationModel.findAll({
    attributes: [
      [DonationModel.sequelize!.fn('DATE_FORMAT', DonationModel.sequelize!.col('donation_date'), dateFormat), 'period'],
      [DonationModel.sequelize!.fn('SUM', DonationModel.sequelize!.col('amount')), 'totalAmount'],
      [DonationModel.sequelize!.fn('COUNT', '*'), 'donationCount']
    ],
    where,
    group: [DonationModel.sequelize!.fn('DATE_FORMAT', DonationModel.sequelize!.col('donation_date'), dateFormat)],
    order: [[DonationModel.sequelize!.fn('DATE_FORMAT', DonationModel.sequelize!.col('donation_date'), dateFormat), 'ASC']],
    raw: true
  });

  return results;
}

/**
 * Get first-time donors analysis
 */
export async function getFirstTimeDonors(filter: UniversalFilter = {}) {
  const baseWhere = buildUniversalFilter(filter);

  // Create combined where clause for first installments
  const where: WhereOptions = {
    ...baseWhere,
    frequency: 1,
    orderId: { [Op.notRegexp]: '_' }
  };

  const findOptions: FindOptions = {
    where,
    include: [{ model: DonorModel, as: 'donor' }],
    order: [['donationDate', 'DESC']]
  };

  return await DonationModel.findAndCountAll(findOptions);
}

/**
 * Get recurring donations analysis
 */
export async function getRecurringDonations(filter: UniversalFilter = {}) {
  const baseWhere = buildUniversalFilter(filter);

  // Create combined where clause for recurring donations
  const where: WhereOptions = {
    ...baseWhere,
    [Op.or]: [
      { frequency: { [Op.gt]: 1 } },
      { orderId: { [Op.regexp]: '_' } }
    ]
  };

  const findOptions: FindOptions = {
    where,
    include: [{ model: DonorModel, as: 'donor' }],
    order: [['donationDate', 'DESC']]
  };

  return await DonationModel.findAndCountAll(findOptions);
}