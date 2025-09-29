import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwStripeScheduleAttributes {
  id?: number;
  did: number;
  tid: number;
  td_id?: number;
  tr_no: string;
  order_id: string;
  token: string;
  plan_id?: string;
  sub_id?: string;
  amount: number;
  quantity: number;
  cccharges: number;
  frequency: string;
  startdate: Date;
  r_interval: number;
  totalcount: number;
  remainingcount: number;
  nextrun_date: Date;
  status: string;
  date: Date;
}

interface PwStripeScheduleCreationAttributes extends Optional<PwStripeScheduleAttributes, 'id' | 'td_id' | 'plan_id' | 'sub_id'> {}

class PwStripeSchedule extends Model<PwStripeScheduleAttributes, PwStripeScheduleCreationAttributes> implements PwStripeScheduleAttributes {
  public id!: number;
  public did!: number;
  public tid!: number;
  public td_id!: number;
  public tr_no!: string;
  public order_id!: string;
  public token!: string;
  public plan_id!: string;
  public sub_id!: string;
  public amount!: number;
  public quantity!: number;
  public cccharges!: number;
  public frequency!: string;
  public startdate!: Date;
  public r_interval!: number;
  public totalcount!: number;
  public remainingcount!: number;
  public nextrun_date!: Date;
  public status!: string;
  public date!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwStripeSchedule.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    did: { type: DataTypes.INTEGER, allowNull: false },
    tid: { type: DataTypes.INTEGER, allowNull: false },
    td_id: { type: DataTypes.INTEGER },
    tr_no: { type: DataTypes.STRING, allowNull: false },
    order_id: { type: DataTypes.STRING, allowNull: false },
    token: { type: DataTypes.TEXT, allowNull: false },
    plan_id: { type: DataTypes.STRING },
    sub_id: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    cccharges: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    frequency: { type: DataTypes.STRING, allowNull: false },
    startdate: { type: DataTypes.DATEONLY, allowNull: false },
    r_interval: { type: DataTypes.INTEGER, allowNull: false },
    totalcount: { type: DataTypes.INTEGER, allowNull: false },
    remainingcount: { type: DataTypes.INTEGER, allowNull: false },
    nextrun_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: "current_timestamp()" }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_stripe_schedule',
    timestamps: true,
    underscored: false,
  }
);

export default PwStripeSchedule;
export type { PwStripeScheduleAttributes, PwStripeScheduleCreationAttributes };
