import mongoose from "mongoose";
import dotenv from "dotenv";
import { addTask } from "@/graphql/resolvers/mutations/addTask";
import { getUserDoneTasks } from "@/graphql/resolvers/queries/getUserDoneTask";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("getUserDoneTasks resolver", () => {
  const testUserId = "test-user-done";
  const uniqueId = Date.now();

  beforeEach(async () => {
    await addTask(
      {},
      {
        taskName: `Done Task ${uniqueId}`,
        description: "A task that is completed",
        priority: 2,
        userId: testUserId,
        isDone: true,
      }
    );
  });

  it("returns only tasks marked as done for a given user", async () => {
    const tasks = await getUserDoneTasks({}, { userId: testUserId });

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);

    for (const task of tasks) {
      expect(task.userId).toBe(testUserId);
      expect(task.isDone).toBe(true);
    }
  });
});
