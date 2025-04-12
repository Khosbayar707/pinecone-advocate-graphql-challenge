import mongoose from "mongoose";
import dotenv from "dotenv";
import { addTask } from "@/graphql/resolvers/mutations/addTask";
import { updateTask } from "@/graphql/resolvers/mutations/updateTask";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("updateTask resolver", () => {
  const userId = "test-user";
  const uniqueId = Date.now();
  let createdTask: any;

  beforeAll(async () => {
    await mongoose.connection.collection("tasks").deleteMany({});
    createdTask = await addTask(
      {},
      {
        taskName: `Old Task ${uniqueId}`,
        description: "Old description for update test",
        priority: 2,
        userId,
        isDone: false,
      }
    );
  });

  it("updates taskName and isDone", async () => {
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const updated = await updateTask(
      {},
      {
        taskId: createdTask._id,
        userId,
        taskName: `Updated Task ${newId}`,
        isDone: true,
      }
    );

    expect(updated.taskName).toBe(`Updated Task ${newId}`);
    expect(updated.isDone).toBe(true);
  });

  it("throws 'Unauthorized' if userId does not match", async () => {
    await expect(
      updateTask(
        {},
        {
          taskId: createdTask._id,
          userId: "wrong-user",
          taskName: "Should Not Work",
        }
      )
    ).rejects.toThrow("Unauthorized.");
  });

  it("throws error if priority is out of range", async () => {
    await expect(
      updateTask(
        {},
        {
          taskId: createdTask._id,
          userId,
          priority: 10,
        }
      )
    ).rejects.toThrow("Priority must be between 1 and 5.");
  });

  it("does not throw if priority is undefined", async () => {
    const result = await updateTask(
      {},
      {
        taskId: createdTask._id,
        userId,
      }
    );
    expect(result).toBeDefined();
  });
});
