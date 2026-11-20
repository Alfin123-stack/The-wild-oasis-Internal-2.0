"use client";

import ErrorFallback from "@/ui/ErrorFallback";

export default function Error({ error, reset }) {
  return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}
