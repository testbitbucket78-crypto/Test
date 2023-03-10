var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('../Authentication/constant.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Title } = require("@angular/platform-browser");
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/getReplies', (req, res) => {

   db.runQuery(req, res, val.selectAll, [req.body])
})

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
   db.runQuery(req,res,val.addNewReply,[req.body.Title,req.body.Description,req.body.MatchingCriteria,params.strings.value,jsonData,listStr])
})

 

 

app.listen(3005, function () {
   console.log("Node is running on port 3005");

});