/**
 * Model Associations
 * Defines relationships between database models
 */

import { DonationModel } from './Donation';
import { DonorModel } from './Donor';
import { CampaignModel } from './Campaign';
import { FundModel } from './Fund';

/**
 * Initialize all model associations
 */
export function initializeAssociations(): void {
  // Donation belongs to Donor
  DonationModel.belongsTo(DonorModel, {
    foreignKey: 'donorId',
    as: 'donor'
  });

  // Donor has many Donations
  DonorModel.hasMany(DonationModel, {
    foreignKey: 'donorId',
    as: 'donations'
  });

  // Donation belongs to Campaign (optional)
  DonationModel.belongsTo(CampaignModel, {
    foreignKey: 'campaignId',
    as: 'campaign'
  });

  // Campaign has many Donations
  CampaignModel.hasMany(DonationModel, {
    foreignKey: 'campaignId',
    as: 'donations'
  });

  // Donation belongs to Fund (optional)
  DonationModel.belongsTo(FundModel, {
    foreignKey: 'fundId',
    as: 'fund'
  });

  // Fund has many Donations
  FundModel.hasMany(DonationModel, {
    foreignKey: 'fundId',
    as: 'donations'
  });
}