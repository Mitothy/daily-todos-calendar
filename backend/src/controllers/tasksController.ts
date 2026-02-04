import { Request, Response } from 'express';
import { createOrUpdateTaskEvent, getTasksForDate } from '../services/googleCalendarService.js';
import { createEmptyTasks, toggleTask, validateTasks } from '../services/taskService.js';
import { getColorId } from '../utils/colorMapper.js';
import { Task } from '../types/task.types.js';

export async function getTasks(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const result = await getTasksForDate(req.auth!, date);
    res.json(result);
  } catch (error: any) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
}

export async function createTasks(req: Request, res: Response) {
  try {
    const { date } = req.params;
    let { tasks } = req.body as { tasks: Task[] };

    if (!tasks || tasks.length === 0) {
      tasks = createEmptyTasks();
    }

    const validationError = validateTasks(tasks);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const eventId = await createOrUpdateTaskEvent(req.auth!, date, tasks);
    const completedCount = tasks.filter((t) => t.completed).length;

    res.status(201).json({
      eventId,
      tasks,
      completionRate: (completedCount / 6) * 100,
      colorId: getColorId(completedCount),
    });
  } catch (error: any) {
    console.error('Create tasks error:', error.message);
    res.status(500).json({ error: 'Failed to create tasks' });
  }
}

export async function toggleTaskCompletion(req: Request, res: Response) {
  try {
    const { date, taskId } = req.params;
    const existing = await getTasksForDate(req.auth!, date);

    if (!existing) {
      return res.status(404).json({ error: 'No tasks found for this date' });
    }

    const taskIndex = existing.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    existing.tasks[taskIndex] = toggleTask(existing.tasks[taskIndex]);
    await createOrUpdateTaskEvent(req.auth!, date, existing.tasks);

    const completedCount = existing.tasks.filter((t) => t.completed).length;

    res.json({
      task: existing.tasks[taskIndex],
      completionRate: (completedCount / 6) * 100,
      colorId: getColorId(completedCount),
    });
  } catch (error: any) {
    console.error('Toggle task error:', error.message);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
}

export async function updateTaskTitle(req: Request, res: Response) {
  try {
    const { date, taskId } = req.params;
    const { title } = req.body;

    if (typeof title !== 'string' || title.length > 100) {
      return res.status(400).json({ error: 'Invalid title' });
    }

    const existing = await getTasksForDate(req.auth!, date);
    if (!existing) {
      return res.status(404).json({ error: 'No tasks found for this date' });
    }

    const taskIndex = existing.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    existing.tasks[taskIndex].title = title;
    await createOrUpdateTaskEvent(req.auth!, date, existing.tasks);

    res.json({ task: existing.tasks[taskIndex] });
  } catch (error: any) {
    console.error('Update title error:', error.message);
    res.status(500).json({ error: 'Failed to update task title' });
  }
}

export async function bulkUpdateTasks(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const { tasks } = req.body as { tasks: Task[] };

    const validationError = validateTasks(tasks);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    await createOrUpdateTaskEvent(req.auth!, date, tasks);
    const completedCount = tasks.filter((t) => t.completed).length;

    res.json({
      tasks,
      completionRate: (completedCount / 6) * 100,
      colorId: getColorId(completedCount),
    });
  } catch (error: any) {
    console.error('Bulk update error:', error.message);
    res.status(500).json({ error: 'Failed to update tasks' });
  }
}
