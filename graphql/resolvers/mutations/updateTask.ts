import Task from "@/models/Tasks";

export const updateTask = async (
  _: any,
  { taskId, userId, ...updates }: any
) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found.");
  if (task.userId !== userId) throw new Error("Unauthorized.");

  if (updates.priority && (updates.priority < 1 || updates.priority > 5)) {
    throw new Error("Priority must be between 1 and 5.");
  }

  Object.assign(task, updates, { updatedAt: new Date() });
  return await task.save();
};
