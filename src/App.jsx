import { createBrowserRouter, RouterProvider } from 'react-router'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { RootLayout } from './routes/RootLayout';
import { ErrorPage } from './routes/ErrorPage';
import { LoginPage } from './routes/LoginPage';
import { Dashboard } from './routes/Dashboard';

function App() {
  const router = createBrowserRouter([{
    path: '/',
    element: <RootLayout />,
    //loader: loader,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <LoginPage /> },
      { path: '/dashboard', element: <Dashboard /> }
    ]
  }]);
  return (
    <RouterProvider router={router} />
  )
}

export default App
