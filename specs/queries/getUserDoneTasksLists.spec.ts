import mongoose from "mongoose";
import dotenv from "dotenv";
import { addTask } from "@/graphql/resolvers/mutations/addTask";
import { getUserDoneTasks } from "@/graphql/resolvers/queries/getUserDoneTask";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Get User Done Tasks Query", () => {
  const userId = "user-done-test";
  const unique = Date.now();

  beforeAll(async () => {
    await addTask(
      {},
      {
        taskName: "Done Task " + unique,
        description: "This task is marked done",
        priority: 2,
        userId,
        isDone: true,
      }
    );
  });

  it("should return only done (isDone: true) tasks", async () => {
    const tasks = await getUserDoneTasks({}, { userId });
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
    tasks.forEach((task) => {
      expect(task.userId).toBe(userId);
      expect(task.isDone).toBe(true);
    });
  });
});
