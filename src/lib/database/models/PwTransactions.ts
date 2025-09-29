import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwTransactionsAttributes {
  id?: number;
  DID: number;
  TID: string;
  order_id: string;
  paya_reference: string;
  charge_id?: string;
  hash_verified: number;
  card_fee: number;
  charge_amount: number;
  totalamount: number;
  refund: string;
  reason: string;
  notes?: string;
  paymenttype: string;
  status: string;
  date: Date;
}

interface PwTransactionsCreationAttributes extends Optional<PwTransactionsAttributes, 'id' | 'charge_id' | 'notes'> {}

class PwTransactions extends Model<PwTransactionsAttributes, PwTransactionsCreationAttributes> implements PwTransactionsAttributes {
  public id!: number;
  public DID!: number;
  public TID!: string;
  public order_id!: string;
  public paya_reference!: string;
  public charge_id!: string;
  public hash_verified!: number;
  public card_fee!: number;
  public charge_amount!: number;
  public totalamount!: number;
  public refund!: string;
  public reason!: string;
  public notes!: string;
  public paymenttype!: string;
  public status!: string;
  public date!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwTransactions.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    DID: { type: DataTypes.INTEGER, allowNull: false },
    TID: { type: DataTypes.STRING, allowNull: false },
    order_id: { type: DataTypes.STRING, allowNull: false },
    paya_reference: { type: DataTypes.STRING, allowNull: false },
    charge_id: { type: DataTypes.STRING },
    hash_verified: { type: DataTypes.TINYINT, allowNull: false },
    card_fee: { type: DataTypes.FLOAT, allowNull: false },
    charge_amount: { type: DataTypes.FLOAT, allowNull: false },
    totalamount: { type: DataTypes.FLOAT, allowNull: false },
    refund: { type: DataTypes.STRING, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    notes: { type: DataTypes.TEXT },
    paymenttype: { type: DataTypes.STRING, allowNull: false, defaultValue: "cc" },
    status: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: "current_timestamp()" }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_transactions',
    timestamps: true,
    underscored: false,
  }
);

export default PwTransactions;
export type { PwTransactionsAttributes, PwTransactionsCreationAttributes };
