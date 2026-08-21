/**
 * JavaScript Design Tokens Reference
 * Aligned strictly with Section 6.11 of Frontend_Project_Guide.md
 */

export const COLOR_TOKENS = {
  bgBase: 'var(--bg-base)',
  bgSurface: 'var(--bg-surface)',
  bgSurfaceElevated: 'var(--bg-surface-elevated)',
  colorPrimary: 'var(--color-primary)',
  colorPrimaryHover: 'var(--color-primary-hover)',
  colorAccent: 'var(--color-accent)',
  textPrimary: 'var(--text-primary)',
  textMuted: 'var(--text-muted)',
  textInverted: 'var(--text-inverted)',
  borderDefault: 'var(--border-default)',
  borderSubtle: 'var(--border-subtle)',
};

export const STATUS_TOKENS = {
  success: {
    color: 'var(--status-success)',
    bg: 'var(--status-success-bg)',
  },
  warning: {
    color: 'var(--status-warning)',
    bg: 'var(--status-warning-bg)',
  },
  danger: {
    color: 'var(--status-danger)',
    bg: 'var(--status-danger-bg)',
  },
  info: {
    color: 'var(--status-info)',
    bg: 'var(--status-info-bg)',
  },
  neutral: {
    color: 'var(--status-neutral)',
    bg: 'var(--status-neutral-bg)',
  },
};

export const RADIUS_TOKENS = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  pill: '9999px',
};

export const VIEWPORT_CLASSES = {
  mobileSmall: 320,
  mobileStandard: 375,
  mobileMedium: 390,
  mobileLarge: 430,
  tabletVertical: 768,
  tabletMedium: 820,
  tabletHorizontal: 1024,
  laptop: 1280,
  desktop: 1440,
  largeDesktop: 1920,
};
