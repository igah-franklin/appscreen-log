"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { CreateProjectDialog, type CreateOption } from "./create-project-dialog";
import { MenuGlyph, ShapesIcon } from "./icons";

/**
 * Detail-page actions. Both buttons open the same "Start with Template" sheet
 * the reference uses; picking an option copies the template into a project and
 * opens it in the editor.
 */
export function StartWithTemplate({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<CreateOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favourite, setFavourite] = useState(false);

  const pick = async (option: CreateOption) => {
    setError(null);
    if (option === "ai") {
      setError("AI screenshot creation isn't available in this build yet.");
      return;
    }
    setBusy(option);
    try {
      const project = await api.copyTemplate(
        templateId,
        option === "account" ? "account" : "sandbox",
      );
      router.push(`/user/sandbox?project=${project.projectId}`);
    } catch (e) {
      setBusy(null);
      setError(
        e instanceof Error
          ? `Could not copy the template (${e.message}). Is the API running on port 4000?`
          : "Could not copy the template.",
      );
    }
  };

  return (
    <>
      <button
        type="button"
        aria-pressed={favourite}
        onClick={() => setFavourite((v) => !v)}
        className="mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg
          viewBox="0 0 512 512"
          className="h-5 w-5"
          fill={favourite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={38}
        >
          <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9z" />
        </svg>
        Favourite template
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <ShapesIcon className="inline-block h-4 w-4 align-[-2px]" /> &nbsp; Start
        with Template
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 w-full rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <MenuGlyph name="clone" className="inline-block h-4 w-4 align-[-2px]" />{" "}
        &nbsp; Copy to Account
      </button>

      {open && (
        <CreateProjectDialog
          busy={busy}
          error={error}
          onPick={pick}
          onClose={() => {
            if (busy) return;
            setOpen(false);
            setError(null);
          }}
        />
      )}
    </>
  );
}
