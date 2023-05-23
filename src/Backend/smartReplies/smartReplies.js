var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant.js');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/getReplies', (req, res) => {

  db.runQuery(req, res, val.selectAll, [req.query.SP_ID])
})

app.get('/getReplieswithSPID', async (req, res) => {
  try {
    const users = await db.excuteQuery(val.getsmartReplieswithSPID, [req.query.SP_ID, req.query.SP_ID]);
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});
// app.get('/getReplieswithSPID',(req,res)=>{
//   console.log("spid")
//   console.log(req.query.SP_ID)
//     db.runQuery(req,res,val.getsmartReplieswithSPID,[req.query.SP_ID,req.query.SP_ID])
//    //  console.log("result API" +result)
//    //  res.send(result)
// })

app.get('/getalluserofAOwner', (req, res) => {
  db.runQuery(req, res, val.alluserofAOwner, [req.body.ParentId, req.body.SP_ID])
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
  const listStr = list.join();
  console.log("listStr" + listStr)
  const myStringArray = req.body.Keywords;
  const params = {
    strings: {

      value: myStringArray.join(',')
    }
  };
  console.log("params " + params.strings.value)
  const jsonData = JSON.stringify(req.body.ReplyActions);

  console.log("req.body.Keywords" + jsonData);
  console.log(req.body.ReplyActions)
  console.log(req.body.Tags)
  db.runQuery(req, res, val.addNewReply, [req.body.SP_ID, req.body.Title, req.body.Description, req.body.MatchingCriteria, params.strings.value, jsonData, listStr])
})


app.put('/deletSmartReply', (req, res) => {
  db.runQuery(req, res, val.deleteSmartReply, [req.body.ID])
})

app.put('/deleteReply', (req, res) => {
  db.runQuery(req, res, val.deletMessage, [req.body.SmartReplyID])
})

app.put('/editMessage', (req, res) => {
  db.runQuery(req, res, val.editMessage, [req.body.Message, req.body.SmartReplyID])
})

app.put('/editAction', (req, res) => {

  db.runQuery(req, res, val.editAction, [req.body.ActionID, req.body.Value, req.body.SmartReplyID])
})

app.put('/removeKeyword', (req, res) => {
  db.runQuery(req, res, val.removeKeyword, [req.body.SmartReplyId, req.body.Keyword])
})

app.put('/updateSmartReply', (req, res) => {
  const list = req.body.Tags;
  const listStr = list.join();
  console.log("listStr" + listStr)
  const myStringArray = req.body.Keywords;
  const params = {
    strings: {

      value: myStringArray.join(',')
    }
  };
  console.log("params " + params.strings.value)
  const jsonData = JSON.stringify(req.body.ReplyActions);

  console.log("req.body.Keywords" + jsonData);
  console.log(req.body.ReplyActions)
  console.log(req.body.Tags)
  db.runQuery(req, res, val.updateSmartReply, [req.body.ID, req.body.Title, req.body.Description, req.body.MatchingCriteria, params.strings.value, jsonData, listStr])
})






//________________ Smart Reply Action API's_______________//

app.post('/updateInteractionMapping', async (req, res) => {
  InteractionId = req.body.InteractionId
  AgentId = req.body.AgentId
  MappedBy = req.body.MappedBy
  is_active = 1
  var values = [[is_active, InteractionId, AgentId, MappedBy]]
  db.runQuery(req, res, val.updateInteractionMapping, [values])
})

app.get('/getInteractionMapping/:InteractionId', (req, res) => {
  db.runQuery(req, res, val.getInteractionMapping, [req.params.InteractionId])
})

app.post('/resetInteractionMapping', (req, res) => {
  InteractionId = req.body.InteractionId
  var valuesUpdate = [[InteractionId]]

  var updoateQuery = "UPDATE InteractionMapping SET is_active =0 WHERE InteractionId =" + InteractionId;
  db.runQuery(req, res, updoateQuery, [valuesUpdate])
})



app.post('/addTag', async (req, res) => {
  var result = await db.excuteQuery(val.selectTagQuery, [req.body.customerId])
  var updateQueryQuery = "";
  console.log(result)
  if (result.length > 0) {
    const tagValue = result[0].tag
    console.log("tagValue" + tagValue)
    if (tagValue != ' ') {
      // Split the tag value into an array of tag items
      const tagItems = tagValue.split(',');
      console.log(tagItems)
      // Get the count of tag items
      const tagItemCount = tagItems.length;
      console.log("tagItemCount" + tagItemCount)

      updateQueryQuery = "UPDATE EndCustomer SET tag = CONCAT(tag,'," + req.body.tag + "')  WHERE customerId =" + req.body.customerId

    } else {
      console.log("else")
      updateQueryQuery = "UPDATE EndCustomer SET tag = '" + req.body.tag + " '  WHERE customerId =" + req.body.customerId
    }

  }
  console.log(updateQueryQuery)
  db.runQuery(req, res, updateQueryQuery, [])
})


app.post('/removeTag', async (req, res) => {
  var result = await db.excuteQuery(val.selectTagQuery, [req.body.customerId])
  console.log(result)
  var removetagQuery = ""
  if (result.length > 0) {

    const tagValue = result[0].tag
    console.log("tagValue" + tagValue)
    if (tagValue != ' ') {
      // Split the tag value into an array of tag items
      const tagItems = tagValue.split(',');
      console.log(tagItems)
      // Get the count of tag items
      const tagItemCount = tagItems.length;
      console.log("tagItemCount" + tagItemCount)
     

      if (tagItemCount > 1) {
      
        removetagQuery = "UPDATE EndCustomer SET tag = TRIM(BOTH ',' FROM REPLACE(CONCAT(',', tag, ','), '," + req.body.tag + ",', ',')) WHERE customerId = " + req.body.customerId + ""
      }
      else {
        
        removetagQuery = "UPDATE EndCustomer SET tag =REPLACE(tag, ' " + req.body.tag + " ', '') WHERE customerId = " + req.body.customerId + " "
      }
    }
  }
    console.log(removetagQuery)
    db.runQuery(req, res, removetagQuery, [])

  })


app.listen(3005, function () {
  console.log("Node is running on port 3005");

});