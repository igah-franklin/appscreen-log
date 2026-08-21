import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/* Material "calendar_view_week" – the counter chip icon */
export const CalendarViewWeekIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M5.5 5h1.75c.28 0 .5.22.5.5v13c0 .28-.22.5-.5.5H5.5a.5.5 0 0 1-.5-.5v-13c0-.28.22-.5.5-.5Zm5.63 0h1.75c.27 0 .5.22.5.5v13c0 .28-.23.5-.5.5h-1.75a.5.5 0 0 1-.5-.5v-13c0-.28.22-.5.5-.5Zm5.62 0h1.75c.28 0 .5.22.5.5v13c0 .28-.22.5-.5.5h-1.75a.5.5 0 0 1-.5-.5v-13c0-.28.22-.5.5-.5Z" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}>
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

export const PlusIcon = (p: P) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.7}
    stroke="currentColor"
    aria-hidden="true"
    {...p}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);

export const MinusIcon = (p: P) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.7}
    stroke="currentColor"
    aria-hidden="true"
    {...p}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
  </svg>
);

export const ChevronDownIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
  </svg>
);

export const AccountCircleIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22Z" />
  </svg>
);

/* Font Awesome style glyphs used by the template cards */
export const ShapesIcon = (p: P) => (
  <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M315.4 15.5C309.7 5.9 299.2 0 288 0s-21.7 5.9-27.4 15.5l-96 160c-5.9 9.9-6.1 22.2-.4 32.2s16.3 16.2 27.8 16.2l192 0c11.5 0 22.2-6.2 27.8-16.2s5.5-22.3-.4-32.2l-96-160zM288 312c0 22.1 17.9 40 40 40l144 0c22.1 0 40-17.9 40-40l0-144c0-22.1-17.9-40-40-40l-144 0c-22.1 0-40 17.9-40 40l0 144zM128 512a128 128 0 1 0 0-256 128 128 0 1 0 0 256z" />
  </svg>
);

export const ExternalLinkIcon = (p: P) => (
  <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" />
  </svg>
);

export const EllipsisVerticalIcon = (p: P) => (
  <svg viewBox="0 0 128 512" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z" />
  </svg>
);

export const ArrowDownIcon = (p: P) => (
  <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
  </svg>
);

export const XMarkIcon = (p: P) => (
  <svg viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
  </svg>
);

export const FaqIcon = (p: P) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    {...p}
  >
    <title>faq</title>
    <g fill="currentColor">
      <path d="M8,1A7,7,0,1,0,15,8,7.008,7.008,0,0,0,8,1Zm.25,10.5a.75.75,0,1,1-.75.75A.75.75,0,0,1,8.25,11.5ZM9.25,8.75A1.25,1.25,0,0,0,8,10H7a2.25,2.25,0,0,1,4.5,0c0,1.09-.7,1.568-1.33,2.011-.46.32-.92.64-.92,1.239v.25h-1v-.25c0-.94.6-1.35,1.12-1.71.59-.41,1.13-.78,1.13-1.54A1.25,1.25,0,0,0,9.25,8.75Z" />
    </g>
  </svg>
);

/* Footer column glyphs */
export const FooterAppIcon = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" {...p}>
    <g fill="#A1A1AA" stroke="#A78BFA">
      <path d="M9.286,15.25H3.75c-1.105,0-2-.895-2-2V4.75c0-1.105,.895-2,2-2H14.25c1.105,0,2,.895,2,2v4.902" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <circle cx="4.25" cy="5.25" r=".75" stroke="none" />
      <circle cx="6.75" cy="5.25" r=".75" stroke="none" />
      <path d="M10.655,10.269l6.397,2.337c.27,.098,.262,.482-.012,.57l-2.928,.937-.937,2.928c-.087,.273-.471,.281-.57,.012l-2.337-6.397c-.088-.241,.146-.474,.386-.386Z" fill="none" stroke="inherit" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const FooterProductIcon = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" {...p}>
    <g fill="#A1A1AA" stroke="#A78BFA">
      <path d="M11.25,6.25h4c.552,0,1,.448,1,1V15.25c0,.552-.448,1-1,1h-5V7.25c0-.552,.448-1,1-1Z" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="12.75" y1="8.75" x2="13.75" y2="8.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="12.75" y1="11.25" x2="13.75" y2="11.25" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="12.75" y1="13.75" x2="13.75" y2="13.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M2.75,8.75H6.75c.552,0,1,.448,1,1v6.5H2.75c-.552,0-1-.448-1-1v-5.5c0-.552,.448-1,1-1Z" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="4.25" y1="11.25" x2="5.25" y2="11.25" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="4.25" y1="13.75" x2="5.25" y2="13.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M5.25,6.25v-1.802c0-.42,.262-.794,.656-.939L11.406,1.493c.653-.239,1.344,.244,1.344,.939v1.318" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="7.75" y1="16.25" x2="10.25" y2="16.25" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const FooterResourcesIcon = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" {...p}>
    <g fill="#A1A1AA" stroke="#A78BFA">
      <line x1="5.75" y1="6.75" x2="7.75" y2="6.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="5.75" y1="9.75" x2="12.25" y2="9.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="5.75" y1="12.75" x2="12.25" y2="12.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M2.75,14.25V3.75c0-1.105,.895-2,2-2h5.586c.265,0,.52,.105,.707,.293l3.914,3.914c.188,.188,.293,.442,.293,.707v7.586c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2Z" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M15.16,6.25h-3.41c-.552,0-1-.448-1-1V1.852" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const FooterLegalIcon = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" {...p}>
    <g fill="#A1A1AA" stroke="#A78BFA">
      <line x1="7.25" y1="3.75" x2="3.525" y2="3.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="10.75" y1="3.75" x2="14.475" y2="3.75" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M.775,9.25c-.008,.083-.025,.164-.025,.25,0,1.519,1.231,2.75,2.75,2.75s2.75-1.231,2.75-2.75c0-.086-.018-.167-.025-.25H.775Z" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M17.225,9.25c.008,.083,.025,.164,.025,.25,0,1.519-1.231,2.75-2.75,2.75-1.519,0-2.75-1.231-2.75-2.75,0-.086,.018-.167,.025-.25h5.45Z" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <polyline points="6.225 9.25 3.525 3.75 .775 9.25" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <polyline points="11.775 9.25 14.475 3.75 17.225 9.25" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <circle cx="9" cy="3.75" r="1.75" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="9" y1="5.5" x2="9" y2="15.75" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="13.25" y1="15.75" x2="4.75" y2="15.75" fill="none" stroke="#A1A1AA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </g>
  </svg>
);

export const BlogIcon = (p: P) => (
  <svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...p}>
    <title>Blog</title>
    <path d="M172.2 226.8c-14.6-2.9-28.2 8.9-28.2 23.8V301c0 10.2 7.1 18.4 16.7 22 18.2 6.8 31.3 24.4 31.3 45 0 26.5-21.5 48-48 48s-48-21.5-48-48V120c0-13.3-10.7-24-24-24H24c-13.3 0-24 10.7-24 24v248c0 89.5 82.1 160.2 175 140.7 54.4-11.4 98.3-55.4 109.7-109.7 17.4-82.9-37-157.2-112.5-172.2zM209 0c-9.2-.5-17 6.8-17 16v31.6c0 8.5 6.6 15.5 15 15.9 129.4 7 233.4 112 240.9 241.5 .5 8.4 7.5 15 15.9 15h32.1c9.2 0 16.5-7.8 16-17C503.4 139.8 372.2 8.6 209 0zm.3 96c-9.3-.7-17.3 6.7-17.3 16.1v32.1c0 8.4 6.5 15.3 14.8 15.9 76.8 6.3 138 68.2 144.9 145.2 .8 8.3 7.6 14.7 15.9 14.7h32.2c9.3 0 16.8-8 16.1-17.3-8.4-110.1-96.5-198.2-206.6-206.7z" />
  </svg>
);

export const FacebookIcon = (p: P) => (
  <svg fill="currentColor" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" {...p}>
    <title>Facebook</title>
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
  </svg>
);

export const XIcon = (p: P) => (
  <svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...p}>
    <title>X</title>
    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
  </svg>
);

export const YouTubeIcon = (p: P) => (
  <svg fill="currentColor" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg" {...p}>
    <title>YouTube</title>
    <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
  </svg>
);

const MENU_GLYPHS: Record<string, string> = {
  message:
    "M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9z",
  question:
    "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z",
  video:
    "M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1l0-17.1 0-128 0-17.1 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z",
  rss: "M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm32 64l16 0c123.7 0 224 100.3 224 224l0 16c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-16c0-88.4-71.6-160-160-160l-16 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 96l16 0c70.7 0 128 57.3 128 128l0 16c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-16c0-35.3-28.7-64-64-64l-16 0c-17.7 0-32-14.3-32-32s14.3-32 32-32zm48 176a48 48 0 1 1 -96 0 48 48 0 1 1 96 0z",
  chart:
    "M0 208a208 208 0 1 1 416 0A208 208 0 1 1 0 208zM337 393.7c-38.6 26.4-85.2 41.8-135.4 41.8c-8.5 0-16.9-.4-25.1-1.3L337 393.7zM208 96c-8.8 0-16 7.2-16 16l0 32-32 0c-8.8 0-16 7.2-16 16l0 96c0 8.8 7.2 16 16 16l32 0 0 32c0 8.8 7.2 16 16 16s16-7.2 16-16l0-32 32 0c8.8 0 16-7.2 16-16l0-96c0-8.8-7.2-16-16-16l-32 0 0-32c0-8.8-7.2-16-16-16z",
  history:
    "M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z",
  badge:
    "M256 0c36.8 0 68.8 20.7 84.9 51.1C373.8 41 411 49 437 75s34 63.3 23.9 96.1C491.3 187.2 512 219.2 512 256s-20.7 68.8-51.1 84.9C471 373.8 463 411 437 437s-63.3 34-96.1 23.9C324.8 491.3 292.8 512 256 512s-68.8-20.7-84.9-51.1C138.2 471 101 463 75 437s-34-63.3-23.9-96.1C20.7 324.8 0 292.8 0 256s20.7-68.8 51.1-84.9C41 138.2 49 101 75 75s63.3-34 96.1-23.9C187.2 20.7 219.2 0 256 0zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z",
  astronaut:
    "M370.7 96.1C346.1 39.5 289.7 0 224 0S101.9 39.5 77.3 96.1C60.9 97.5 48 111.2 48 128l0 64c0 16.8 12.9 30.5 29.3 31.9C101.9 280.5 158.3 320 224 320s122.1-39.5 146.7-96.1c16.4-1.4 29.3-15.1 29.3-31.9l0-64c0-16.8-12.9-30.5-29.3-31.9zM336 144l0 16c0 53-43 96-96 96l-32 0c-53 0-96-43-96-96l0-16c0-26.5 21.5-48 48-48l128 0c26.5 0 48 21.5 48 48zM189.3 162.7l-6-21.2c-.9-3.3-3.9-5.5-7.3-5.5s-6.4 2.2-7.3 5.5l-6 21.2-21.2 6c-3.3 .9-5.5 3.9-5.5 7.3s2.2 6.4 5.5 7.3l21.2 6 6 21.2c.9 3.3 3.9 5.5 7.3 5.5s6.4-2.2 7.3-5.5l6-21.2 21.2-6c3.3-.9 5.5-3.9 5.5-7.3s-2.2-6.4-5.5-7.3l-21.2-6zM112.7 352C50.5 354.8 0 405.6 0 468.3C0 492.4 19.6 512 43.7 512l166.7 0-24.9-99.5c-1.4-5.5-.1-11.2 3.4-15.7s8.9-7 14.6-6.9l31.9 0-38.1-38.1c-4.4-4.4-5.9-10.9-3.9-16.8s7.1-10.1 13.2-11l-71.5 0-22.4 27.9zM335.3 352l-71.5 0c6.2 .9 11.3 5.1 13.2 11s.5 12.4-3.9 16.8L235 417.9l31.9 0c5.7 0 11.1 2.5 14.6 6.9s4.8 10.2 3.4 15.7L260 512l144.3 0c24.1 0 43.7-19.6 43.7-43.7c0-62.8-50.5-113.5-112.7-116.3z",
  at: "M256 64C150 64 64 150 64 256s86 192 192 192c17.7 0 32 14.3 32 32s-14.3 32-32 32C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256l0 32c0 53-43 96-96 96c-29.3 0-55.6-13.2-73.2-33.9C320 371.1 289.5 384 256 384c-70.7 0-128-57.3-128-128s57.3-128 128-128c27.9 0 53.7 8.9 74.7 24.1c5.7-5 13.1-8.1 21.3-8.1c17.7 0 32 14.3 32 32l0 80 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32c0-106-86-192-192-192zm64 192a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z",
  shapes:
    "M315.4 15.5C309.7 5.9 299.2 0 288 0s-21.7 5.9-27.4 15.5l-96 160c-5.9 9.9-6.1 22.2-.4 32.2s16.3 16.2 27.8 16.2l192 0c11.5 0 22.2-6.2 27.8-16.2s5.5-22.3-.4-32.2l-96-160zM288 312c0 22.1 17.9 40 40 40l144 0c22.1 0 40-17.9 40-40l0-144c0-22.1-17.9-40-40-40l-144 0c-22.1 0-40 17.9-40 40l0 144zM128 512a128 128 0 1 0 0-256 128 128 0 1 0 0 256z",
  user: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-352a64 64 0 1 1 0 128 64 64 0 1 1 0-128zM144 400c0-44.2 35.8-80 80-80l64 0c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16z",
  clone:
    "M288 448L64 448l0-224 64 0 0-64-64 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-64-64 0 0 64zm-64-96l224 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L224 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64z",
  layers:
    "M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 240c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 272c-17.7 0-32-14.3-32-32zm64 144c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32z",
};

export function MenuGlyph({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const d = MENU_GLYPHS[name];
  if (!d) return null;
  const viewBox =
    name === "video" ? "0 0 576 512" : name === "astronaut" ? "0 0 448 512" : "0 0 512 512";
  return (
    <svg viewBox={viewBox} fill="currentColor" aria-hidden="true" className={className}>
      <path d={d} />
    </svg>
  );
}
