import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwAppealAttributes {
  id?: number;
  wp_id: number;
  name: string;
  description: string;
  image: string;
  ishome_v: number;
  country: string;
  cause: string;
  category: number;
  goal: number;
  sort: number;
  isfooter: number;
  isdonate_v: number;
  isother_v: number;
  isquantity_v: number;
  isassociate: number;
  isdropdown_v: number;
  isrecurring_v: number;
  recurring_interval: string;
  recurring_payments?: string;
  type: string;
  disable?: number;
}

interface PwAppealCreationAttributes extends Optional<PwAppealAttributes, 'id' | 'recurring_payments' | 'disable'> {}

class PwAppeal extends Model<PwAppealAttributes, PwAppealCreationAttributes> implements PwAppealAttributes {
  public id!: number;
  public wp_id!: number;
  public name!: string;
  public description!: string;
  public image!: string;
  public ishome_v!: number;
  public country!: string;
  public cause!: string;
  public category!: number;
  public goal!: number;
  public sort!: number;
  public isfooter!: number;
  public isdonate_v!: number;
  public isother_v!: number;
  public isquantity_v!: number;
  public isassociate!: number;
  public isdropdown_v!: number;
  public isrecurring_v!: number;
  public recurring_interval!: string;
  public recurring_payments!: string;
  public type!: string;
  public disable!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwAppeal.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    wp_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    ishome_v: { type: DataTypes.TINYINT, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    cause: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.INTEGER, allowNull: false },
    goal: { type: DataTypes.DOUBLE, allowNull: false },
    sort: { type: DataTypes.FLOAT, allowNull: false },
    isfooter: { type: DataTypes.TINYINT, allowNull: false },
    isdonate_v: { type: DataTypes.TINYINT, allowNull: false },
    isother_v: { type: DataTypes.TINYINT, allowNull: false },
    isquantity_v: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isassociate: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isdropdown_v: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isrecurring_v: { type: DataTypes.TINYINT, allowNull: false },
    recurring_interval: { type: DataTypes.TEXT, allowNull: false },
    recurring_payments: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING, allowNull: false },
    disable: { type: DataTypes.TINYINT, defaultValue: 0 }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_appeal',
    timestamps: true,
    underscored: false,
  }
);

export default PwAppeal;
export type { PwAppealAttributes, PwAppealCreationAttributes };
