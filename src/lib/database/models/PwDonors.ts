import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwDonorsAttributes {
  id?: number;
  stripe_id: string;
  fourdigit: string;
  email: string;
  firstname: string;
  lastname: string;
  organization: string;
  add1: string;
  add2: string;
  city: string;
  country: string;
  postcode: string;
  phone: string;
  giftaid: string;
  newsletter: string;
  Date_Added: Date;
  Last_Modified: Date;
}

interface PwDonorsCreationAttributes extends Optional<PwDonorsAttributes, 'id'> {}

class PwDonors extends Model<PwDonorsAttributes, PwDonorsCreationAttributes> implements PwDonorsAttributes {
  public id!: number;
  public stripe_id!: string;
  public fourdigit!: string;
  public email!: string;
  public firstname!: string;
  public lastname!: string;
  public organization!: string;
  public add1!: string;
  public add2!: string;
  public city!: string;
  public country!: string;
  public postcode!: string;
  public phone!: string;
  public giftaid!: string;
  public newsletter!: string;
  public Date_Added!: Date;
  public Last_Modified!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwDonors.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    stripe_id: { type: DataTypes.STRING, allowNull: false, defaultValue: 0 },
    fourdigit: { type: DataTypes.STRING, allowNull: false, defaultValue: "xxxx" },
    email: { type: DataTypes.STRING, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    organization: { type: DataTypes.STRING, allowNull: false },
    add1: { type: DataTypes.STRING, allowNull: false },
    add2: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    postcode: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    giftaid: { type: DataTypes.STRING, allowNull: false },
    newsletter: { type: DataTypes.STRING, allowNull: false },
    Date_Added: { type: DataTypes.DATE, allowNull: false },
    Last_Modified: { type: DataTypes.DATE, allowNull: false, defaultValue: "current_timestamp()" }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_donors',
    timestamps: true,
    underscored: false,
  }
);

export default PwDonors;
export type { PwDonorsAttributes, PwDonorsCreationAttributes };
