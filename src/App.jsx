import { createBrowserRouter, RouterProvider } from 'react-router'
import '../public/styles/App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { RootLayout } from './routes/RootLayout';
import { ErrorPage } from './routes/ErrorPage';
import { LoginPage } from './routes/LoginPage';
import { Dashboard } from './routes/Dashboard';
import { inciarSesion as actionInicioSesion } from './utils/AuthUser';

function App() {
  const router = createBrowserRouter([{
    path: '/',
    element: <RootLayout />,
    //loader: loader,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <LoginPage />, action: actionInicioSesion},
      { path: '/dashboard', element: <Dashboard /> }
    ]
  }]);
  return (
    <RouterProvider router={router} />
  )
}

export default App
