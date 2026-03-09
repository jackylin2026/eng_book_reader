import { useUIStore } from '../store/uiStore'

export function SettingsPage() {
  const prefs = useUIStore((state) => state.prefs)
  const setTheme = useUIStore((state) => state.setTheme)
  const setFontFamily = useUIStore((state) => state.setFontFamily)

  return (
    <section className="card settings-page">
      <h2>Settings</h2>
      <label>
        Theme
        <select value={prefs.theme} onChange={(event) => setTheme(event.target.value as typeof prefs.theme)}>
          <option value="light">Light</option>
          <option value="sepia">Sepia</option>
          <option value="dark">Dark</option>
        </select>
      </label>

      <label>
        Font family
        <select value={prefs.fontFamily} onChange={(event) => setFontFamily(event.target.value)}>
          <option value='Georgia, "Times New Roman", serif'>Classic serif</option>
          <option value='"Iowan Old Style", "Palatino Linotype", serif'>Book serif</option>
          <option value='"Source Sans 3", "Helvetica Neue", sans-serif'>Sans</option>
        </select>
      </label>

      <p>Reader typography controls are also available in the reader toolbar.</p>
    </section>
  )
}
