import { gql, useQuery } from "@apollo/client";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  RedirectToSignIn,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// GraphQL queries remain unchanged
const GET_USER_ACTIVE_TASKS = gql`
  query GetUserActiveTasks($userId: String!) {
    getUserActiveTasks(userId: $userId) {
      _id
      taskName
      description
      priority
      isDone
      tags
    }
  }
`;

const GET_USER_DONE_TASKS = gql`
  query GetUserDoneTasks($userId: String!) {
    getUserDoneTasks(userId: $userId) {
      _id
      taskName
      description
      priority
      isDone
      tags
    }
  }
`;

export default function Home() {
  const { user, isLoaded } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      setUserId(user.id);
    }
  }, [isLoaded, user]);

  const {
    data: activeData,
    loading: activeLoading,
    error: activeError,
  } = useQuery(GET_USER_ACTIVE_TASKS, {
    variables: { userId: userId || "" },
    skip: !userId,
  });

  const {
    data: doneData,
    loading: doneLoading,
    error: doneError,
  } = useQuery(GET_USER_DONE_TASKS, {
    variables: { userId: userId || "" },
    skip: !userId,
  });

  if (!isLoaded) return <p className="text-center text-gray-500">Loading...</p>;
  if (!user) return <RedirectToSignIn />;
  if (activeLoading || doneLoading)
    return <p className="text-center text-gray-500">Loading...</p>;
  if (activeError || doneError)
    return (
      <p className="text-center text-red-500">
        Error: {activeError?.message || doneError?.message}
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6 sm:p-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Task Dashboard
          </h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => router.push(`/add-task?userId=${userId}`)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              + Add Task
            </button>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-sm">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          Welcome, <span className="font-semibold">{user.firstName}</span>!
        </p>

        {/* Active Tasks Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Active Tasks
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeData?.getUserActiveTasks?.length === 0 ? (
              <p className="text-gray-500 col-span-full">
                No active tasks found.
              </p>
            ) : (
              activeData?.getUserActiveTasks?.map((task: any) => (
                <div
                  key={task._id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {task.taskName}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      <span className="font-medium">Priority:</span>{" "}
                      <span
                        className={`${
                          task.priority === "High"
                            ? "text-red-500"
                            : task.priority === "Medium"
                            ? "text-yellow-500"
                            : "text-green-500"
                        } font-medium`}
                      >
                        {task.priority}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {task.isDone ? "Done" : "Not Done"}
                    </p>
                    <p>
                      <span className="font-medium">Tags:</span>{" "}
                      {task.tags?.join(", ") || "None"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        `/update-task?taskId=${task._id}&userId=${userId}`
                      )
                    }
                    className="mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors duration-150"
                  >
                    ✏️ Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Completed Tasks Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Completed Tasks
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doneData?.getUserDoneTasks?.length === 0 ? (
              <p className="text-gray-500 col-span-full">
                No completed tasks found.
              </p>
            ) : (
              doneData?.getUserDoneTasks?.map((task: any) => (
                <div
                  key={task._id}
                  className="bg-white p-6 rounded-xl shadow-md opacity-80"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {task.taskName}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      <span className="font-medium">Priority:</span>{" "}
                      <span
                        className={`${
                          task.priority === "High"
                            ? "text-red-500"
                            : task.priority === "Medium"
                            ? "text-yellow-500"
                            : "text-green-500"
                        } font-medium`}
                      >
                        {task.priority}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {task.isDone ? "Done" : "Not Done"}
                    </p>
                    <p>
                      <span className="font-medium">Tags:</span>{" "}
                      {task.tags?.join(", ") || "None"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Custom CSS for additional styling */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
