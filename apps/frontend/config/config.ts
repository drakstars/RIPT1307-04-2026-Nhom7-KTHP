import { defineConfig } from 'umi';

export default defineConfig({
  // ... các config hiện tại

  theme: {
    // Override Ant Design Less variables để match dark theme
    'primary-color': '#E8FF57',
    'link-color': '#E8FF57',
    'border-radius-base': '6px',
    'component-background': '#141416',
    'body-background': '#0D0D0F',
    'text-color': '#F2F2F2',
    'text-color-secondary': '#8A8A8E',
    'border-color-base': 'rgba(255,255,255,0.08)',
    'input-bg': '#141416',
    'btn-primary-color': '#0D0D0F',
    'font-family': "'Inter', -apple-system, sans-serif",
    'font-size-base': '14px',
    'card-background': '#141416',
    'modal-content-bg': '#141416',
    'popover-background': '#1C1C1F',
    'table-bg': '#141416',
    'table-header-bg': '#1C1C1F',
  },
});