/** Option lists mirrored from the reference's edit panels. */

/**
 * Caption decorations, keyed by the reference's own ids — captured layouts
 * store the id, so editing has to write the same value back.
 */
export const DECORATIONS = [
  { id: "none", label: "None" },
  { id: "laurelCompactSquare", label: "Laurel - Compact Square" },
  { id: "laurelCompactTight", label: "Laurel - Compact Tight" },
  { id: "laurelCompactWide", label: "Laurel - Compact Wide" },
  { id: "laurelCompactWider", label: "Laurel - Compact Wider" },
  { id: "laurelTight", label: "Laurel - Tight" },
  { id: "laurelWide", label: "Laurel - Wide" },
  { id: "laurelWider", label: "Laurel - Wider" },
  { id: "rectangle", label: "Rectangle" },
  { id: "roundedRectangle", label: "Rounded Rectangle" },
  { id: "oval", label: "Oval" },
  { id: "square", label: "Square" },
  { id: "roundedSquare", label: "Rounded Square" },
  { id: "circle", label: "Circle" },
  { id: "badge", label: "Badge" },
  { id: "underline", label: "Underline" },
  { id: "cloud", label: "Cloud" },
  { id: "commentLeft", label: "Comment - Left" },
  { id: "commentRight", label: "Comment - Right" },
  { id: "chatBubbleLeft", label: "Chat Bubble - Left" },
  { id: "chatBubbleRight", label: "Chat Bubble - Right" },
  { id: "starBackground", label: "Star Background" },
] as const;

export const FLOATING_POSITIONS = ["Top", "Middle", "Bottom"] as const;

export const MATCH_TEXT_SIZE = [
  "Match to smallest Title size",
  "No - Manual control",
] as const;

export const DEVICE_TYPES = [
  "Flat Device Mockup",
  "Real Device Mockup",
  "Dynamic Frame",
  "No Device",
] as const;

/** Frame body colours the reference offers, keyed by its own names. */
export const DEVICE_COLOURS = [
  { id: "black", label: "Black" },
  { id: "dark", label: "Dark" },
  { id: "space", label: "Space" },
  { id: "silver", label: "Silver" },
  { id: "light", label: "Light" },
  { id: "reallight", label: "Real Light" },
  { id: "white", label: "White" },
  { id: "gold", label: "Gold" },
  { id: "realgold", label: "Real Gold" },
  { id: "rose", label: "Rose" },
  { id: "coral", label: "Coral" },
  { id: "strawberry", label: "Strawberry" },
  { id: "green", label: "Green" },
  { id: "earth", label: "Earth" },
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

/**
 * Families the captured templates are authored in, plus the system faces the
 * reference offers. Anything else a layout names is added to the picker at
 * runtime so a caption never loses its font by being edited.
 */
export const FONT_FAMILIES = [
  "Global",
  "Geist Sans",
  "Anton",
  "Archivo",
  "Barlow",
  "Bebas Neue",
  "Boldonse",
  "Bricolage Grotesque",
  "Cal Sans",
  "DM Sans",
  "Figtree",
  "Fredoka",
  "Instrument Sans",
  "Inter",
  "Lato",
  "Luckiest Guy",
  "Manrope",
  "Montserrat",
  "Nunito",
  "Nunito Sans",
  "Open Sans",
  "Outfit",
  "Playfair Display",
  "Plus Jakarta Sans",
  "Poppins",
  "Raleway",
  "Roboto",
  "Roboto Mono",
  "Rubik",
  "Sora",
  "Space Grotesk",
  "Urbanist",
  "Work Sans",
  "Georgia",
  "Trebuchet MS",
  "Verdana",
  "Courier New",
] as const;
