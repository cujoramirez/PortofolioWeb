/** Inline stroke icons (decorative: always aria-hidden; the control carries the label). */
import type { ReactNode } from 'react';

const Icon = ({ children, size = 20 }: { children: ReactNode; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const SunIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
  </Icon>
);

export const MoonIcon = () => (
  <Icon>
    <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8Z" />
  </Icon>
);

export const MenuIcon = () => (
  <Icon size={22}>
    <path d="M4 8h16M4 16h16" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon size={22}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const ArrowUpRight = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
);

/** Opens here, larger (a link that leaves carries ArrowUpRight instead). */
export const ExpandIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M14 5h5v5M19 5l-6 6M10 19H5v-5M5 19l6-6" />
  </Icon>
);

/** Plays here. */
export const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M8 5.5v13l10.5-6.5Z" />
  </Icon>
);

export const CopyIcon = () => (
  <Icon>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </Icon>
);

export const CheckIcon = () => (
  <Icon>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
