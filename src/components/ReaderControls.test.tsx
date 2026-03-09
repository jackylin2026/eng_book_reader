import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ReaderControls } from './ReaderControls'

describe('ReaderControls', () => {
  it('switches mode through callback', async () => {
    const user = userEvent.setup()
    const onModeChange = vi.fn()

    render(
      <ReaderControls
        mode="scroll"
        prefs={{
          fontFamily: 'Georgia, serif',
          fontSize: 20,
          lineHeight: 1.6,
          horizontalPadding: 24,
          theme: 'light',
        }}
        onModeChange={onModeChange}
        onAddBookmark={async () => {}}
        onFontSize={() => {}}
        onLineHeight={() => {}}
        onPadding={() => {}}
        onTheme={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pagination' }))
    expect(onModeChange).toHaveBeenCalledWith('pagination')
  })
})
