var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/createContactList', async (req, res) => {
    try {
        var inserQuery = "INSERT INTO ContactList (SP_id,created_by,filters,contact_id_list,list_name) VALUES  (" + req.body.SP_ID + "," + req.body.created_by + ",'" + req.body.filters + "','" + req.body.contact_id_list + "','" + req.body.list_name + "')";
        let ContactList = await db.excuteQuery(inserQuery, []);
        res.send({
            status: 200,
            ContactList: ContactList
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/editContactList', async (req, res) => {
    try {
        var updateQueryQuery = "UPDATE ContactList SET filters ='" + req.body.filters + "',"; 
        updateQueryQuery +=" contact_id_list ='"+req.body.contact_id_list+"',"
        updateQueryQuery +=" updated_at ='"+new Date().toISOString().slice(0, 19).replace('T', ' ')+"'"
        
        updateQueryQuery +=" WHERE Id ="+req.body.Id
        let updatedContactList=await db.excuteQuery(updateQueryQuery,[]);
        res.send({
            status: 200,
            updatedContactList: updatedContactList
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/getContactList', async (req, res) => {
    try {
        let Query ="SELECT ContactList.* ,user.name as owner from ContactList,user  where user.uid =ContactList.created_by and  ContactList.SP_id = "+req.body.SPID
        if(req.body.key){
        Query += " and  ContactList.list_name like '%"+req.body.key+"%'"
        }
        console.log(Query);
        let contactList=await db.excuteQuery(Query,[]);
        res.send({
            status: 200,
            contactList: contactList
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.get('/getTemplates/:spid',async (req,res)=>{
    try{
        console.log("getTemplates" +req.params.spid)
        let getTemplates=await db.excuteQuery(val.selectTemplate,[req.params.spid])
        console.log(getTemplates)
       res.send({
            status: 200,
            getTemplates: getTemplates
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.get('/applyFilteronEndCustomer',async (req,res)=>{
try{
    let FilteredCustomer=await db.excuteQuery(req.body.Query,[])
    res.send({
        status: 200,
        FilteredCustomer: FilteredCustomer
    })
} catch (err) {
    res.send({
        status: 500,
        err: err
    })
}
})


app.listen(3011, function () {
    console.log("Node is running");
  
  });