import type { ReaderPreferences, ReadingMode } from '../types'

interface ReaderControlsProps {
  mode: ReadingMode
  prefs: ReaderPreferences
  onModeChange: (mode: ReadingMode) => void
  onAddBookmark: () => Promise<void>
  onFontSize: (delta: number) => void
  onLineHeight: (delta: number) => void
  onPadding: (delta: number) => void
  onTheme: (theme: ReaderPreferences['theme']) => void
}

export function ReaderControls({
  mode,
  prefs,
  onModeChange,
  onAddBookmark,
  onFontSize,
  onLineHeight,
  onPadding,
  onTheme,
}: ReaderControlsProps) {
  return (
    <div className="reader-controls">
      <div className="group">
        <button
          className={mode === 'scroll' ? 'active' : ''}
          onClick={() => onModeChange('scroll')}
        >
          Scroll
        </button>
        <button
          className={mode === 'pagination' ? 'active' : ''}
          onClick={() => onModeChange('pagination')}
        >
          Pagination
        </button>
      </div>

      <div className="group">
        <button onClick={() => onFontSize(-1)}>A-</button>
        <span>Font {prefs.fontSize}px</span>
        <button onClick={() => onFontSize(1)}>A+</button>
      </div>

      <div className="group">
        <button onClick={() => onLineHeight(-0.05)}>Line-</button>
        <span>Line {prefs.lineHeight.toFixed(2)}</span>
        <button onClick={() => onLineHeight(0.05)}>Line+</button>
      </div>

      <div className="group">
        <button onClick={() => onPadding(-4)}>Pad-</button>
        <span>Pad {prefs.horizontalPadding}px</span>
        <button onClick={() => onPadding(4)}>Pad+</button>
      </div>

      <div className="group">
        <button
          className={prefs.theme === 'light' ? 'active' : ''}
          onClick={() => onTheme('light')}
        >
          Light
        </button>
        <button
          className={prefs.theme === 'sepia' ? 'active' : ''}
          onClick={() => onTheme('sepia')}
        >
          Sepia
        </button>
        <button
          className={prefs.theme === 'dark' ? 'active' : ''}
          onClick={() => onTheme('dark')}
        >
          Dark
        </button>
      </div>

      <div className="group">
        <button onClick={() => void onAddBookmark()}>Add bookmark</button>
      </div>
    </div>
  )
}
