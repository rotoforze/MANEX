import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import '../public/styles/App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import {RootLayout} from './routes/RootLayout';
import {ErrorPage} from './routes/ErrorPage';
import LoginPage from './routes/LoginPage';
import SignInPage from './routes/SignInPage';
import {Dashboard} from './routes/Dashboard';
import {inciarSesion as actionInicioSesion} from './utils/AuthUser';
import {loaderAuthTokenCookie as loaderCookie, UserProvider} from './context/UserContext';
import {Profile} from "./routes/Profile.jsx";
import {Configuration} from "./routes/Configuration.jsx";
import {Logout} from "./routes/Logout.jsx";

/**
 * Contiene el router de la aplicación, parte más alta de la aplicación.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @version 1.2.0
 * @constructor
 */
function App() {
  const router = createBrowserRouter([{
    path: '/',
    element: <RootLayout />,
    loader: loaderCookie,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <LoginPage />, action: actionInicioSesion },
      { path: '/error', element: <ErrorPage /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/signinpage', element: <SignInPage /> },
      { path: '/profile', element: <Profile/>},
      { path: '/configuration', element: <Configuration/>},
      { path: '/logout', element: <Logout/>}
        ]
    }]);

    return (
        <UserProvider>
            <RouterProvider router={router}/>
        </UserProvider>
    )
}

export default App
