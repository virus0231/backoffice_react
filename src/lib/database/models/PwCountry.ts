import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwCountryAttributes {
  id?: number;
  name: string;
  created_at: Date;
}

interface PwCountryCreationAttributes extends Optional<PwCountryAttributes, 'id'> {}

class PwCountry extends Model<PwCountryAttributes, PwCountryCreationAttributes> implements PwCountryAttributes {
  public id!: number;
  public name!: string;
  public created_at!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwCountry.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: "current_timestamp()" }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_country',
    timestamps: true,
    underscored: false,
  }
);

export default PwCountry;
export type { PwCountryAttributes, PwCountryCreationAttributes };
