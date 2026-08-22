import Link from "next/link";
import { ChevronLeftIcon, DesktopIcon } from "./editor-icons";

/** The designer is desktop-only below md, matching the reference. */
export function SmallScreenNotice() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white px-6 md:hidden">
      <div className="rounded-xl p-3 text-center shadow-lg">
        <DesktopIcon className="mx-auto h-9 w-9 text-gray-600" />
        <h3 className="mt-3 text-sm font-semibold text-gray-900">
          Screen Size Too Small
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The designer is optimized for larger screens. Please switch to a
          desktop or larger tablet to access this feature.
        </p>
        <div className="mt-6">
          <Link href="/" className="btn-link btn-primary inline-flex items-center gap-1">
            <ChevronLeftIcon className="h-3.5 w-3.5" /> Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
