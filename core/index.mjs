import express, {urlencoded} from 'express';
import cors from 'cors';
import {login} from "./API/login.mjs";
import {listaEmpleados} from "./API/empleados/listado.mjs";
import getEmpleado from "./API/empleados/empleado.mjs";
import {listaProductos} from "./API/productos/listado.mjs";
import getProducto from "./API/productos/producto.mjs";

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

    const parametrosPermitidos = ['cantidad', 'pagina'];
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !parametrosPermitidos.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    listaEmpleados(req, res);
});


app.get('/productos', (req, res) => {

    const parametrosPermitidos = ['cantidad', 'pagina'];
    const parametrosRecibidos = Object.keys(req.query);

    const parametrosNoValidos = parametrosRecibidos.filter(p => !parametrosPermitidos.includes(p));

    if (parametrosNoValidos.length > 0) {
        return res.status(400).send({
            status: 400,
            message: `Parámetros no permitidos: ${parametrosNoValidos.join(', ')}`
        });
    }

    listaProductos(req, res);
});

app.get('/empleados/:id', getEmpleado);
app.get('/productos/:id', getProducto);

app.listen(80, () => console.log('Escuchando llamadas en http://localhost:80'));