/**
 * Donor Model - Maps to pw_donors table
 * Represents donor information and contact details
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

// Donor attributes interface
export interface DonorAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isActive: boolean;
  registrationDate: Date;
  lastDonationDate?: Date;
}

// Optional fields for creation
interface DonorCreationAttributes extends Optional<DonorAttributes, 'id'> {}

// Sequelize Model class
export class DonorModel extends Model<DonorAttributes, DonorCreationAttributes>
  implements DonorAttributes {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email?: string;
  public phone?: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public zipCode?: string;
  public country?: string;
  public isActive!: boolean;
  public registrationDate!: Date;
  public lastDonationDate?: Date;

  // Helper methods
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  public hasValidEmail(): boolean {
    return !!(this.email && /\S+@\S+\.\S+/.test(this.email));
  }
}

// Initialize the model
DonorModel.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    field: 'id'
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'email',
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'address'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'city'
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'state'
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zip_code'
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'country'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  registrationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'registration_date'
  },
  lastDonationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_donation_date'
  }
}, {
  sequelize: getSequelizeInstance(),
  tableName: 'pw_donors',
  timestamps: false,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['last_name', 'first_name']
    },
    {
      fields: ['registration_date']
    }
  ]
});

export default DonorModel;