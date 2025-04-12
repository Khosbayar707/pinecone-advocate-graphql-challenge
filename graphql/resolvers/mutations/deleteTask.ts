import Task from "@/models/Tasks";

const deleteTask = async (
  _: any,
  { taskId, userId }: { taskId: string; userId: string }
) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== userId) {
      throw new Error("Unauthorized: You do not own this task");
    }
    await Task.findByIdAndDelete(taskId);
    return "Task deleted successfully";
  } catch (error: any) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
};

export default deleteTask;
