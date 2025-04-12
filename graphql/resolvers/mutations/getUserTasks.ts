import Task from "@/models/Tasks";

const getUserTasks = async (_: any, { userId }: { userId: string }) => {
  try {
    const tasks = await Task.find({ userId });
    if (!tasks) {
      throw new Error("No tasks found for this user");
    }
    return tasks;
  } catch (error: any) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }
};

export default getUserTasks;
