import { FacebookIcon, XIcon } from "./icons";

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    >
      {children}
    </a>
  );
}

export function ShareRow({ name, url }: { name: string; url: string }) {
  const enc = encodeURIComponent(url);
  return (
    <div className="mt-4 flex flex-wrap items-center">
      <IconLink
        label="Share template by email"
        href={`mailto:?subject=${encodeURIComponent(
          `${name} | screenKit Template`,
        )}&body=%20${enc}`}
      >
        <svg viewBox="0 0 512 512" fill="currentColor" className="h-7 w-7">
          <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm48 128l288 0c8.8 0 16 7.2 16 16l0 16c0 8.4-3.9 16.3-10.6 21.4l-112 84c-19.9 14.9-47.1 14.9-67 0l-112-84C107.9 208.3 104 200.4 104 192l0-16c0-8.8 7.2-16 16-16z" />
        </svg>
      </IconLink>
      <IconLink
        label="Share template on X"
        href={`https://x.com/intent/tweet?url=${enc}&text=`}
      >
        <XIcon className="h-6 w-6" />
      </IconLink>
      <IconLink
        label="Share template on Facebook"
        href={`https://www.facebook.com/dialog/share?display=popup&href=${enc}`}
      >
        <FacebookIcon className="h-6 w-6" />
      </IconLink>
      <IconLink
        label="Share template on LinkedIn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
      >
        <svg viewBox="0 0 448 512" fill="currentColor" className="h-7 w-7">
          <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
        </svg>
      </IconLink>
      <IconLink
        label="Share template on Reddit"
        href={`https://reddit.com/submit?url=${enc}&title=${encodeURIComponent(
          `${name} | screenKit Template`,
        )}`}
      >
        <svg viewBox="0 0 512 512" fill="currentColor" className="h-7 w-7">
          <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM305.9 166.4a35 35 0 1 1 25.6 33.7c-1.5 30.3-32.5 54.6-70.7 56.6l0 .1c37.5 1.6 68.3 22.9 73.7 51.1a30 30 0 1 1-14 41.6c-14.2 17.4-42.6 29.2-75.4 29.2s-61.2-11.8-75.4-29.2a30 30 0 1 1-14-41.6c5.4-28.2 36.2-49.5 73.7-51.1l0-.1c-38.4-2-69.4-26.4-70.8-56.9a35 35 0 1 1 25.7-33.4c0 18.5 20.6 33.6 46.2 34.5l0-.2 29 0 0 .2c25.6-.9 46.2-16 46.2-34.5z" />
        </svg>
      </IconLink>
    </div>
  );
}
