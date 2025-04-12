import { createRequest, createResponse } from "node-mocks-http";
import handler from "../pages/api/graphql";
import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient } from "graphql-request";

// Utility function to convert HeadersInit to a plain object
const convertHeadersToObject = (
  headersInit?: HeadersInit
): { [key: string]: string } | undefined => {
  if (!headersInit) return undefined;

  if (headersInit instanceof Headers) {
    // Convert Headers object to a plain object
    const headersObj: { [key: string]: string } = {};
    headersInit.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  } else if (Array.isArray(headersInit)) {
    // Convert array of [key, value] pairs to a plain object
    return Object.fromEntries(headersInit);
  } else {
    // Assume it's already a plain object (Record<string, string>)
    return headersInit as { [key: string]: string };
  }
};

// Mock the Next.js API request and response
export const createTestClient = () => {
  const client = new GraphQLClient("/api/graphql", {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      // Convert input to string (since we only need the URL as a string)
      const url = typeof input === "string" ? input : input.toString();

      // Ensure body is a string (parse if necessary)
      const body = init?.body
        ? typeof init.body === "string"
          ? init.body
          : JSON.stringify(init.body)
        : undefined;

      // Assert the method as a RequestMethod
      const method = (init?.method || "POST") as "POST"; // We know graphql-request uses POST

      // Convert headers to a plain object
      const headers = convertHeadersToObject(init?.headers);

      const req = createRequest<NextApiRequest>({
        method, // Now typed as 'POST', which is a valid RequestMethod
        url,
        headers, // Now a plain object or undefined, compatible with node-mocks-http
        body: body ? JSON.parse(body) : undefined,
      });

      const res = createResponse<NextApiResponse>();

      await handler(req, res);

      return {
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        json: async () => JSON.parse(res._getData()),
      } as Response;
    },
  });

  return client;
};
