import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwFundlistAttributes {
  id?: number;
  appeal_id: number;
  name: string;
  sort: number;
  disable: number;
}

interface PwFundlistCreationAttributes extends Optional<PwFundlistAttributes, 'id'> {}

class PwFundlist extends Model<PwFundlistAttributes, PwFundlistCreationAttributes> implements PwFundlistAttributes {
  public id!: number;
  public appeal_id!: number;
  public name!: string;
  public sort!: number;
  public disable!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwFundlist.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    appeal_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    sort: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    disable: { type: DataTypes.TINYINT, allowNull: false }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_fundlist',
    timestamps: true,
    underscored: false,
  }
);

export default PwFundlist;
export type { PwFundlistAttributes, PwFundlistCreationAttributes };
