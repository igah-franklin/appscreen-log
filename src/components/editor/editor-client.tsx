"use client";

import dynamic from "next/dynamic";

/**
 * The editor reads localStorage during its first render, so it is mounted
 * client-side only to keep server and client markup in step.
 */
export const EditorClient = dynamic(
  () => import("./editor").then((m) => m.Editor),
  { ssr: false },
);
