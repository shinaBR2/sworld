import { describe, it, expect } from 'vitest';
import '../__mocks__/sequelize';
import { Task } from './task';
import { DataTypes } from 'sequelize';

describe('Task Model', () => {
  const attributes = Task.rawAttributes;

  it('should have all required fields', () => {
    expect(attributes).toHaveProperty('entityId');
    expect(attributes).toHaveProperty('entityType');
    expect(attributes).toHaveProperty('taskId');
    expect(attributes).toHaveProperty('type');
    expect(attributes).toHaveProperty('metadata');
    expect(attributes).toHaveProperty('status');
    expect(attributes).toHaveProperty('completed');
  });

  describe('Field Configurations', () => {
    it('should configure entityId correctly', () => {
      const field = attributes.entityId;
      expect(field.type).toBe(DataTypes.UUID);
      expect(field.allowNull).toBe(false);
      expect(field.field).toBe('entity_id');
    });

    it('should configure entityType correctly', () => {
      const field = attributes.entityType;
      expect(field.type).toBe(DataTypes.TEXT);
      expect(field.allowNull).toBe(false);
      expect(field.field).toBe('entity_type');
    });

    it('should configure taskId correctly', () => {
      const field = attributes.taskId;
      expect(field.type).toBe(DataTypes.UUID);
      expect(field.allowNull).toBe(false);
      expect(field.field).toBe('task_id');
    });

    it('should configure type correctly', () => {
      const field = attributes.type;
      expect(field.type).toBe(DataTypes.TEXT);
      expect(field.allowNull).toBe(false);
    });

    it('should configure metadata correctly', () => {
      const field = attributes.metadata;
      expect(field.type).toBe(DataTypes.JSONB);
      expect(field.allowNull).toBe(false);
    });

    it('should configure status correctly', () => {
      const field = attributes.status;
      expect(field.type).toBe(DataTypes.TEXT);
      expect(field.allowNull).toBe(false);
    });

    it('should configure completed correctly', () => {
      const field = attributes.completed;
      expect(field.type).toBe(DataTypes.BOOLEAN);
      expect(field.allowNull).toBe(false);
      expect(field.defaultValue).toBe(false);
    });
  });

  describe('Model Configuration', () => {
    it('should use underscored naming', () => {
      expect(Task.options.underscored).toBe(true);
    });

    it('should enable timestamps', () => {
      expect(Task.options.timestamps).toBe(true);
      expect(Task.options.createdAt).toBe('created_at');
      expect(Task.options.updatedAt).toBe('updated_at');
    });
  });

  it('should create a valid task instance', () => {
    const taskData = {
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      entityType: 'video',
      taskId: '123e4567-e89b-12d3-a456-426614174001',
      type: 'conversion',
      metadata: { format: 'mp4', resolution: '1080p' },
      status: 'pending',
    };

    const task = Task.build(taskData);

    // Test each property individually
    expect(task).toHaveProperty('entityId', taskData.entityId);
    expect(task).toHaveProperty('entityType', taskData.entityType);
    expect(task).toHaveProperty('taskId', taskData.taskId);
    expect(task).toHaveProperty('type', taskData.type);
    expect(task).toHaveProperty('metadata');
    expect(task.metadata).toEqual(taskData.metadata);
    expect(task).toHaveProperty('status', taskData.status);
    expect(task).toHaveProperty('completed', false);
  });
});
