import express from "express";
import mysql from "mysql";

export function login(req, res) {
    if (!req?.body) return res.send({status: 401})
    const {usuario, pass, keepSession, token} = req.body;

    // comprueba si no se han recibido credenciales ni token
    if ((!usuario || !pass) && !token) {
        return res.send({
            status: 401
        })
    }

    // como recibimos credenciales o token, primero vamos a comprobar el token
    if (token) {

    }
}