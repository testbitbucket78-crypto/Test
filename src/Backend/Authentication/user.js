const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const val=require('./constant')
const app = express();
const bcrypt = require('bcrypt');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
 
//Creating GET Router
const getUser = (req, res) => {
    db.runQuery(req,res,val.selectAllQuery, [req.params.id]);
    
    
};

//get user by userId
const getUserById = (req, res) => {

db.runQuery(req,res,val.selectByIdQuery,[req.params.id]);
    
}

// DELET USER 
const deletUserById = (req, res) => {
    
     db.runQuery(req,res,val.deletQuery,[req.params.id])
     
}

//Inser data
const insertUser = (req, res) => {
   
    password = req.body.password
    email_id = req.body.email_id
    address = req.body.address
    name = req.body.name
    mobile_number = req.body.mobile_number
    country = req.body.country
    timezone = req.body.timezone
    CreatedDate = req.body.CreatedDate
    LastModifiedDate = req.body.LastModifiedDate
    PasswordHint = req.body.PasswordHint
    securityquestion = req.body.securityquestion
    Securityanswer = req.body.Securityanswer
    ParentId = req.body.ParentId
    UserType = req.body.UserType
    IsDeleted = req.body.IsDeleted
    IsActive = req.body.IsActive
    
    bcrypt.hash(password, 10, function (err, hash) {
       
    var values = [[  hash, email_id, address, name, mobile_number, country, timezone, CreatedDate, LastModifiedDate, PasswordHint, securityquestion, Securityanswer, ParentId, UserType, IsDeleted, IsActive]]
    db.runQuery(req,res,val.insertQuery, [values])
  
    })

}

const updateUser = (req, res) => {
    
    
       
        SP_ID = req.params.id
        password = req.body.password
        email_id = req.body.email_id
        address = req.body.address
        name = req.body.name
        mobile_number = req.body.mobile_number
        country = req.body.country
        timezone = req.body.timezone
        CreatedDate = req.body.CreatedDate
        LastModifiedDate = req.body.LastModifiedDate
        PasswordHint = req.body.PasswordHint
        securityquestion = req.body.securityquestion
        Securityanswer = req.body.Securityanswer
        ParentId = req.body.ParentId
        UserType = req.body.UserType
        IsDeleted = req.body.IsDeleted
        IsActive = req.body.IsActive

        bcrypt.hash(password, 10, function (err, hash) {
        db.runQuery(req,res,val.updateQuery,[ hash, email_id, address, name, mobile_number, country, timezone, CreatedDate, LastModifiedDate, PasswordHint, securityquestion, Securityanswer, ParentId, UserType, IsDeleted, IsActive,SP_ID])
        });
      
    }

 const getAllAgents  =(req,res)=>{
    db.runQuery(req,res,val.allAgents,[req.body.ParentId,req.body.UserType])
 }

 const getisActiveAgents=(req,res)=>{
    db.runQuery(req,res,val.activeAgent,[req.body.ParentId,req.body.UserType,req.body.IsActive])
 }
module.exports = { getUser, getUserById, deletUserById, insertUser, updateUser,getAllAgents ,getisActiveAgents};