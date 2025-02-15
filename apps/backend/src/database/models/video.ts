import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../index';

interface VideoTS extends Model {
  id: string;
  source: string;
  duration: number | null;
}

const Video = sequelize.define<VideoTS>(
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
    thumbnail_url: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { Video, type VideoTS };
