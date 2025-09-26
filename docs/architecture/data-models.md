# Data Models

This section defines the core data entities and their relationships, providing TypeScript interfaces for frontend use and Sequelize models for backend operations. The data models directly mirror the existing phpMySQL database structure while adding TypeScript type safety.

## Core Data Entities

Based on the existing database schema (`mausayoc_new.sql`) and query patterns (`queries.md`), the system operates on these primary entities:

### Donation Entity
```typescript
interface Donation {
  id: string;                    // pw_transactions.id
  orderId: string;              // pw_transactions.order_id
  donorId: string;              // pw_transactions.member_id
  campaignId?: string;          // pw_transactions.appeal_id
  fundId?: string;              // pw_transactions.fundlist_id
  amount: number;               // pw_transactions.amount
  frequency: number;            // pw_transactions.freq (0=one-time, 1=first installment, >1=recurring)
  status: 'completed' | 'pending' | 'failed'; // pw_transactions.status
  paymentMethod: string;        // pw_transactions.payment_method
  donationDate: Date;           // pw_transactions.donation_date
  createdAt: Date;              // pw_transactions.created_at
  isFirstInstallment: boolean;  // Derived from order_id NOT REGEXP '_'
}
```

### Donor Entity
```typescript
interface Donor {
  id: string;                   // pw_donors.id
  firstName: string;            // pw_donors.first_name
  lastName: string;             // pw_donors.last_name
  email: string;                // pw_donors.email
  phone?: string;               // pw_donors.phone
  address?: string;             // pw_donors.address
  city?: string;                // pw_donors.city
  state?: string;               // pw_donors.state
  zipCode?: string;             // pw_donors.zip_code
  country: string;              // pw_donors.country
  registrationDate: Date;       // pw_donors.created_at
  totalDonated: number;         // Calculated field
  donationCount: number;        // Calculated field
  lastDonationDate?: Date;      // Calculated field
}
```

### Campaign Entity (Appeal)
```typescript
interface Campaign {
  id: string;                   // pw_appeal.id
  name: string;                 // pw_appeal.appeal_name
  description?: string;         // pw_appeal.description
  startDate: Date;              // pw_appeal.start_date
  endDate?: Date;               // pw_appeal.end_date
  goalAmount?: number;          // pw_appeal.goal_amount
  status: 'active' | 'paused' | 'completed'; // pw_appeal.status
  createdAt: Date;              // pw_appeal.created_at
  totalRaised: number;          // Calculated field
  donorCount: number;           // Calculated field
}
```

### Fund Entity
```typescript
interface Fund {
  id: string;                   // pw_fundlist.id
  name: string;                 // pw_fundlist.fund_name
  description?: string;         // pw_fundlist.description
  category?: string;            // pw_fundlist.category
  isActive: boolean;            // pw_fundlist.is_active
  createdAt: Date;              // pw_fundlist.created_at
  totalRaised: number;          // Calculated field
  donorCount: number;           // Calculated field
}
```

## Sequelize Model Definitions

### Donation Model
```typescript
// packages/database/models/Donation.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';

interface DonationAttributes {
  id: string;
  orderId: string;
  donorId: string;
  campaignId?: string;
  fundId?: string;
  amount: number;
  frequency: number;
  status: string;
  paymentMethod: string;
  donationDate: Date;
  createdAt: Date;
}

interface DonationCreationAttributes extends Optional<DonationAttributes, 'id' | 'createdAt'> {}

export class DonationModel extends Model<DonationAttributes, DonationCreationAttributes>
  implements DonationAttributes {
  public id!: string;
  public orderId!: string;
  public donorId!: string;
  public campaignId?: string;
  public fundId?: string;
  public amount!: number;
  public frequency!: number;
  public status!: string;
  public paymentMethod!: string;
  public donationDate!: Date;
  public createdAt!: Date;

  // Associations
  public readonly donor?: DonorModel;
  public readonly campaign?: CampaignModel;
  public readonly fund?: FundModel;
}

DonationModel.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'id'
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'order_id'
  },
  donorId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'member_id'
  },
  campaignId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'appeal_id'
  },
  fundId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'fundlist_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'freq'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'status'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'payment_method'
  },
  donationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'donation_date'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  }
}, {
  sequelize,
  tableName: 'pw_transactions',
  timestamps: false
});
```

## Model Relationships

```typescript
// packages/database/associations.ts
import { DonationModel } from './models/Donation';
import { DonorModel } from './models/Donor';
import { CampaignModel } from './models/Campaign';
import { FundModel } from './models/Fund';

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

// Donation belongs to Campaign
DonationModel.belongsTo(CampaignModel, {
  foreignKey: 'campaignId',
  as: 'campaign'
});

// Campaign has many Donations
CampaignModel.hasMany(DonationModel, {
  foreignKey: 'campaignId',
  as: 'donations'
});

// Donation belongs to Fund
DonationModel.belongsTo(FundModel, {
  foreignKey: 'fundId',
  as: 'fund'
});

// Fund has many Donations
FundModel.hasMany(DonationModel, {
  foreignKey: 'fundId',
  as: 'donations'
});
```

## Calculated Fields and Query Helpers

```typescript
// packages/database/helpers/calculatedFields.ts
import { DonationModel, DonorModel } from '../models';
import { Op } from 'sequelize';

export class CalculatedFields {
  /**
   * Calculate total raised for a time period
   * Includes first installments: freq=1 AND order_id NOT REGEXP '_'
   * Includes one-time donations: freq=0
   */
  static async getTotalRaised(startDate: Date, endDate: Date): Promise<number> {
    const result = await DonationModel.sum('amount', {
      where: {
        donationDate: {
          [Op.between]: [startDate, endDate]
        },
        status: 'completed',
        [Op.or]: [
          { frequency: 0 }, // One-time donations
          {
            frequency: 1,
            orderId: {
              [Op.notRegexp]: '_' // First installments
            }
          }
        ]
      }
    });
    return result || 0;
  }

  /**
   * Calculate donor metrics with lifetime value
   */
  static async getDonorMetrics(donorId: string) {
    const totalDonated = await DonationModel.sum('amount', {
      where: {
        donorId,
        status: 'completed'
      }
    });

    const donationCount = await DonationModel.count({
      where: {
        donorId,
        status: 'completed'
      }
    });

    const lastDonation = await DonationModel.findOne({
      where: {
        donorId,
        status: 'completed'
      },
      order: [['donationDate', 'DESC']]
    });

    return {
      totalDonated: totalDonated || 0,
      donationCount,
      lastDonationDate: lastDonation?.donationDate
    };
  }
}
```
