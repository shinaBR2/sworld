import Sequelize, { DataTypes } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;
// @ts-ignore
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
});

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    auth0Id: {
      type: DataTypes.STRING,
    },
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const Video = sequelize.define(
  'videos',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    videoUrl: {
      type: DataTypes.STRING,
    },
    source: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

const initialize = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

const listUsers = async () => {
  return await User.findAll();
};

const saveVideoSource = async (id: string, source: string) => {
  return await Video.update(
    { source, status: 'ready' },
    {
      where: {
        id,
      },
    }
  );
};

export { initialize, listUsers, saveVideoSource };
