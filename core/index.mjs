import express, {urlencoded} from 'express';
import cors from 'cors';
import {login} from "./API/login.mjs";
import {listaEmpleados} from "./API/empleados/listado.mjs";
import getEmpleado from "./API/empleados/empleado.mjs";
import {listaProductos} from "./API/productos/listado.mjs";
import getProducto from "./API/productos/producto.mjs";
import getContrato from "./API/contratos/contrato.mjs";
import {listaContratos} from "./API/contratos/listado.mjs";
import delContrato from "./API/contratos/eliminar.mjs";
import newContrato from "./API/contratos/nuevo.mjs";
import getDepartamento from "./API/departamentos/departamento.mjs";
import delDepartamento from "./API/departamentos/eliminar.mjs";
import newDepartamento from "./API/departamentos/nuevo.mjs";
import {listaDepartamentos} from "./API/departamentos/listado.mjs";
import auth from "./API/middlewareAutenticación.mjs";
import registrar from "./API/empleados/registrar.mjs";
import actualizar from "./API/empleados/actualizar.mjs";
import delEmpleado from "./API/empleados/eliminar.mjs";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' with { type: "json" };
import paginacion from "./API/paginacion.mjs";


const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());
app.use(express.urlencoded({extended: true}));
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
                'eliminarContrato': ['/contratos/eliminar/', 'DELETE']
            },
            'departamento': {
                'listado': ['/departamentos', 'GET'],
                'departamento': ['/departamentos/', 'GET'],
                'nuevoDepartamento': ['/departamentos', 'POST'],
                'eliminarDepartamento': ['/departamentos/eliminar/', 'DELETE']
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

app.delete('/empleados', delEmpleado)
app.delete('/contratos', delContrato);
app.delete('/departamentos', delDepartamento);

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
app.post('/contratos', newContrato);
app.post('/departamentos', newDepartamento);

app.listen(80, () => console.log('Escuchando llamadas en http://localhost:80'));