const express = require('express');
const Jwt = require('jsonwebtoken');
const db = require('./dbhelper')
const SECRET_KEY = 'RAUNAK'

const token = (req, resp, next) => {
    let token = req.headers['authorization'];
    if (token) {
        let splittoken = token.split(" ");
        if (!splittoken[1]) {
            token = token;
        } else {
            token = splittoken[1];
        }

        Jwt.verify(token, SECRET_KEY, async (err, user) => {
            if (err) {
                return resp.status(401).send({ status: 401, message: "Please enter valid token" });
            } else {
            req.user = user;
            next();
            }
        })
    } else {
        resp.status(401).send({ status: 401, message: "UnAuthorize User..." });
    }
}

module.exports = token;
