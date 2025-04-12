"use client";

import { gql, useMutation } from "@apollo/client";
import { useUser } from "@clerk/nextjs";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const ADD_TASK = gql`
  mutation AddTask(
    $taskName: String!
    $description: String!
    $priority: Int!
    $tags: [String]
    $userId: String!
  ) {
    addTask(
      taskName: $taskName
      description: $description
      priority: $priority
      tags: $tags
      userId: $userId
    ) {
      taskName
    }
  }
`;

export default function AddTask() {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    priority: "1",
    tags: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [addTask, { loading }] = useMutation(ADD_TASK);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage("");

      if (!user?.id) {
        setErrorMessage("You must be logged in to add a task.");
        return;
      }

      try {
        await addTask({
          variables: {
            taskName: form.taskName,
            description: form.description,
            priority: Number(form.priority),
            tags: form.tags
              ? form.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              : [],
            userId: user.id,
          },
        });
        router.push("/");
      } catch (err: any) {
        const message =
          err?.graphQLErrors?.[0]?.message ||
          "Failed to add task. Please try again.";
        setErrorMessage(message);
      }
    },
    [addTask, form, user, router]
  );

  if (!user) {
    return (
      <p className="text-center text-red-500 font-medium mt-10">
        Please sign in to add a task.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="max-w-lg w-full mx-auto p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Add New Task
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              name="taskName"
              value={form.taskName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200 bg-gray-50 text-gray-800"
              placeholder="Enter task name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200 bg-gray-50 text-gray-800 resize-y"
              placeholder="Enter task description"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <input
              type="number"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              min={1}
              max={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200 bg-gray-50 text-gray-800"
              placeholder="1-5"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a number between 1 (low) and 5 (high).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200 bg-gray-50 text-gray-800"
              placeholder="e.g., work, urgent, personal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 shadow-sm ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding..." : "Add Task"}
          </button>
        </form>
      </div>

      <style jsx>{`
        textarea {
          min-height: 100px;
        }
      `}</style>
    </div>
  );
}
