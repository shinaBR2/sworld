import { DataTypes } from 'sequelize';
import { sequelize } from '../index';

enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

enum TaskType {
  CONVERT = 'convert',
  IMPORT_PLATFORM = 'import_platform',
  STREAM_HLS = 'stream_hls',
  /** ONE TIME JOB TO FIX VIDEO HAS MISSING DURATION  */
  FIX_DURATION = 'fix_duration',
  /** ONE TIME JOB TO FIX VIDEO HAS MISSING THUMBNAIL  */
  FIX_THUMBNAIL = 'fix_thumbnail',
  SHARE = 'share',
  CRAWL = 'crawl',
}

enum TaskEntityType {
  VIDEO = 'video',
  CRAWL_VIDEO = 'crawl_video',
}

const Task = sequelize.define(
  'tasks',
  {
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'entity_id',
    },
    entityType: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'entity_type',
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'task_id',
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export { Task, TaskEntityType, TaskStatus, TaskType };
