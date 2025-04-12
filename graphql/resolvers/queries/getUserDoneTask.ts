import Task from "@/models/Tasks";

export const getUserDoneTasks = async (_: any, { userId }: any) => {
  const tasks = await Task.find({ userId, isDone: true });

  return tasks;
};
