"use client";

import { useRouter } from "next/navigation";
import { ShapesIcon } from "./icons";
import { MenuGlyph } from "./icons";

export function StartWithTemplate({ templateId }: { templateId: string }) {
  const router = useRouter();
  const open = () => router.push(`/user/sandbox?template=${templateId}`);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="w-full rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <ShapesIcon className="inline-block h-4 w-4 align-[-2px]" /> &nbsp; Start
        with Template
      </button>
      <button
        type="button"
        onClick={open}
        className="mt-1 w-full rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <MenuGlyph name="clone" className="inline-block h-4 w-4 align-[-2px]" />{" "}
        &nbsp; Copy to Account
      </button>
    </>
  );
}
