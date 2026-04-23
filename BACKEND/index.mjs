import express from 'express';
import cors from 'cors';
import {login} from "./API/login.mjs";

const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send({
        status: 200,
        body: {
            'login': '/login'
        }
    });
})

app.get('/login', (req, res) => {

    res.send(login(req, res));

})

app.listen(80, () => console.log('Escuchando llamadas en http://localhost:80'));