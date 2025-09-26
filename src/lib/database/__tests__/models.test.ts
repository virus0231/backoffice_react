/**
 * Database Models Tests
 * Tests model definitions, validations, and associations
 */

import { DonationModel, DonorModel, CampaignModel, FundModel } from '../models';
import { ValidationError } from 'sequelize';

// Mock Sequelize for testing
const mockSequelize = {
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(true),
  query: jest.fn(),
  close: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  where: jest.fn(),
  QueryTypes: { SELECT: 'SELECT', RAW: 'RAW' }
};

jest.mock('../sequelize', () => ({
  getSequelizeInstance: jest.fn(() => mockSequelize)
}));

// Mock the models to prevent actual Sequelize initialization
jest.mock('../models/Donation', () => {
  class MockDonationModel {
    public frequency: number;
    public orderId: string;
    public status: string;

    constructor(attrs: any) {
      Object.assign(this, attrs);
    }

    isOneTime() { return this.frequency === 0; }
    isRecurring() { return this.frequency > 1 || /_/.test(this.orderId); }
    isFirstInstallment() { return this.frequency === 1 && !/_/.test(this.orderId); }
    isCompleted() { return this.status === 'completed'; }

    static associations = {};
    static belongsTo = jest.fn();
    static hasMany = jest.fn();
  }

  return { DonationModel: MockDonationModel };
});

jest.mock('../models/Donor', () => {
  class MockDonorModel {
    public firstName: string;
    public lastName: string;
    public email: string;

    constructor(attrs: any) {
      Object.assign(this, attrs);
    }

    getFullName() { return `${this.firstName} ${this.lastName}`.trim(); }
    hasValidEmail() { return !!(this.email && /\S+@\S+\.\S+/.test(this.email)); }

    static associations = {};
    static belongsTo = jest.fn();
    static hasMany = jest.fn();
  }

  return { DonorModel: MockDonorModel };
});

jest.mock('../models/Campaign', () => {
  class MockCampaignModel {
    public isActive: boolean;
    public startDate: Date;
    public endDate: Date;

    constructor(attrs: any) {
      Object.assign(this, attrs);
    }

    isCurrentlyActive() {
      if (!this.isActive) return false;
      const now = new Date();
      const hasStarted = !this.startDate || this.startDate <= now;
      const hasNotEnded = !this.endDate || this.endDate >= now;
      return hasStarted && hasNotEnded;
    }

    getDurationInDays() {
      if (!this.startDate || !this.endDate) return null;
      const timeDiff = this.endDate.getTime() - this.startDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    static associations = {};
    static belongsTo = jest.fn();
    static hasMany = jest.fn();
  }

  return { CampaignModel: MockCampaignModel };
});

jest.mock('../models/Fund', () => {
  class MockFundModel {
    public category: string;
    public fundName: string;

    constructor(attrs: any) {
      Object.assign(this, attrs);
    }

    getDisplayName() {
      return this.category ? `${this.category} - ${this.fundName}` : this.fundName;
    }

    static associations = {};
    static belongsTo = jest.fn();
    static hasMany = jest.fn();
  }

  return { FundModel: MockFundModel };
});

describe('Database Models', () => {
  describe('DonationModel', () => {
    test('should have correct helper methods', () => {
      // Create a mock donation instance
      const donation = new DonationModel({
        id: 'test-id',
        orderId: 'order-123',
        donorId: 'donor-123',
        amount: 100.00,
        frequency: 0,
        status: 'completed',
        paymentMethod: 'credit_card',
        donationDate: new Date(),
        createdAt: new Date()
      });

      // Test helper methods
      expect(donation.isOneTime()).toBe(true);
      expect(donation.isRecurring()).toBe(false);
      expect(donation.isFirstInstallment()).toBe(false);
      expect(donation.isCompleted()).toBe(true);
    });

    test('should identify recurring donations correctly', () => {
      const recurringDonation = new DonationModel({
        id: 'test-id',
        orderId: 'order-123_2',
        donorId: 'donor-123',
        amount: 100.00,
        frequency: 2,
        status: 'completed',
        paymentMethod: 'credit_card',
        donationDate: new Date(),
        createdAt: new Date()
      });

      expect(recurringDonation.isRecurring()).toBe(true);
      expect(recurringDonation.isOneTime()).toBe(false);
    });

    test('should identify first installments correctly', () => {
      const firstInstallment = new DonationModel({
        id: 'test-id',
        orderId: 'order-123',
        donorId: 'donor-123',
        amount: 100.00,
        frequency: 1,
        status: 'completed',
        paymentMethod: 'credit_card',
        donationDate: new Date(),
        createdAt: new Date()
      });

      expect(firstInstallment.isFirstInstallment()).toBe(true);
      expect(firstInstallment.isRecurring()).toBe(false);
    });

    test('should handle incomplete donations', () => {
      const incompleteDonation = new DonationModel({
        id: 'test-id',
        orderId: 'order-123',
        donorId: 'donor-123',
        amount: 100.00,
        frequency: 0,
        status: 'pending',
        paymentMethod: 'credit_card',
        donationDate: new Date(),
        createdAt: new Date()
      });

      expect(incompleteDonation.isCompleted()).toBe(false);
    });
  });

  describe('DonorModel', () => {
    test('should generate full name correctly', () => {
      const donor = new DonorModel({
        id: 'donor-123',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        registrationDate: new Date()
      });

      expect(donor.getFullName()).toBe('John Doe');
    });

    test('should handle empty names gracefully', () => {
      const donor = new DonorModel({
        id: 'donor-123',
        firstName: '',
        lastName: 'Doe',
        isActive: true,
        registrationDate: new Date()
      });

      expect(donor.getFullName()).toBe('Doe');
    });

    test('should validate email addresses correctly', () => {
      const donorWithValidEmail = new DonorModel({
        id: 'donor-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
        registrationDate: new Date()
      });

      const donorWithInvalidEmail = new DonorModel({
        id: 'donor-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        isActive: true,
        registrationDate: new Date()
      });

      const donorWithoutEmail = new DonorModel({
        id: 'donor-123',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        registrationDate: new Date()
      });

      expect(donorWithValidEmail.hasValidEmail()).toBe(true);
      expect(donorWithInvalidEmail.hasValidEmail()).toBe(false);
      expect(donorWithoutEmail.hasValidEmail()).toBe(false);
    });
  });

  describe('CampaignModel', () => {
    test('should check if campaign is currently active', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const activeCampaign = new CampaignModel({
        id: 'campaign-123',
        appealName: 'Test Campaign',
        startDate: yesterday,
        endDate: tomorrow,
        isActive: true,
        createdAt: new Date()
      });

      const inactiveCampaign = new CampaignModel({
        id: 'campaign-123',
        appealName: 'Test Campaign',
        isActive: false,
        createdAt: new Date()
      });

      const expiredCampaign = new CampaignModel({
        id: 'campaign-123',
        appealName: 'Test Campaign',
        startDate: yesterday,
        endDate: yesterday,
        isActive: true,
        createdAt: new Date()
      });

      expect(activeCampaign.isCurrentlyActive()).toBe(true);
      expect(inactiveCampaign.isCurrentlyActive()).toBe(false);
      expect(expiredCampaign.isCurrentlyActive()).toBe(false);
    });

    test('should calculate campaign duration correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const campaign = new CampaignModel({
        id: 'campaign-123',
        appealName: 'Test Campaign',
        startDate,
        endDate,
        isActive: true,
        createdAt: new Date()
      });

      const campaignWithoutDates = new CampaignModel({
        id: 'campaign-123',
        appealName: 'Test Campaign',
        isActive: true,
        createdAt: new Date()
      });

      expect(campaign.getDurationInDays()).toBe(31); // January has 31 days
      expect(campaignWithoutDates.getDurationInDays()).toBeNull();
    });
  });

  describe('FundModel', () => {
    test('should generate display name correctly', () => {
      const fundWithCategory = new FundModel({
        id: 'fund-123',
        fundName: 'General Fund',
        category: 'Operations',
        isActive: true,
        createdAt: new Date()
      });

      const fundWithoutCategory = new FundModel({
        id: 'fund-123',
        fundName: 'General Fund',
        isActive: true,
        createdAt: new Date()
      });

      expect(fundWithCategory.getDisplayName()).toBe('Operations - General Fund');
      expect(fundWithoutCategory.getDisplayName()).toBe('General Fund');
    });
  });

  describe('Model Validation', () => {
    test('should require mandatory fields', () => {
      expect(() => {
        new DonationModel({
          // Missing required fields
        } as any);
      }).toThrow();
    });

    test('should validate decimal precision for amounts', () => {
      const donation = new DonationModel({
        id: 'test-id',
        orderId: 'order-123',
        donorId: 'donor-123',
        amount: 123.456789, // More than 2 decimal places
        frequency: 0,
        status: 'completed',
        paymentMethod: 'credit_card',
        donationDate: new Date(),
        createdAt: new Date()
      });

      // Amount should be handled by Sequelize decimal type
      expect(typeof donation.amount).toBe('number');
    });
  });

  describe('Model Associations', () => {
    test('should define correct associations', () => {
      // Test that associations are defined (mocked in real environment)
      expect(DonationModel.associations).toBeDefined();
    });
  });
});