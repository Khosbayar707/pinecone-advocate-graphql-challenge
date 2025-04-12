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

describe("getUserActiveTasks resolver", () => {
  const testUserId = "test-user-active";
  const uniqueId = Date.now();

  beforeEach(async () => {
    await addTask(
      {},
      {
        taskName: `Active Task ${uniqueId}`,
        description: "This is an active task and should show up",
        priority: 3,
        userId: testUserId,
        isDone: false,
      }
    );
  });

  it("returns only tasks marked as active (isDone: false) for a given user", async () => {
    const tasks = await getUserActiveTasks({}, { userId: testUserId });

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);

    for (const task of tasks) {
      expect(task.userId).toBe(testUserId);
      expect(task.isDone).toBe(false);
    }
  });
});
