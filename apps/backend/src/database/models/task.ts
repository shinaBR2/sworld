import { DataTypes } from 'sequelize';
import { sequelize } from '../index';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// TODO
// Make enum for type and entityType
export const Task = sequelize.define(
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
  }
);
