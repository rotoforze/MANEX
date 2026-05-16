import express, { urlencoded } from 'express';
import cors from 'cors';
import { login } from "./API/login.mjs";
import { listaEmpleados } from "./API/empleados/listado.mjs";
import getEmpleado from "./API/empleados/empleado.mjs";
import { listaProductos } from "./API/productos/listado.mjs";
import getProducto from "./API/productos/producto.mjs";
import getContrato from "./API/contratos/contrato.mjs";
import { listaContratos } from "./API/contratos/listado.mjs";
import delContrato from "./API/contratos/eliminar.mjs";
import newContrato from "./API/contratos/nuevo.mjs";
import getDepartamento from "./API/departamentos/departamento.mjs";
import delDepartamento from "./API/departamentos/eliminar.mjs";
import newDepartamento from "./API/departamentos/nuevo.mjs";
import { listaDepartamentos } from "./API/departamentos/listado.mjs";
import auth from "./API/middlewareAutenticación.mjs";
import registrar from "./API/empleados/registrar.mjs";
import actualizar from "./API/empleados/actualizar.mjs";
import delEmpleado from "./API/empleados/eliminar.mjs";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: "json" };
import paginacion from "./API/paginacion.mjs";
import listadoPermisos from "./API/permisos/listado.mjs";
import guardarPermisos from "./API/permisos/guardar.mjs";
import eliminarPermisos from "./API/permisos/eliminar.mjs";

import { resumenDashboard } from "./API/dashboard/resumen.mjs";
import { cambiarPassword, solicitarRecuperacion, aplicarReset, listarSolicitudes, gestionarSolicitud } from "./API/password/password.mjs";
import {listaFichajes} from "./API/fichajes/listado.mjs";
import registrarFichaje from "./API/fichajes/nuevo.mjs";
import actualizarFichaje from "./API/fichajes/actualizar.mjs";
import delFichaje from "./API/fichajes/eliminar.mjs";
import getFichaje from "./API/fichajes/fichaje.mjs";

import {listaIncidencias} from "./API/incidencias/listado.mjs";
import registrarIncidencias from "./API/incidencias/nuevo.mjs";
import actualizarIncidencia from "./API/incidencias/actualizar.mjs";
import delIncidencia from "./API/incidencias/eliminar.mjs";
import getIncidencia from "./API/incidencias/incidencia.mjs";

import {listaSolicitudesVacaciones} from "./API/vacaciones/listado.mjs";
import registrarSolicitudVacaciones from "./API/vacaciones/nuevo.mjs";
import actualizarSolicitudVacaciones from "./API/vacaciones/actualizar.mjs";
import delVacaciones from "./API/vacaciones/eliminar.mjs";
import getSolicitud from "./API/vacaciones/solicitudVacaciones.mjs";
import delProducto from "./API/productos/eliminar.mjs";
import nuevoProducto from "./API/productos/nuevo.mjs";

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(auth);
app.get('/', (req, res) => {
    res.send({
        status: 200,
        body: {
            'login': ['/login', 'GET'],
            'empleados': {
                'listado': ['/empleados', 'GET'],
                'empleado': ['/empleados/', 'GET'],
                'nuevoEmpleado': ['/empleados', 'POST'],
                'eliminarEmpleado': ['/empleados', 'DELETE'],
                'actualizarEmpleado': ['/empleados', 'POST']
            },
            'inventario': {
                'listado': ['/productos', 'GET'],
                'producto': ['/productos/', 'GET'],
            },
            'contrato': {
                'listado': ['/contratos', 'GET'],
                'contrato': ['/contratos/', 'GET'],
                'nuevoContrato': ['/contratos', 'POST'],
                'eliminarContrato': ['/contratos/', 'DELETE']
            },
            'departamento': {
                'listado': ['/departamentos', 'GET'],
                'departamento': ['/departamentos/', 'GET'],
                'nuevoDepartamento': ['/departamentos', 'POST'],
                'eliminarDepartamento': ['/departamentos/', 'DELETE']
            },
            'fichaje': {
                'listado': ['/fichajes', 'GET'],
                'fichaje': ['/fichajes/', 'GET'],
                'nuevoFichaje': ['/fichajes', 'POST'],
                'eliminarFichajes': ['/fichajes/', 'DELETE']
            },
            'incidencia': {
                'listado': ['/incidencias', 'GET'],
                'incidencia': ['/incidencias/', 'GET'],
                'nuevaIncidencia': ['/incidencias', 'POST'],
                'eliminarIncidencia': ['/incidencias/', 'DELETE']
            },
            'solicitud_Vacacion': {
                'listado': ['/vacaciones', 'GET'],
                'solicitudVacacion': ['/vacaciones/', 'GET'],
                'nuevaSolicitud': ['/vacaciones', 'POST'],
                'eliminarSolicitud': ['/vacaciones/', 'DELETE']
            }
        }
    });
})

app.post('/login', (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            body: {
                'message': 'Not valid body: ' + req
            }
        });
    }
    login(req, res);

})

app.get('/dashboard', (req, res) => {
    resumenDashboard(req, res);
});

app.get('/empleados', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    if (req?.query?.id) {
        getEmpleado(req, res);

    } else listaEmpleados(req, res);
});

app.get('/fichajes', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }
    if (req?.query?.username && (!req?.query?.cantidad && !req?.query?.pagina)) {
        getFichaje(req, res);
    } else listaFichajes(req, res);
});


app.get('/productos', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    if (req?.query?.id) {
        getProducto(req, res);

    } else listaProductos(req, res);
});

app.get('/contratos', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    if (req?.query?.id) {
        getContrato(req, res);

    } else listaContratos(req, res);
});

app.get('/departamentos', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    if (req?.query?.id) {
        getDepartamento(req, res);

    } else listaDepartamentos(req, res);
});

app.get('/vacaciones', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    const tienePaginacion = req?.query?.pagina !== undefined || req?.query?.cantidad !== undefined;
    if (!tienePaginacion && (req?.query?.id_empleado || (req?.query?.fecha_inicio && req?.query?.fecha_fin))) {
        getSolicitud(req, res);
    } else listaSolicitudesVacaciones(req, res);
});

app.get('/incidencias', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    if (req?.query?.id) {
        getIncidencia(req, res);

    } else listaIncidencias(req, res);
});

app.get('/permisos', listadoPermisos);

app.delete('/empleados', delEmpleado);
app.delete('/productos', delProducto);
app.delete('/fichajes', delFichaje);
app.delete('/incidencias', delIncidencia);
app.delete('/contratos', delContrato);
app.delete('/departamentos', delDepartamento);
app.delete('/permisos', eliminarPermisos);
app.delete('/vacaciones', delVacaciones);

app.post('/empleados', (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            body: {
                'message': 'Not valid body: ' + req
            }
        });
    }
    // si en la petición viene un ID, vamos a actualizarUsuario
    // en vez de a registrar
    if (req?.body?.id) {
        actualizar(req, res);
    } else registrar(req, res);
});

app.post('/productos', (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            body: {
                'message': 'Not valid body: ' + req
            }
        });
    }
    return nuevoProducto(req, res);
});


app.post('/fichajes', (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            body: {
                'message': 'Not valid body: ' + req
            }
        });
    }
    // si en la petición viene un ID, vamos a actualizarFichaje
    // en vez de a registrar
    if (req?.body?.id && !req?.body?.tipo || (req?.body?.username && req?.body?.fecha_salida)) {
        actualizarFichaje(req, res);
    } else registrarFichaje(req, res);
});

app.post('/incidencias', (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            body: {
                'message': 'Not valid body: ' + req
            }
        });
    }
    // si en la petición viene un ID, vamos a actualizarIncidencia
    // en vez de a registrar
    if (req?.body?.id_incidencia) {
        actualizarIncidencia(req, res);
    } else registrarIncidencias(req, res);
});

app.post('/vacaciones', (req, res) => {
    if (!req.body) {
        return res.send({
            status: 400,
            body: {
                'message': 'Not valid body: ' + req
            }
        });
    }
    // si en la petición viene un ID, vamos a actualizarUsuario
    // en vez de a registrar
    if (req?.body?.id_incidencia) {
        actualizarSolicitudVacaciones(req, res);
    } else registrarSolicitudVacaciones(req, res);
});

app.post('/contratos', newContrato);
app.post('/departamentos', newDepartamento);

app.post('/permisos', (req, res) => {
    if (req?.body?.ruta && req?.body?.metodo) {
        return guardarPermisos(req, res);
    }
    return res.status(400).json({
        message: 'Datos inválidos'
    });
});

app.post('/password', cambiarPassword);
app.post('/recuperar', solicitarRecuperacion);
app.post('/reset', aplicarReset);
app.get('/password-requests', listarSolicitudes);
app.post('/password-requests', gestionarSolicitud);

app.listen(80, () => console.log('Escuchando llamadas en http://localhost:80'));
