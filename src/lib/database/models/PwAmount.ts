import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwAmountAttributes {
  id?: number;
  appeal_id: number;
  fundlist_id?: string;
  name: string;
  amount: number;
  sort: number;
  donationtype: string;
  featured: number;
  disable: number;
}

interface PwAmountCreationAttributes extends Optional<PwAmountAttributes, 'id' | 'fundlist_id'> {}

class PwAmount extends Model<PwAmountAttributes, PwAmountCreationAttributes> implements PwAmountAttributes {
  public id!: number;
  public appeal_id!: number;
  public fundlist_id!: string;
  public name!: string;
  public amount!: number;
  public sort!: number;
  public donationtype!: string;
  public featured!: number;
  public disable!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwAmount.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    appeal_id: { type: DataTypes.INTEGER, allowNull: false },
    fundlist_id: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DOUBLE, allowNull: false },
    sort: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    donationtype: { type: DataTypes.STRING, allowNull: false },
    featured: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    disable: { type: DataTypes.TINYINT, allowNull: false }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_amount',
    timestamps: true,
    underscored: false,
  }
);

export default PwAmount;
export type { PwAmountAttributes, PwAmountCreationAttributes };
