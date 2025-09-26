/**
 * Query Builder Tests
 * Tests universal filtering, date ranges, and query building functionality
 */

// Mock Sequelize Op first
jest.mock('sequelize', () => ({
  Op: {
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    in: Symbol('in'),
    gt: Symbol('gt'),
    regexp: Symbol('regexp'),
    notRegexp: Symbol('notRegexp'),
    or: Symbol('or')
  }
}));

// Mock models to prevent Sequelize initialization
jest.mock('../models', () => ({
  DonationModel: {
    findAndCountAll: jest.fn(),
    sequelize: {
      fn: jest.fn(),
      col: jest.fn(),
      where: jest.fn()
    }
  },
  DonorModel: {},
  CampaignModel: {},
  FundModel: {}
}));

import {
  buildUniversalFilter,
  buildDateRangeFilter,
  UniversalFilter,
  DateRangeFilter
} from '../queryBuilder';
import { Op } from 'sequelize';

describe('Query Builder', () => {
  describe('buildDateRangeFilter', () => {
    test('should handle empty date range', () => {
      const filter = buildDateRangeFilter();
      expect(filter).toEqual({});
    });

    test('should handle undefined date range', () => {
      const filter = buildDateRangeFilter(undefined);
      expect(filter).toEqual({});
    });


    test('should build filter with start date only', () => {
      const dateRange: DateRangeFilter = {
        startDate: '2024-01-01'
      };

      const filter = buildDateRangeFilter(dateRange);

      expect(filter).toEqual({
        donationDate: {
          [Op.gte]: new Date('2024-01-01')
        }
      });
    });

    test('should build filter with end date only', () => {
      const dateRange: DateRangeFilter = {
        endDate: '2024-12-31'
      };

      const filter = buildDateRangeFilter(dateRange);

      expect(filter).toEqual({
        donationDate: {
          [Op.lte]: new Date('2024-12-31')
        }
      });
    });

    test('should build filter with both start and end dates', () => {
      const dateRange: DateRangeFilter = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const filter = buildDateRangeFilter(dateRange);

      expect(filter).toEqual({
        donationDate: {
          [Op.gte]: new Date('2024-01-01'),
          [Op.lte]: new Date('2024-12-31')
        }
      });
    });

    test('should handle Date objects', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const dateRange: DateRangeFilter = {
        startDate,
        endDate
      };

      const filter = buildDateRangeFilter(dateRange);

      expect(filter).toEqual({
        donationDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      });
    });
  });

  describe('buildUniversalFilter', () => {
    test('should handle empty filter', () => {
      const filter = buildUniversalFilter({});
      expect(filter).toEqual({});
    });

    test('should build filter with campaign IDs', () => {
      const universalFilter: UniversalFilter = {
        campaignIds: ['campaign-1', 'campaign-2']
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        campaignId: { [Op.in]: ['campaign-1', 'campaign-2'] }
      });
    });

    test('should build filter with fund IDs', () => {
      const universalFilter: UniversalFilter = {
        fundIds: ['fund-1', 'fund-2']
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        fundId: { [Op.in]: ['fund-1', 'fund-2'] }
      });
    });

    test('should build filter with donor IDs', () => {
      const universalFilter: UniversalFilter = {
        donorIds: ['donor-1', 'donor-2']
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        donorId: { [Op.in]: ['donor-1', 'donor-2'] }
      });
    });

    test('should build filter with status array', () => {
      const universalFilter: UniversalFilter = {
        status: ['completed', 'pending']
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        status: { [Op.in]: ['completed', 'pending'] }
      });
    });

    test('should build filter with payment methods', () => {
      const universalFilter: UniversalFilter = {
        paymentMethods: ['credit_card', 'bank_transfer']
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        paymentMethod: { [Op.in]: ['credit_card', 'bank_transfer'] }
      });
    });

    test('should build filter with frequency array', () => {
      const universalFilter: UniversalFilter = {
        frequency: [0, 1]
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        frequency: { [Op.in]: [0, 1] }
      });
    });

    test('should build filter with amount range (min only)', () => {
      const universalFilter: UniversalFilter = {
        minAmount: 100
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        amount: { [Op.gte]: 100 }
      });
    });

    test('should build filter with amount range (max only)', () => {
      const universalFilter: UniversalFilter = {
        maxAmount: 1000
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        amount: { [Op.lte]: 1000 }
      });
    });

    test('should build filter with amount range (both min and max)', () => {
      const universalFilter: UniversalFilter = {
        minAmount: 100,
        maxAmount: 1000
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        amount: {
          [Op.gte]: 100,
          [Op.lte]: 1000
        }
      });
    });

    test('should build complex filter with multiple conditions', () => {
      const universalFilter: UniversalFilter = {
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        campaignIds: ['campaign-1'],
        fundIds: ['fund-1', 'fund-2'],
        status: ['completed'],
        minAmount: 50,
        maxAmount: 500
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        donationDate: {
          [Op.gte]: new Date('2024-01-01'),
          [Op.lte]: new Date('2024-12-31')
        },
        campaignId: { [Op.in]: ['campaign-1'] },
        fundId: { [Op.in]: ['fund-1', 'fund-2'] },
        status: { [Op.in]: ['completed'] },
        amount: {
          [Op.gte]: 50,
          [Op.lte]: 500
        }
      });
    });

    test('should ignore empty arrays', () => {
      const universalFilter: UniversalFilter = {
        campaignIds: [],
        fundIds: [],
        donorIds: []
      };

      const filter = buildUniversalFilter(universalFilter);
      expect(filter).toEqual({});
    });

    test('should handle undefined amount values correctly', () => {
      const universalFilter: UniversalFilter = {
        minAmount: 0, // Should be included (0 is valid)
        maxAmount: undefined
      };

      const filter = buildUniversalFilter(universalFilter);

      expect(filter).toEqual({
        amount: { [Op.gte]: 0 }
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined values gracefully', () => {
      const universalFilter: UniversalFilter = {
        campaignIds: null as any,
        fundIds: undefined,
        dateRange: null as any
      };

      const filter = buildUniversalFilter(universalFilter);
      expect(filter).toEqual({});
    });

    test('should handle invalid date strings', () => {
      const dateRange: DateRangeFilter = {
        startDate: 'invalid-date',
        endDate: 'also-invalid'
      };

      const filter = buildDateRangeFilter(dateRange);

      // Should still create Date objects (which will be Invalid Date)
      expect(filter.donationDate).toBeDefined();
      expect(filter.donationDate[Op.gte]).toBeInstanceOf(Date);
      expect(filter.donationDate[Op.lte]).toBeInstanceOf(Date);
    });

    test('should preserve filter immutability', () => {
      const originalFilter: UniversalFilter = {
        campaignIds: ['campaign-1']
      };

      const builtFilter = buildUniversalFilter(originalFilter);

      // Modifying built filter should not affect original
      builtFilter.newProperty = 'test' as any;

      expect(originalFilter).not.toHaveProperty('newProperty');
    });
  });
});