const FIREBASE_BASE =
  "https://firebasestorage.googleapis.com/v0/b/appscreens-7d372.appspot.com/o/users%2FL9STL2OKF8ZJgt0DRRTm3FUyhZl1%2Fpreview%2F";

/** Rebuilds the reference site's image-proxy URL for a template preview. */
export function previewUrl(project: string, index: number, width: number) {
  const src = `${FIREBASE_BASE}${project}-${index}.png?alt=media`;
  return `https://appscreens.com/img?src=${encodeURIComponent(
    src,
  )}&w=${width}&fmt=auto&fallback=redirect&fit=inside`;
}

export function previewSrcSet(project: string, index: number, widths: number[]) {
  return widths
    .map((w) => `${previewUrl(project, index, w)} ${w}w`)
    .join(", ");
}
