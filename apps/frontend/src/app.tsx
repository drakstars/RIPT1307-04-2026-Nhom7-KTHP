import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App, theme as antTheme } from 'antd';
import 'antd/dist/reset.css';
import './styles/global.less';
import { useSettingsStore } from '@/stores/settings.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Wrapper that reads theme from settings store and passes it to Ant Design ConfigProvider
const AntdThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentTheme = useSettingsStore((s) => s.theme);

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#E8FF57',
          colorPrimaryText: '#0D0D0F',
          colorBgBase: currentTheme === 'dark' ? '#141416' : '#FFFFFF',
          colorTextBase: currentTheme === 'dark' ? '#F2F2F2' : '#1C1C1E',
          borderRadius: 6,
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontSize: 14,
          colorBorder: currentTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          colorBgContainer: currentTheme === 'dark' ? '#141416' : '#FFFFFF',
          colorBgElevated: currentTheme === 'dark' ? '#1C1C1F' : '#FFFFFF',
          colorBgLayout: currentTheme === 'dark' ? '#0D0D0F' : '#F7F7FA',
          colorText: currentTheme === 'dark' ? '#F2F2F2' : '#1C1C1E',
          colorTextSecondary: currentTheme === 'dark' ? '#8A8A8E' : '#636366',
          colorTextPlaceholder: currentTheme === 'dark' ? '#4A4A50' : '#AEAEB2',
          colorFillSecondary: currentTheme === 'dark' ? '#1C1C1F' : '#F0F0F3',
          colorFill: currentTheme === 'dark' ? '#242428' : '#E4E4E9',
          colorSplit: currentTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        },
        components: {
          Switch: {
            colorPrimary: '#E8FF57',
            colorPrimaryHover: '#D2EC3B',
          },
          Modal: {
            contentBg: currentTheme === 'dark' ? '#141416' : '#FFFFFF',
            headerBg: currentTheme === 'dark' ? '#141416' : '#FFFFFF',
            titleColor: currentTheme === 'dark' ? '#F2F2F2' : '#1C1C1E',
          },
          Input: {
            colorBgContainer: currentTheme === 'dark' ? '#141416' : '#FFFFFF',
            colorText: currentTheme === 'dark' ? '#F2F2F2' : '#1C1C1E',
          },
          InputNumber: {
            colorBgContainer: currentTheme === 'dark' ? '#141416' : '#FFFFFF',
            colorText: currentTheme === 'dark' ? '#F2F2F2' : '#1C1C1E',
          },
          Select: {
            colorBgContainer: currentTheme === 'dark' ? '#141416' : '#FFFFFF',
            colorText: currentTheme === 'dark' ? '#F2F2F2' : '#1C1C1E',
          },
          Segmented: {
            itemColor: currentTheme === 'dark' ? '#8A8A8E' : '#636366',
            itemSelectedColor: currentTheme === 'dark' ? '#F2F2F2' : '#1C1C1E',
            itemSelectedBg: currentTheme === 'dark' ? '#242428' : '#FFFFFF',
            trackBg: currentTheme === 'dark' ? '#1C1C1F' : '#F0F0F3',
          },
          Radio: {
            colorBgContainer: currentTheme === 'dark' ? '#1C1C1F' : '#FFFFFF',
            colorText: currentTheme === 'dark' ? '#8A8A8E' : '#636366',
            colorBorder: currentTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
          Divider: {
            colorSplit: currentTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
          Form: {
            labelColor: currentTheme === 'dark' ? '#8A8A8E' : '#636366',
          },
          Popconfirm: {
            colorBgElevated: currentTheme === 'dark' ? '#1C1C1F' : '#FFFFFF',
          },
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
};

export function rootContainer(container: React.ReactNode) {
  return (
    <QueryClientProvider client={queryClient}>
      <AntdThemeProvider>
        {container}
      </AntdThemeProvider>
    </QueryClientProvider>
  );
}