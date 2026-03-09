import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { Layout } from './components/Layout'
import { LibraryPage } from './pages/LibraryPage'
import { ReaderPage } from './pages/ReaderPage'
import { SettingsPage } from './pages/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/library" replace /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'reader/:bookId', element: <ReaderPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
