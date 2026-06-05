import { defineConfig } from "umi";
import routes from "./config/routes";
import path from "path";

export default defineConfig({
  define: {
    'process.env.API_URL': process.env.API_URL || 'http://localhost:3000',
  },
  theme: {
    token: {
      colorPrimary: '#2563EB',
      borderRadius: 10,
      colorBgLayout: '#F8FAFC',
      colorText: '#0F172A',
      fontFamily: 'Inter',
    },
  },
  routes,
  npmClient: 'npm',
  history: { type: 'browser' },
  publicPath: '/',
  esbuildMinifyIIFE: true,
  alias: {
    react: path.dirname(require.resolve('react/package.json')),
    'react-dom': path.dirname(require.resolve('react-dom/package.json')),
  },
  mfsu: false,
});