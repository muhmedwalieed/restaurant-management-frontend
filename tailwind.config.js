/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
        },
        brand: {
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
        },
        txt: {
          primary: 'var(--text-primary)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
          inverted: 'var(--text-inverted)',
        },
        border: {
          default: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
        },
        status: {
          success: 'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          danger: 'var(--status-danger)',
          'danger-bg': 'var(--status-danger-bg)',
          info: 'var(--status-info)',
          'info-bg': 'var(--status-info-bg)',
          neutral: 'var(--status-neutral)',
          'neutral-bg': 'var(--status-neutral-bg)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'content-max': '1280px',
      },
    },
  },
  plugins: [],
};
