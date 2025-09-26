/**
 * Donation Model - Maps to pw_transactions table
 * Represents donation transactions with donor, campaign, and fund relationships
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

// Donation attributes interface
export interface DonationAttributes {
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

// Optional fields for creation
interface DonationCreationAttributes extends Optional<DonationAttributes, 'id' | 'createdAt'> {}

// Sequelize Model class
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

  // Helper methods for donation type identification
  public isOneTime(): boolean {
    return this.frequency === 0;
  }

  public isRecurring(): boolean {
    return this.frequency > 1 || /_/.test(this.orderId);
  }

  public isFirstInstallment(): boolean {
    return this.frequency === 1 && !/_/.test(this.orderId);
  }

  public isCompleted(): boolean {
    return this.status === 'completed';
  }
}

// Initialize the model
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
  sequelize: getSequelizeInstance(),
  tableName: 'pw_transactions',
  timestamps: false,
  indexes: [
    {
      fields: ['donation_date']
    },
    {
      fields: ['member_id']
    },
    {
      fields: ['appeal_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default DonationModel;