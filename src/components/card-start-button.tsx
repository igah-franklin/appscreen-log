"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { CreateProjectDialog, type CreateOption } from "./create-project-dialog";
import { ShapesIcon } from "./icons";

/** Catalog-card action; opens the same sheet as the detail screen. */
export function CardStartButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<CreateOption | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        onClick={() => setOpen(true)}
        className="btn-link btn-success"
      >
        <ShapesIcon className="h-3.5 w-3.5 align-middle" />
        Start with Template
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
