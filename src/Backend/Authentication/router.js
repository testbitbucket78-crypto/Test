const express = require('express');
const router=express.Router();
const db = require("./dbhelper");
const userController=require('./user.js');
const indexController=require('./index.js');

router.get('/users',userController.getUser);
router.get('/users/:id',userController.getUserById);
router.delete('/users/:id',userController.deletUserById);
router.post('/users',userController.insertUser);
router.put('/users/:id',userController.updateUser);
router.get('/getAllRegisteredUser',indexController.allregisterdUser);
router.post('/register',indexController.register);
router.post('/login',indexController.login);
router.post('/forgotPassword',indexController.forgotPassword);

module.exports = router;