import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwTransactionDetailsAttributes {
  id?: number;
  TID: number;
  appeal_id: number;
  amount_id: number;
  fundlist_id: number;
  sf_id: string;
  amount: number;
  quantity: number;
  freq: number;
  startdate: Date;
  totalcount: number;
  currency: string;
  date: Date;
}

interface PwTransactionDetailsCreationAttributes extends Optional<PwTransactionDetailsAttributes, 'id'> {}

class PwTransactionDetails extends Model<PwTransactionDetailsAttributes, PwTransactionDetailsCreationAttributes> implements PwTransactionDetailsAttributes {
  public id!: number;
  public TID!: number;
  public appeal_id!: number;
  public amount_id!: number;
  public fundlist_id!: number;
  public sf_id!: string;
  public amount!: number;
  public quantity!: number;
  public freq!: number;
  public startdate!: Date;
  public totalcount!: number;
  public currency!: string;
  public date!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwTransactionDetails.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    TID: { type: DataTypes.INTEGER, allowNull: false },
    appeal_id: { type: DataTypes.INTEGER, allowNull: false },
    amount_id: { type: DataTypes.INTEGER, allowNull: false },
    fundlist_id: { type: DataTypes.INTEGER, allowNull: false },
    sf_id: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    freq: { type: DataTypes.INTEGER, allowNull: false },
    startdate: { type: DataTypes.DATE, allowNull: false, defaultValue: "current_timestamp()" },
    totalcount: { type: DataTypes.INTEGER, allowNull: false },
    currency: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: "current_timestamp()" }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_transaction_details',
    timestamps: true,
    underscored: false,
  }
);

export default PwTransactionDetails;
export type { PwTransactionDetailsAttributes, PwTransactionDetailsCreationAttributes };
