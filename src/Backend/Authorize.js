const express = require('express');
const Jwt = require('jsonwebtoken');
const db = require('./dbhelper')
const SECRET_KEY = 'RAUNAK'

const token = async (req, resp, next) => {
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


        const decoded = Jwt.verify(token, SECRET_KEY);
        const users = await db.excuteQuery(
            'SELECT isDeleted,isDisable,isPaused,isTokenExpire FROM user WHERE uid = ?', 
            [decoded.id]
          );
          if (users?.length > 0) {
              const user = users[0];
              if ( users && user?.isDeleted == 1) {
                  return resp.status(401).send({ status: 401, message: "User is Deleted" });
              } else if (user?.isDisable != 0) {
                  return resp.status(401).send({ status: 401, message: "User is Disabled" });
                }else if(user?.isTokenExpire == 1){                   
                    return resp.status(401).send({ status: 401, message: "User is Paused" });
                }
              
          }
            req.user = user;
            next();
            }
        })

    } else {
        resp.status(401).send({ status: 401, message: "UnAuthorize User..." });
    }
}

module.exports = token;
