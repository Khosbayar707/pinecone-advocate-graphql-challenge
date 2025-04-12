import Task from "@/models/Tasks";

export const getUserActiveTasks = async (
  _: any,
  { userId }: { userId: string }
) => {
  return await Task.find({ userId, isDone: false });
};
