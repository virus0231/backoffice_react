/**
 * Fund Model - Maps to pw_fundlist table
 * Represents fund categories for donations
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

// Fund attributes interface
export interface FundAttributes {
  id: string;
  fundName: string;
  description?: string;
  category?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt: Date;
}

// Optional fields for creation
interface FundCreationAttributes extends Optional<FundAttributes, 'id' | 'createdAt'> {}

// Sequelize Model class
export class FundModel extends Model<FundAttributes, FundCreationAttributes>
  implements FundAttributes {
  public id!: string;
  public fundName!: string;
  public description?: string;
  public category?: string;
  public isActive!: boolean;
  public displayOrder?: number;
  public createdAt!: Date;

  // Helper methods
  public getDisplayName(): string {
    return this.category ? `${this.category} - ${this.fundName}` : this.fundName;
  }
}

// Initialize the model
FundModel.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'id'
  },
  fundName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'fund_name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'category'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'display_order'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  }
}, {
  sequelize: getSequelizeInstance(),
  tableName: 'pw_fundlist',
  timestamps: false,
  indexes: [
    {
      fields: ['fund_name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['display_order']
    }
  ]
});

export default FundModel;