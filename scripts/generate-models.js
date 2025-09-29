/**
 * Database Model Generator
 * Introspects MySQL database and generates Sequelize models
 */

const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Create Sequelize instance
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'insights',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: false,
});

async function introspectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully');

    // Get all tables
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('Found tables:', tables.map(t => Object.values(t)[0]));

    const modelsDir = path.join(__dirname, '../src/lib/database/models');

    // Ensure models directory exists
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // Generate models for each table
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      await generateModelForTable(tableName);
    }

    // Generate index file
    await generateIndexFile(tables.map(t => Object.values(t)[0]));

    console.log('Models generated successfully!');

  } catch (error) {
    console.error('Error introspecting database:', error);
  } finally {
    await sequelize.close();
  }
}

async function generateModelForTable(tableName) {
  try {
    // Get table structure
    const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);

    console.log(`Generating model for table: ${tableName}`);
    console.log('Columns:', columns);

    const modelName = toPascalCase(tableName);
    const modelContent = generateModelContent(modelName, tableName, columns);

    const modelsDir = path.join(__dirname, '../src/lib/database/models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    const filePath = path.join(modelsDir, `${modelName}.ts`);
    fs.writeFileSync(filePath, modelContent);

    console.log(`Generated model: ${modelName}.ts`);

  } catch (error) {
    console.error(`Error generating model for ${tableName}:`, error);
  }
}

function generateModelContent(modelName, tableName, columns) {
  const imports = `import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelizeInstance } from '../sequelize';

`;

  // Generate interface
  const interfaceProps = columns.map(col => {
    const tsType = mysqlToTypeScript(col.Type);
    const optional = col.Null === 'YES' || col.Extra === 'auto_increment' ? '?' : '';
    return `  ${col.Field}${optional}: ${tsType};`;
  }).join('\n');

  const interfaceContent = `interface ${modelName}Attributes {
${interfaceProps}
}

interface ${modelName}CreationAttributes extends Optional<${modelName}Attributes, ${getOptionalFields(columns)}> {}

`;

  // Generate class
  const classContent = `class ${modelName} extends Model<${modelName}Attributes, ${modelName}CreationAttributes> implements ${modelName}Attributes {
${columns.map(col => `  public ${col.Field}!: ${mysqlToTypeScript(col.Type)};`).join('\n')}

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

`;

  // Generate initialization
  const attributes = columns.map(col => {
    const sequelizeType = mysqlToSequelize(col.Type);
    const options = [`type: DataTypes.${sequelizeType}`];

    if (col.Key === 'PRI') options.push('primaryKey: true');
    if (col.Extra === 'auto_increment') options.push('autoIncrement: true');
    if (col.Null === 'NO') options.push('allowNull: false');
    if (col.Default !== null && col.Default !== 'NULL') {
      if (col.Default === 'CURRENT_TIMESTAMP') {
        options.push('defaultValue: DataTypes.NOW');
      } else {
        const defaultValue = isNaN(col.Default) ? JSON.stringify(col.Default) : col.Default;
        options.push(`defaultValue: ${defaultValue}`);
      }
    }

    return `    ${col.Field}: { ${options.join(', ')} }`;
  }).join(',\n');

  const initContent = `${modelName}.init(
  {
${attributes}
  },
  {
    sequelize: getSequelizeInstance(),
    tableName: '${tableName}',
    timestamps: true,
    underscored: false,
  }
);

export default ${modelName};
export type { ${modelName}Attributes, ${modelName}CreationAttributes };
`;

  return imports + interfaceContent + classContent + initContent;
}

function getOptionalFields(columns) {
  const optional = columns
    .filter(col => col.Null === 'YES' || col.Extra === 'auto_increment')
    .map(col => `'${col.Field}'`);

  return optional.length > 0 ? optional.join(' | ') : 'never';
}

function mysqlToTypeScript(mysqlType) {
  const type = mysqlType.toLowerCase();

  if (type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double')) {
    return 'number';
  }
  if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
    return 'string';
  }
  if (type.includes('datetime') || type.includes('timestamp')) {
    return 'Date';
  }
  if (type.includes('date')) {
    return 'Date';
  }
  if (type.includes('boolean') || type.includes('tinyint(1)')) {
    return 'boolean';
  }
  if (type.includes('json')) {
    return 'any';
  }

  return 'any';
}

function mysqlToSequelize(mysqlType) {
  const type = mysqlType.toLowerCase();

  if (type.includes('int')) {
    if (type.includes('bigint')) return 'BIGINT';
    if (type.includes('tinyint')) return 'TINYINT';
    if (type.includes('smallint')) return 'SMALLINT';
    if (type.includes('mediumint')) return 'MEDIUMINT';
    return 'INTEGER';
  }
  if (type.includes('decimal')) return 'DECIMAL';
  if (type.includes('float')) return 'FLOAT';
  if (type.includes('double')) return 'DOUBLE';
  if (type.includes('varchar')) return 'STRING';
  if (type.includes('text')) return 'TEXT';
  if (type.includes('char')) return 'CHAR';
  if (type.includes('datetime')) return 'DATE';
  if (type.includes('timestamp')) return 'DATE';
  if (type.includes('date')) return 'DATEONLY';
  if (type.includes('boolean') || type.includes('tinyint(1)')) return 'BOOLEAN';
  if (type.includes('json')) return 'JSON';

  return 'STRING';
}

function toPascalCase(str) {
  return str.replace(/(?:^|_)(.)/g, (_, char) => char.toUpperCase());
}

async function generateIndexFile(tableNames) {
  const modelNames = tableNames.map(toPascalCase);

  const imports = modelNames.map(name =>
    `import ${name} from './${name}';`
  ).join('\n');

  const exports = `
export {
${modelNames.map(name => `  ${name}`).join(',\n')}
};

export const models = {
${modelNames.map(name => `  ${name}`).join(',\n')}
};
`;

  const content = imports + exports;

  const filePath = path.join(__dirname, '../src/lib/database/models/index.ts');
  fs.writeFileSync(filePath, content);

  console.log('Generated index.ts file');
}

// Run the introspection
introspectDatabase();