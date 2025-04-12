import { ApolloProvider } from "@apollo/client";

import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import client from "@/libs/apollo-connection";

function App({ Component, pageProps }: AppProps) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ClerkProvider>
  );
}

export default App;
