import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwAppealcountriesAttributes {
  id?: number;
  countryid: number;
  apid: number;
}

interface PwAppealcountriesCreationAttributes extends Optional<PwAppealcountriesAttributes, 'id'> {}

class PwAppealcountries extends Model<PwAppealcountriesAttributes, PwAppealcountriesCreationAttributes> implements PwAppealcountriesAttributes {
  public id!: number;
  public countryid!: number;
  public apid!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwAppealcountries.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    countryid: { type: DataTypes.INTEGER, allowNull: false },
    apid: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_appealcountries',
    timestamps: true,
    underscored: false,
  }
);

export default PwAppealcountries;
export type { PwAppealcountriesAttributes, PwAppealcountriesCreationAttributes };
