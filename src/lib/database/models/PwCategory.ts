import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

interface PwCategoryAttributes {
  id?: number;
  name: string;
  image: string;
}

interface PwCategoryCreationAttributes extends Optional<PwCategoryAttributes, 'id'> {}

class PwCategory extends Model<PwCategoryAttributes, PwCategoryCreationAttributes> implements PwCategoryAttributes {
  public id!: number;
  public name!: string;
  public image!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PwCategory.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false }
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: 'pw_category',
    timestamps: true,
    underscored: false,
  }
);

export default PwCategory;
export type { PwCategoryAttributes, PwCategoryCreationAttributes };
