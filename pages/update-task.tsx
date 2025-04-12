"use client";

import { useSearchParams, useRouter } from "next/navigation"; // Add useRouter
import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

const GET_TASK = gql`
  query GetTask($taskId: String!) {
    getTask(taskId: $taskId) {
      _id
      taskName
      description
      priority
      isDone
      tags
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $taskId: ID!
    $taskName: String
    $description: String
    $priority: Int
    $isDone: Boolean
    $tags: [String]
    $userId: String!
  ) {
    updateTask(
      taskId: $taskId
      taskName: $taskName
      description: $description
      priority: $priority
      isDone: $isDone
      tags: $tags
      userId: $userId
    ) {
      _id
      taskName
    }
  }
`;

export default function UpdateTaskPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize router
  const taskId = searchParams.get("taskId");
  const userId = searchParams.get("userId");

  const { data, loading } = useQuery(GET_TASK, {
    variables: { taskId },
    skip: !taskId,
  });

  const [updateTask] = useMutation(UPDATE_TASK);

  const [form, setForm] = useState({
    taskName: "",
    description: "",
    priority: 1,
    isDone: false,
    tags: [],
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (data?.getTask) {
      setForm({
        taskName: data.getTask.taskName,
        description: data.getTask.description,
        priority: data.getTask.priority,
        isDone: data.getTask.isDone,
        tags: data.getTask.tags || [],
      });
    }
  }, [data]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await updateTask({
        variables: {
          taskId,
          userId,
          taskName: form.taskName,
          description: form.description,
          priority: parseInt(form.priority.toString()),
          isDone: form.isDone,
          tags: Array.isArray(form.tags) ? form.tags : [],
        },
      });
      router.push("/"); // Redirect to homepage on success
    } catch (err: any) {
      console.error("Update task error:", err);
      const message =
        err?.graphQLErrors?.[0]?.message ||
        "Something went wrong. Please try again.";
      setErrorMessage(message);
    }
  };

  if (!taskId)
    return (
      <p className="text-center text-red-500 font-medium mt-10">
        No task ID found in URL.
      </p>
    );
  if (loading)
    return (
      <p className="text-center text-gray-500 font-medium mt-10">
        Loading task...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="max-w-lg w-full mx-auto p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Update Task
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
              rows={4}
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
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a number between 1 (low) and 5 (high).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isDone"
              checked={form.isDone}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Mark as Done
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200 shadow-sm"
          >
            Update Task
          </button>
        </form>
      </div>

      {/* Custom CSS for additional styling */}
      <style jsx>{`
        textarea {
          min-height: 100px;
        }
      `}</style>
    </div>
  );
}
