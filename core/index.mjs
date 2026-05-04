import express, {urlencoded} from 'express';
import cors from 'cors';
import {login} from "./API/login.mjs";
import { listaEmpleados } from "./API/empleados/listado.mjs";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
    res.send({
        status: 200,
        body: {
            'login': '/login',
            'empleados': '/empleados',
            'listado': '/empleados/lista'
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

app.get('/empleados/lista', (req, res) => {

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

app.listen(80, () => console.log('Escuchando llamadas en http://localhost:80'));