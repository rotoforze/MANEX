import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../public/styles/App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { RootLayout } from './routes/RootLayout';
import { ErrorPage } from './routes/ErrorPage';
import LoginPage from './routes/LoginPage';
import { Landing } from './routes/Landing';
import { Dashboard } from './routes/Dashboard';
import { inciarSesion as actionInicioSesion } from './utils/AuthUser';
import { registrarUsuario as actionRegistroEmpleado } from "./utils/RegisterNewUser.js";
import { registrarProducto as actionRegistroProducto } from "./utils/RegisterNewProduct.js";
import { registrarContrato as actionRegistroContrato } from "./utils/RegisterNewContrato.js";
import { registrarDepartamento as actionRegistroDepartamento } from "./utils/RegisterNewDepartamento.js";
import { registrarFichaje as actionRegistroFichaje } from "./utils/RegisterNewFichaje.js";
import { registrarIncidencia as actionRegistroIncidencia } from "./utils/RegisterNewIncidencia.js";
import { registrarSolicitud as actionRegistroSolicitud } from "./utils/RegisterNewSolicitud.js";
import { loaderAuthTokenCookie as loaderCookie, UserProvider } from './context/UserContext';
import { Profile } from "./routes/Profile.jsx";
import { Configuration } from "./routes/Configuration.jsx";
import { Logout } from "./routes/Logout.jsx";
import { Empleados } from "./routes/Empleados.jsx";
import { Productos } from "./routes/Productos.jsx";
import { Fichajes } from "./routes/Fichajes.jsx";
import { Incidencias } from "./routes/Incidencia.jsx";
import { Solicitudes } from "./routes/Solicitudes.jsx";
import { Contratos } from "./routes/Contratos.jsx";
import { Departamentos } from "./routes/Departamentos.jsx";

/**
 * Contiene el router de la aplicación, parte más alta de la aplicación.
 *
 * @returns {React.JSX.Element}
 * @author Alex Bernardos Gil
 * @contributor Eneas de la Rosa Menéndez Pedrosa
 * @version 1.2.1
 * @constructor
 */
function App() {

    const router = createBrowserRouter([{
        path: '/', element: <RootLayout />, loader: loaderCookie, errorElement: <ErrorPage />,

        children: [

            { path: '/', element: <Landing /> },
            { path: '/login', element: <LoginPage />, action: actionInicioSesion },
            { path: '/error', element: <ErrorPage /> },
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/empleados', element: <Empleados />, action: actionRegistroEmpleado },
            { path: '/productos', element: <Productos />, action: actionRegistroProducto },
            { path: '/contratos', element: <Contratos />, action: actionRegistroContrato },
            { path: '/departamentos', element: <Departamentos />, action: actionRegistroDepartamento },
            { path: '/fichajes', element: <Fichajes />, action: actionRegistroFichaje },
            { path: '/incidencia', element: <Incidencias />, action: actionRegistroIncidencia },
            { path: '/solicitudes', element: <Solicitudes />, action: actionRegistroSolicitud },
            { path: '/profile', element: <Profile /> },
            { path: '/configuration', element: <Configuration /> },
            { path: '/logout', element: <Logout /> },
            { path: '*', element: <ErrorPage /> }

        ]
    }]);

    return (<UserProvider>
        <RouterProvider router={router} />
    </UserProvider>)
}

export default App
