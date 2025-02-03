import { Sequelize } from 'sequelize';
import { envConfig } from 'src/utils/envConfig';

const databaseUrl = envConfig.databaseUrl!;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
});

const initialize = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

export { sequelize, initialize };
