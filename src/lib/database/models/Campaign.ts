/**
 * Campaign Model - Maps to pw_appeal table
 * Represents fundraising campaigns and appeals
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

// Campaign attributes interface
export interface CampaignAttributes {
  id: string;
  appealName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  goalAmount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Optional fields for creation
interface CampaignCreationAttributes extends Optional<CampaignAttributes, 'id' | 'createdAt'> {}

// Sequelize Model class
export class CampaignModel extends Model<CampaignAttributes, CampaignCreationAttributes>
  implements CampaignAttributes {
  public id!: string;
  public appealName!: string;
  public description?: string;
  public startDate?: Date;
  public endDate?: Date;
  public goalAmount?: number;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt?: Date;

  // Helper methods
  public isCurrentlyActive(): boolean {
    if (!this.isActive) return false;

    const now = new Date();
    const hasStarted = !this.startDate || this.startDate <= now;
    const hasNotEnded = !this.endDate || this.endDate >= now;

    return hasStarted && hasNotEnded;
  }

  public getDurationInDays(): number | null {
    if (!this.startDate || !this.endDate) return null;

    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}

// Initialize the model
CampaignModel.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'id'
  },
  appealName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'appeal_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  goalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'goal_amount'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'updated_at'
  }
}, {
  sequelize: getSequelizeInstance(),
  tableName: 'pw_appeal',
  timestamps: false,
  indexes: [
    {
      fields: ['appeal_name']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['start_date', 'end_date']
    }
  ]
});

export default CampaignModel;