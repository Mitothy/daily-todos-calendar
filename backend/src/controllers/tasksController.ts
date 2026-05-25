import { Request, Response } from 'express';
import { createOrUpdateTaskEvent, getTasksForDate, deleteTaskEvent } from '../services/googleCalendarService.js';
import { createEmptyTasks, toggleTask, validateTasks, validateExpenses, calculateTotalSpent } from '../services/taskService.js';
import { getColorId } from '../utils/colorMapper.js';
import { Task, Expense } from '../types/task.types.js';

export async function getTasks(req: Request, res: Response) {
  try {
    const { date } = req.params;
    console.log(`[getTasks] Loading tasks for date: ${date}`);
    const result = await getTasksForDate(req.auth!, date, req.session.userId!);
    console.log(`[getTasks] Result for ${date}:`, result ? `found ${result.tasks.length} tasks, ${result.expenses.length} expenses` : 'null (no event found)');
    res.json(result);
  } catch (error: any) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
}

export async function createTasks(req: Request, res: Response) {
  try {
    const { date } = req.params;
    let { tasks, expenses } = req.body as { tasks: Task[]; expenses?: Expense[] };
    console.log(`[createTasks] Creating tasks for date: ${date}, incoming tasks: ${tasks?.length || 0}`);

    if (!tasks || tasks.length === 0) {
      tasks = createEmptyTasks();
      console.log(`[createTasks] Generated 6 empty tasks`);
    }
    if (!expenses) expenses = [];

    const validationError = validateTasks(tasks);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const expenseError = validateExpenses(expenses);
    if (expenseError) {
      return res.status(400).json({ error: expenseError });
    }

    const eventId = await createOrUpdateTaskEvent(req.auth!, date, tasks, req.session.userId!, expenses);
    const completedCount = tasks.filter((t) => t.completed).length;

    res.status(201).json({
      eventId,
      tasks,
      completionRate: (completedCount / 6) * 100,
      colorId: getColorId(completedCount),
      expenses,
      totalSpent: calculateTotalSpent(expenses),
    });
  } catch (error: any) {
    console.error('Create tasks error:', error.message);
    res.status(500).json({ error: 'Failed to create tasks' });
  }
}

export async function toggleTaskCompletion(req: Request, res: Response) {
  try {
    const { date, taskId } = req.params;
    const existing = await getTasksForDate(req.auth!, date, req.session.userId!);

    if (!existing) {
      return res.status(404).json({ error: 'No tasks found for this date' });
    }

    const taskIndex = existing.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    existing.tasks[taskIndex] = toggleTask(existing.tasks[taskIndex]);
    await createOrUpdateTaskEvent(req.auth!, date, existing.tasks, req.session.userId!, existing.expenses);

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

    const existing = await getTasksForDate(req.auth!, date, req.session.userId!);
    if (!existing) {
      return res.status(404).json({ error: 'No tasks found for this date' });
    }

    const taskIndex = existing.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    existing.tasks[taskIndex].title = title;
    await createOrUpdateTaskEvent(req.auth!, date, existing.tasks, req.session.userId!, existing.expenses);

    res.json({ task: existing.tasks[taskIndex] });
  } catch (error: any) {
    console.error('Update title error:', error.message);
    res.status(500).json({ error: 'Failed to update task title' });
  }
}

export async function bulkUpdateTasks(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const { tasks, expenses = [] } = req.body as { tasks: Task[]; expenses?: Expense[] };

    const validationError = validateTasks(tasks);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const expenseError = validateExpenses(expenses);
    if (expenseError) {
      return res.status(400).json({ error: expenseError });
    }

    await createOrUpdateTaskEvent(req.auth!, date, tasks, req.session.userId!, expenses);
    const completedCount = tasks.filter((t) => t.completed).length;

    res.json({
      tasks,
      completionRate: (completedCount / 6) * 100,
      colorId: getColorId(completedCount),
      expenses,
      totalSpent: calculateTotalSpent(expenses),
    });
  } catch (error: any) {
    console.error('Bulk update error:', error.message);
    res.status(500).json({ error: 'Failed to update tasks' });
  }
}

export async function deleteTasks(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const deleted = await deleteTaskEvent(req.auth!, date, req.session.userId!);

    if (!deleted) {
      return res.status(404).json({ error: 'No tasks found for this date' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Delete tasks error:', error.message);
    res.status(500).json({ error: 'Failed to delete tasks' });
  }
}
