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
        updateQueryQuery += " contact_id_list ='" + req.body.contact_id_list + "',"
        updateQueryQuery += " updated_at ='" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "'"

        updateQueryQuery += " WHERE Id =" + req.body.Id
        let updatedContactList = await db.excuteQuery(updateQueryQuery, []);
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
        let Query = "SELECT ContactList.* ,user.name as owner from ContactList,user  where user.uid =ContactList.created_by and  ContactList.SP_id = " + req.body.SPID
        if (req.body.key) {
            Query += " and  ContactList.list_name like '%" + req.body.key + "%'"
        }
        console.log(Query);
        let contactList = await db.excuteQuery(Query, []);
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

app.get('/getTemplates/:spid', async (req, res) => {
    try {
        console.log("getTemplates" + req.params.spid)
        let getTemplates = await db.excuteQuery(val.selectTemplate, [req.params.spid])
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

app.get('/applyFilteronEndCustomer', async (req, res) => {
    try {
        let FilteredCustomer = await db.excuteQuery(req.body.Query, [])
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
app.post('/addFunnel', async (req, res) => {
    try {
        let updatedfunnel;
        let addedfunnel;
        if (req.body.Id != '') {
            var updateQuery = "UPDATE Funnel set";
            updateQuery += " title='" + req.body.title + "',";
            updateQuery += " channel_id='" + req.body.channel_id + "',";
            updateQuery += " message_heading='" + req.body.message_heading + "',";
            updateQuery += " message_content='" + req.body.message_content + "',";
            updateQuery += " message_media='" + req.body.message_media + "',";
            updateQuery += " message_variables='" + req.body.message_variables + "',";
            updateQuery += " button_yes='" + req.body.button_yes + "',";
            updateQuery += " button_no='" + req.body.button_no + "',";
            updateQuery += " button_exp='" + req.body.button_exp + "',";
            updateQuery += " category='" + req.body.category + "',";
            updateQuery += " time_zone='" + req.body.time_zone + "',";
            updateQuery += " start_datetime='" + req.body.start_datetime + "',";
            updateQuery += " end_datetime='" + req.body.end_datetime + "',";
            updateQuery += " csv_contacts='" + req.body.csv_contacts + "',";
            updateQuery += " segments_contacts='" + req.body.segments_contacts + "',";
            updateQuery += " status= " + req.body.status;
            updateQuery += " WHERE Id =" + req.body.Id

            updatedfunnel =await  db.excuteQuery(updateQuery, []);
        } else {
            var inserQuery = "INSERT INTO Funnel (status,sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts) ";
            inserQuery += "VALUES (" + req.body.status + "," + req.body.sp_id + ",'" + req.body.title + "','" + req.body.channel_id + "','" + req.body.message_heading + "','" + req.body.message_content + "','" + req.body.message_media + "','" + req.body.message_variables + "','" + req.body.button_yes + "','" + req.body.button_no + "','" + req.body.button_exp + "','" + req.body.category + "','" + req.body.time_zone + "','" + req.body.start_datetime + "','" + req.body.end_datetime + "','" + req.body.csv_contacts + "','" + req.body.segments_contacts + "')";

          
            addedfunnel=await db.excuteQuery(inserQuery, [])
        }
        res.send({
            status: 200,
            updatedfunnel: updatedfunnel,
            addedfunnel:addedfunnel
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