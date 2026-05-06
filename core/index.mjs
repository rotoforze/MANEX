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

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
    res.send({
        status: 200,
        body: {
            'login': '/login',
            'empleados': {
                'listado': '/empleados',
                'usuario': '/empleados/'
            },
            'inventario': {
                'listado': '/productos',
                'producto': '/productos/'
            },
            'contrato': {
                'listado': '/contratos',
                'contrato': '/contratos/',
                'nuevoContrato': '/contratos/nuevo',
                'eliminarContrato': '/contratos/eliminar/'
            }
        }
    });
})




app.post('/login', (req, res) => {
    if (!req.body) {
        res.send({
            status: 400,
            body: {
                'message': 'Not valid body: ' + req
            }
        });
        return;
    }
    login(req, res);

})

app.get('/empleados', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !Paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    listaEmpleados(req, res);
});

app.get('/productos', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !Paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    listaProductos(req, res);
});

app.get('/contratos', (req, res) => {
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !Paginacion.PARAMETROS_PERMITIDOS.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    listaContratos(req, res);
});

app.get('/empleados/:id', getEmpleado);
app.get('/productos/:id', getProducto);
app.get('/contratos/:id', getContrato);

app.delete('/contratos/:id', delContrato);

app.listen(80, () => console.log('Escuchando llamadas en http://localhost:80'));