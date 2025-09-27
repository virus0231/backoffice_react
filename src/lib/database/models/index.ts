/**
 * Database Models Index
 * Exports all database models and initializes associations
 */

import { DonationModel } from './Donation';
import { DonorModel } from './Donor';
import { CampaignModel } from './Campaign';
import { FundModel } from './Fund';
import { initializeAssociations } from './associations';

// Initialize associations
initializeAssociations();

// Export all models
export {
  DonationModel,
  DonorModel,
  CampaignModel,
  FundModel,
  // Alias for tests expecting named `Fund`
  FundModel as Fund
};

// Export model interfaces
export type { DonationAttributes } from './Donation';
export type { DonorAttributes } from './Donor';
export type { CampaignAttributes } from './Campaign';
export type { FundAttributes } from './Fund';

// Export default for convenience
const DatabaseModels = {
  Donation: DonationModel,
  Donor: DonorModel,
  Campaign: CampaignModel,
  Fund: FundModel
};

export default DatabaseModels;
