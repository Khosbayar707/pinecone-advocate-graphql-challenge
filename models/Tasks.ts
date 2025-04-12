import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: [true, "Task name is required."],
  },
  description: {
    type: String,
    required: [true, "Description is required."],
    minlength: [10, "Description must be at least 10 characters."],
    validate: {
      validator(this: any, value: string) {
        return value !== this.taskName;
      },
      message: "Description cannot be the same as task name.",
    },
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    required: [true, "Priority is required."],
    min: 1,
    max: 5,
  },
  tags: {
    type: [String],
    validate: {
      validator: function (arr: string[]) {
        return arr.length <= 5;
      },
      message: "Tags can have at most 5 items.",
    },
  },
  userId: {
    type: String,
    required: [true, "User ID is required."],
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
});

TaskSchema.index({ taskName: 1, userId: 1 }, { unique: true });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
