"use client";

import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { C } from './EstimateLayout';

type Theme = 'light' | 'dark';
const key = 'formit-admin-theme';
const ThemeContext = createContext({ theme: 'light' as Theme, toggle: () => {} });

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    try { if (localStorage.getItem(key) === 'dark') setTheme('dark'); } catch { /* Storage can be disabled. */ }
    const sync = (event: StorageEvent) => {
      if (event.key === key) setTheme(event.newValue === 'dark' ? 'dark' : 'light');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem(key, next); } catch { /* The current tab still works. */ }
  };
  const dark = theme === 'dark';
  const style = {
    '--admin-bg': dark ? '#151719' : '#F3F4F6',
    '--admin-surface': dark ? '#202326' : '#FFFFFF',
    '--admin-raised': dark ? '#2B2F34' : '#EAEDF1',
    '--admin-line': dark ? '#3A4048' : '#E3E6EB',
    '--admin-text': dark ? '#F2F3F5' : '#20242C',
    '--admin-muted': dark ? '#B4BCC7' : '#626B79',
    '--admin-subtle': dark ? '#A4AEBB' : '#707989',
    '--admin-accent-bg': dark ? '#393218' : '#FFF6CC',
    '--admin-total-bg': dark ? '#4A3D15' : '#FFEB99',
    '--admin-accent-text': dark ? '#F5D66C' : '#806100',
    '--admin-metric-edge': dark ? 'transparent' : '#E3E6EB',
    '--admin-metric-accent-edge': dark ? 'transparent' : C.primary,
    minHeight: '100vh', colorScheme: theme, background: C.admin.bg, color: C.admin.text,
  } as CSSProperties;
  return <ThemeContext.Provider value={{ theme, toggle }}><div data-admin-theme={theme} style={style}>{children}</div></ThemeContext.Provider>;
}

export function AdminThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  const dark = theme === 'dark';
  return <button type="button" onClick={toggle} aria-label={dark ? '밝은 모드로 전환' : '어두운 모드로 전환'}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '7px 12px', borderRadius: 8, border: `1px solid ${C.admin.line}`, background: C.admin.surface, color: C.admin.text, fontSize: 13 }}>
    {dark ? <IconSun size={16} aria-hidden="true" /> : <IconMoon size={16} aria-hidden="true" />}
    {dark ? '밝은 모드' : '어두운 모드'}
  </button>;
}
