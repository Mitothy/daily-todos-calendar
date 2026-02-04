import { body, param } from 'express-validator';

export const validateDate = param('date')
  .matches(/^\d{4}-\d{2}-\d{2}$/)
  .withMessage('Date must be in YYYY-MM-DD format');

export const validateTaskId = param('taskId')
  .isUUID(4)
  .withMessage('Task ID must be a valid UUID');

export const validateTasks = body('tasks')
  .isArray({ min: 6, max: 6 })
  .withMessage('Must provide exactly 6 tasks');

export const validateTaskItems = body('tasks.*.title')
  .isString()
  .isLength({ max: 100 })
  .withMessage('Task title must be a string with max 100 characters');

export const validateTitle = body('title')
  .isString()
  .isLength({ max: 100 })
  .withMessage('Title must be a string with max 100 characters');

export const validateCode = body('code')
  .isString()
  .notEmpty()
  .withMessage('Authorization code is required');
