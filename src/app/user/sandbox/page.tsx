import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorClient } from "@/components/editor/editor-client";

export const metadata: Metadata = {
  title: "AppScreens: Sandbox App Store Screenshot Designer",
  description:
    "Design App Store and Google Play screenshots in the browser, then export store-ready sizes.",
};

export default function SandboxPage() {
  return (
    <>
      <h1 className="sr-only">Sandbox App Store Screenshot Designer</h1>
      <Suspense fallback={null}>
        <EditorClient />
      </Suspense>
    </>
  );
}
