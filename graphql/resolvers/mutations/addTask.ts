import Task from "@/models/Tasks";

export const addTask = async (_: any, args: any) => {
  try {
    const task = new Task({ ...args });
    return await task.save();
  } catch (error: any) {
    throw new Error(error?.message || "Something went wrong.");
  }
};
