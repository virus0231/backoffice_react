import { Op, WhereOptions } from 'sequelize';

export type Granularity = 'daily' | 'weekly';
export type FrequencyFilter = 'all' | 'one-time' | 'recurring' | 'recurring-first' | 'recurring-next';

interface BaseParams {
  startDate: Date;
  endDate: Date;
  appealId?: number | string | null;
  fundId?: number | string | null;
  frequency?: FrequencyFilter;
}

// We will reference model attributes for WHERE clauses
const ATTR = {
  date: 'donationDate',
  amount: 'amount',
  status: 'status',
  orderId: 'orderId',
  frequency: 'frequency',
  campaignId: 'campaignId',
  fundId: 'fundId',
} as const;

function buildBaseWhere(p: BaseParams): WhereOptions {
  const where: WhereOptions = {
    [ATTR.status]: 'completed',
    [ATTR.date]: {
      [Op.gte]: p.startDate,
      [Op.lte]: p.endDate,
    },
  } as any;

  if (p.appealId) (where as any)[ATTR.campaignId] = String(p.appealId);
  if (p.fundId) (where as any)[ATTR.fundId] = String(p.fundId);
  return where;
}

function whereForOneTime(): WhereOptions {
  return { [ATTR.frequency]: 0 } as any;
}

function whereForFirstInstallments(): WhereOptions {
  return {
    [ATTR.frequency]: 1,
    [ATTR.orderId]: { [Op.notRegexp]: '_' },
  } as any;
}

function whereForNextInstallments(): WhereOptions {
  return {
    [ATTR.frequency]: 1,
    [ATTR.orderId]: { [Op.regexp]: '_' },
  } as any;
}

function whereForRecurringAll(): WhereOptions {
  return { [ATTR.frequency]: 1 } as any;
}

function mergeAnd(...clauses: WhereOptions[]): WhereOptions {
  return { [Op.and]: clauses };
}

export async function aggregateRevenue(
  p: BaseParams,
  kind: 'total-raised' | 'first-installments' | 'one-time'
) {
  // Lazy-load the model to handle database connection errors
  const { DonationModel } = await import('@/lib/database/models');

  const base = buildBaseWhere(p);
  let typeWhere: WhereOptions;

  if (kind === 'one-time') typeWhere = whereForOneTime();
  else if (kind === 'first-installments') typeWhere = whereForFirstInstallments();
  else {
    // total-raised = one-time + first installments
    typeWhere = { [Op.or]: [whereForOneTime(), whereForFirstInstallments()] } as any;
  }

  // Apply optional global frequency override
  if (p.frequency && p.frequency !== 'all') {
    const map: Record<Exclude<FrequencyFilter, 'all'>, WhereOptions> = {
      'one-time': whereForOneTime(),
      'recurring': whereForRecurringAll(),
      'recurring-first': whereForFirstInstallments(),
      'recurring-next': whereForNextInstallments(),
    } as any;
    typeWhere = map[p.frequency as Exclude<FrequencyFilter, 'all'>] || typeWhere;
  }

  const where = mergeAnd(base, typeWhere);

  const [totalAmount, donationCount, avg] = await Promise.all([
    DonationModel.sum(ATTR.amount, { where }),
    DonationModel.count({ where }),
    DonationModel.findOne({
      attributes: [[DonationModel.sequelize!.fn('AVG', DonationModel.sequelize!.col(ATTR.amount)), 'avgAmount']],
      where,
      raw: true,
    }),
  ]);

  return {
    totalAmount: Number(totalAmount || 0),
    donationCount: Number(donationCount || 0),
    averageDonation: avg ? Number((avg as any).avgAmount || 0) : 0,
  };
}

export async function revenueTrend(
  p: BaseParams,
  kind: 'total-raised' | 'first-installments' | 'one-time',
  granularity: Granularity
) {
  // Lazy-load the model to handle database connection errors
  const { DonationModel } = await import('@/lib/database/models');

  const base = buildBaseWhere(p);
  let typeWhere: WhereOptions;
  if (kind === 'one-time') typeWhere = whereForOneTime();
  else if (kind === 'first-installments') typeWhere = whereForFirstInstallments();
  else typeWhere = { [Op.or]: [whereForOneTime(), whereForFirstInstallments()] } as any;

  if (p.frequency && p.frequency !== 'all') {
    const map: Record<Exclude<FrequencyFilter, 'all'>, WhereOptions> = {
      'one-time': whereForOneTime(),
      'recurring': whereForRecurringAll(),
      'recurring-first': whereForFirstInstallments(),
      'recurring-next': whereForNextInstallments(),
    } as any;
    typeWhere = map[p.frequency as Exclude<FrequencyFilter, 'all'>] || typeWhere;
  }

  const where = mergeAnd(base, typeWhere);

  const fmt = granularity === 'weekly' ? '%Y-%u' : '%Y-%m-%d';
  const dateField = (DonationModel as any).rawAttributes?.[ATTR.date]?.field || 'donation_date';
  const rows = await DonationModel.findAll({
    attributes: [
      [DonationModel.sequelize!.fn('DATE_FORMAT', DonationModel.sequelize!.col(dateField), fmt), 'period'],
      [DonationModel.sequelize!.fn('SUM', DonationModel.sequelize!.col(ATTR.amount)), 'amount'],
      [DonationModel.sequelize!.fn('COUNT', '*'), 'count'],
    ],
    where,
    group: [DonationModel.sequelize!.fn('DATE_FORMAT', DonationModel.sequelize!.col(dateField), fmt)],
    order: [[DonationModel.sequelize!.fn('DATE_FORMAT', DonationModel.sequelize!.col(dateField), fmt), 'ASC']],
    raw: true,
  });

  return rows.map((r: any) => ({ date: r.period, amount: Number(r.amount || 0), count: Number(r.count || 0) }));
}
