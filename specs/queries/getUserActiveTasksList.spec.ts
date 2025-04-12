import mongoose from "mongoose";
import dotenv from "dotenv";
import { addTask } from "@/graphql/resolvers/mutations/addTask";
import { getUserActiveTasks } from "@/graphql/resolvers/queries/getUserActiveTask";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Get User Active Tasks Query", () => {
  const userId = "user-active-test";
  const unique = Date.now();

  beforeAll(async () => {
    await addTask(
      {},
      {
        taskName: "Active Task " + unique,
        description: "This is an active task and should show up",
        priority: 3,
        userId,
        isDone: false,
      }
    );
  });

  it("should return only active (isDone: false) tasks", async () => {
    const tasks = await getUserActiveTasks({}, { userId });
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
    tasks.forEach((task) => {
      expect(task.userId).toBe(userId);
      expect(task.isDone).toBe(false);
    });
  });
});
