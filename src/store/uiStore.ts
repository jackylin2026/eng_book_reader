import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ReaderModeState, ThemeState } from './uiTypes'
import type { ReaderPreferences } from '../types'

interface UIState {
  prefs: ReaderPreferences
  setFontFamily: (fontFamily: string) => void
  setFontSize: (fontSize: number) => void
  setLineHeight: (lineHeight: number) => void
  setHorizontalPadding: (horizontalPadding: number) => void
  setTheme: (theme: ThemeState) => void
}

const defaultPrefs: ReaderPreferences = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 20,
  lineHeight: 1.65,
  horizontalPadding: 32,
  theme: 'light',
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      prefs: defaultPrefs,
      setFontFamily: (fontFamily) =>
        set((state) => ({
          prefs: { ...state.prefs, fontFamily },
        })),
      setFontSize: (fontSize) =>
        set((state) => ({
          prefs: {
            ...state.prefs,
            fontSize: Math.min(34, Math.max(14, fontSize)),
          },
        })),
      setLineHeight: (lineHeight) =>
        set((state) => ({
          prefs: {
            ...state.prefs,
            lineHeight: Math.min(2.4, Math.max(1.2, lineHeight)),
          },
        })),
      setHorizontalPadding: (horizontalPadding) =>
        set((state) => ({
          prefs: {
            ...state.prefs,
            horizontalPadding: Math.min(96, Math.max(8, horizontalPadding)),
          },
        })),
      setTheme: (theme) => set((state) => ({ prefs: { ...state.prefs, theme } })),
    }),
    {
      name: 'eng-book-reader-ui',
    },
  ),
)

export const defaultReadingMode: ReaderModeState = 'scroll'
