var express = require("express");
const db = require("../dbhelper");
var app = express();
<<<<<<< HEAD
const val = require('../Authentication/constant.js');
=======
const val = require('./constant.js');
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/getReplies', (req, res) => {

   db.runQuery(req, res, val.selectAll, [req.body])
})

<<<<<<< HEAD
=======
app.get('/getReplieswithSPID',(req,res)=>{
  console.log("spid")
  console.log(req.body.SP_ID)
    db.runQuery(req,res,val.getsmartReplieswithSPID,[req.body.SP_ID,req.body.SP_ID])
   //  console.log("result API" +result)
   //  res.send(result)
})

app.get('/getalluserofAOwner',(req,res)=>{
   db.runQuery(req,res,val.alluserofAOwner,[req.body.ParentId,req.body.SP_ID])
})
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
app.get('/search', (req, res) => {
   console.log(req.query.ID)
   db.runQuery(req, res, val.search, [req.query.ID])
})


app.get('/sideNavKeyword', (req, res) => {
   db.runQuery(req, res, val.sideNavKeywords, [req.query.ID])
})

app.post('/addNewReply', (req, res) => {
   const list = req.body.Tags;
   const listStr =  list.join();
   console.log("listStr" + listStr)
   const myStringArray= req.body.Keywords;
   const params = {
      strings: {
          
          value: myStringArray.join(',')
      }
  };
    console.log("params "  + params.strings.value)
    const jsonData = JSON.stringify(req.body.ReplyActions);

    console.log("req.body.Keywords" + jsonData);
    console.log(req.body.ReplyActions)
    console.log(req.body.Tags)
<<<<<<< HEAD
   db.runQuery(req,res,val.addNewReply,[req.body.Title,req.body.Description,req.body.MatchingCriteria,params.strings.value,jsonData,listStr])
})

 

 
=======
   db.runQuery(req,res,val.addNewReply,[req.body.SP_ID,req.body.Title,req.body.Description,req.body.MatchingCriteria,params.strings.value,jsonData,listStr])
})

 
app.put('/deletSmartReply',(req,res)=>{
   db.runQuery(req,res,val.deleteSmartReply,[req.body.ID])
})
 
app.put('/deleteReply',(req,res)=>{
  db.runQuery(req,res,val.deletMessage,[req.body.SmartReplyID])
})

app.put('/editMessage',(req,res)=>{
   db.runQuery(req,res,val.editMessage,[req.body.Message,req.body.SmartReplyID])
})

app.put('/editAction',(req,res)=>{
   
   db.runQuery(req,res,val.editAction,[req.body.ActionID,req.body.Value,req.body.SmartReplyID])
})

app.put('/removeKeyword',(req,res)=>{
  db.runQuery(req,res,val.removeKeyword,[req.body.SmartReplyId,req.body.Keyword])
})

app.put('/updateSmartReply',(req,res)=>{
   const list = req.body.Tags;
   const listStr =  list.join();
   console.log("listStr" + listStr)
   const myStringArray= req.body.Keywords;
   const params = {
      strings: {
          
          value: myStringArray.join(',')
      }
  };
    console.log("params "  + params.strings.value)
    const jsonData = JSON.stringify(req.body.ReplyActions);

    console.log("req.body.Keywords" + jsonData);
    console.log(req.body.ReplyActions)
    console.log(req.body.Tags)
   db.runQuery(req, res, val.updateSmartReply, [req.body.ID,req.body.Title,req.body.Description,req.body.MatchingCriteria,params.strings.value,jsonData,listStr])
})
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b

app.listen(3005, function () {
   console.log("Node is running on port 3005");

});