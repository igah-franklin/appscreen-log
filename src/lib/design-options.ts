/** Option lists mirrored from the reference's edit panels. */

export const DECORATIONS = [
  "None",
  "Laurel - Compact Square",
  "Laurel - Compact Tight",
  "Laurel - Compact Wide",
  "Laurel - Compact Wider",
  "Laurel - Tight",
  "Laurel - Wide",
  "Laurel - Wider",
  "Rectangle",
  "Rounded Rectangle",
  "Oval",
  "Square",
  "Rounded Square",
  "Circle",
  "Badge",
  "Comment - Left",
  "Comment - Right",
  "Chat Bubble - Left",
  "Chat Bubble - Right",
  "Star Background",
] as const;

export const FLOATING_POSITIONS = ["Top", "Middle", "Bottom"] as const;

export const MATCH_TEXT_SIZE = [
  "Match to smallest Title size",
  "No - Manual control",
] as const;

export const DEVICE_TYPES = [
  "Flat Device Mockup",
  "Real Device Mockup",
  "No Device",
] as const;

export const DEVICE_STYLES = [
  { id: "real-dark", label: "Real Dark" },
  { id: "real-light", label: "Real Light" },
  { id: "flat-dark", label: "Flat Dark" },
  { id: "flat-light", label: "Flat Light" },
] as const;

export const ORIENTATIONS = ["Portrait", "Landscape"] as const;
export const FITS = [
  { id: "contain", label: "Contain" },
  { id: "cover", label: "Cover" },
  { id: "fill", label: "Fill" },
] as const;
export const VERTICAL_POSITIONS = [
  { id: "top", label: "Top" },
  { id: "center", label: "Center" },
  { id: "bottom", label: "Bottom" },
] as const;

export const BACKGROUND_PATTERNS = [
  "None",
  "Dots",
  "Grid",
  "Diagonal Lines",
  "Waves",
] as const;

export const FONT_FAMILIES = [
  "Global",
  "Geist Sans",
  "Rubik",
  "Inter",
  "Cal Sans",
  "Georgia",
  "Trebuchet MS",
  "Verdana",
  "Courier New",
] as const;
