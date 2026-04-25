import express, {urlencoded} from 'express';
import cors from 'cors';
import {login} from "./API/login.mjs";

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
    res.send({
        status: 200,
        body: {
            'login': '/login'
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

app.listen(80, () => console.log('Escuchando llamadas en http://localhost:80'));