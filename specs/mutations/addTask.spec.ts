import mongoose from "mongoose";
import dotenv from "dotenv";
import { addTask } from "@/graphql/resolvers/mutations/addTask";
import { updateTask } from "@/graphql/resolvers/mutations/updateTask";

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Update Task Mutation", () => {
  const unique = Date.now();
  let createdTask: any;
  const userId = "test-user";

  beforeAll(async () => {
    createdTask = await addTask(
      {},
      {
        taskName: "Old Task " + unique,
        description: "Old description for update test",
        priority: 2,
        userId,
      }
    );
  });

  it("should update taskName and isDone", async () => {
    const updated = await updateTask(
      {},
      {
        taskId: createdTask._id,
        userId,
        taskName: "Updated Task " + unique,
        isDone: true,
      }
    );

    expect(updated.taskName).toBe("Updated Task " + unique);
    expect(updated.isDone).toBe(true);
  });

  it("should throw 'Task not found' if taskId does not exist", async () => {
    await expect(
      updateTask(
        {},
        {
          taskId: "000000000000000000000000",
          userId: "any-user",
          taskName: "Doesn't matter",
        }
      )
    ).rejects.toThrow("Task not found.");
  });

  it("should throw unauthorized if userId doesn't match", async () => {
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

  it("should throw error if priority is out of range", async () => {
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

  it("should not throw if priority is undefined", async () => {
    const updated = await updateTask(
      {},
      {
        taskId: createdTask._id,
        userId,
        taskName: "Updated Again",
      }
    );

    expect(updated.taskName).toBe("Updated Again");
  });

  it("should catch validation error in addTask (coverage)", async () => {
    const badInput = {
      taskName: "SameText",
      description: "short",
      priority: 1,
      userId: "force-error-user",
    };

    await expect(addTask({}, badInput)).rejects.toThrow(
      "Task validation failed"
    );
  });

  it("should catch and throw validation error (for catch block coverage)", async () => {
    const input = {
      taskName: "SameText10",
      description: "SameText10",
      priority: 2,
      userId: "user-catch-test",
    };

    await expect(addTask({}, input)).rejects.toThrow(
      "Description cannot be the same as task name."
    );
  });

  it("should throw generic error if no message is provided", async () => {
    const input = {
      taskName: "CatchErrorTest",
      description: "Valid long description here",
      priority: 2,
      userId: "generic-error-user",
    };

    const originalSave = mongoose.models.Task.prototype.save;
    mongoose.models.Task.prototype.save = jest.fn().mockImplementation(() => {
      throw {};
    });

    await expect(addTask({}, input)).rejects.toThrow("Something went wrong.");

    mongoose.models.Task.prototype.save = originalSave;
  });
});
