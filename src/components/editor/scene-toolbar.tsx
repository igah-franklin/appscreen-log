"use client";

import {
  ChevronIcon,
  EraserIcon,
  GearIcon,
  GlobeIcon,
  HistoryIcon,
  IdCardIcon,
  ImageIcon,
  MobileIcon,
  RefreshIcon,
  SaveIcon,
  SparklesIcon,
  SwapIcon,
} from "./editor-icons";
import { ChevronLeftIcon } from "./editor-icons";

function Btn({
  tone,
  label,
  onClick,
  disabled,
  children,
  className = "",
}: {
  tone: "primary" | "secondary" | "success" | "danger" | "light" | "pro";
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${tone} mx-[5px] h-9 ${className}`}
    >
      {children}
    </button>
  );
}

const ICON = "h-4 w-4 shrink-0";

/** The designer's top bar. Labels collapse to icons on narrower windows. */
export function SceneToolbar({
  projectName,
  outputLabel,
  language,
  canUndo,
  onBack,
  onSave,
  onUndo,
  onClear,
  onRestyle,
  onOpenSizes,
  onOpenBackground,
  onOpenLocalize,
  onOpenScreens,
  onToggleSizeMenu,
  sizeMenuOpen,
  onExport,
  onRefresh,
  children,
}: {
  projectName: string;
  outputLabel: string;
  language: string;
  canUndo: boolean;
  onBack: () => void;
  onSave: () => void;
  onUndo: () => void;
  onClear: () => void;
  onRestyle: () => void;
  onOpenSizes: () => void;
  onOpenBackground: () => void;
  onOpenLocalize: () => void;
  onOpenScreens: () => void;
  onToggleSizeMenu: () => void;
  sizeMenuOpen: boolean;
  onExport: () => void;
  onRefresh: () => void;
  children?: React.ReactNode;
}) {
  return (
    <nav className="flex flex-nowrap items-center overflow-x-auto bg-white p-2">
      <button
        type="button"
        onClick={onBack}
        title="Back"
        aria-label="Back"
        className="btn-link mx-[5px] flex h-9 w-4 items-center justify-center text-[#121212]"
      >
        <ChevronLeftIcon className={ICON} />
      </button>

      <div className="save-split">
        <Btn tone="primary" label={`Save ${projectName}`} onClick={onSave}>
          <SaveIcon className={ICON} />
        </Btn>
      </div>

      <Btn tone="secondary" label="Switch template">
        <SwapIcon className={ICON} />
      </Btn>

      <div className="save-split has-toggle mx-[5px]">
        <button
          type="button"
          title="Undo"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={onUndo}
          className="btn btn-light h-9"
        >
          <HistoryIcon className={ICON} />
        </button>
        <button
          type="button"
          title="History / redo"
          aria-label="History / redo"
          disabled={!canUndo}
          className="btn btn-light save-split-toggle h-9"
        >
          <ChevronIcon className="h-3 w-3" />
        </button>
      </div>

      <Btn tone="danger" label="Clear all screenshots" onClick={onClear}>
        <EraserIcon className={ICON} />
      </Btn>

      <Btn tone="pro" label="Pro features" className="text-[11px] tracking-wide">
        PRO
      </Btn>

      <Btn tone="success" label="Restyle screenshots" onClick={onRestyle}>
        <SparklesIcon className={ICON} />
      </Btn>

      <Btn tone="success" label="Globals">
        <GlobeIcon className={ICON} />
        <span className="hidden xl:inline">Globals</span>
      </Btn>

      <div className="w-5 shrink-0" />

      <Btn tone="secondary" label="Setup" onClick={onOpenSizes}>
        <GearIcon className={ICON} />
        <span className="hidden xl:inline">Setup</span>
      </Btn>
      <Btn tone="secondary" label="Background" onClick={onOpenBackground}>
        <ImageIcon className={ICON} />
        <span className="hidden xl:inline">Background</span>
      </Btn>
      <Btn tone="secondary" label="Localize" onClick={onOpenLocalize}>
        <IdCardIcon className={ICON} />
        <span className="hidden xl:inline">Localize</span>
      </Btn>
      <Btn tone="secondary" label="App Screens" onClick={onOpenScreens}>
        <MobileIcon className={ICON} />
        <span className="hidden xl:inline">App Screens</span>
      </Btn>

      <div className="flex-grow" />

      <Btn tone="primary" label={`Language: ${language}`}>
        <span className="text-xs">{language}</span>
        <ChevronIcon className="h-3 w-3" />
      </Btn>

      <div className="relative mx-[5px]">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={sizeMenuOpen}
          onClick={onToggleSizeMenu}
          className="btn btn-primary h-9"
        >
          {outputLabel}
          <ChevronIcon className="h-3 w-3" />
        </button>
        {children}
      </div>

      <Btn tone="primary" label="Preview & Export" onClick={onExport}>
        <svg viewBox="0 0 24 24" fill="currentColor" className={ICON}>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m1 15h-2v-2h2zm0-4h-2V7h2z" />
        </svg>
        <span className="hidden lg:inline">Preview &amp; Export</span>
      </Btn>

      <Btn tone="secondary" label="Refresh" onClick={onRefresh}>
        <RefreshIcon className={ICON} />
      </Btn>
    </nav>
  );
}
