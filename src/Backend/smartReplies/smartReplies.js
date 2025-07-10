var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant.js');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
var axios = require('axios');
const logger = require('../common/logger.log');
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

app.post('/addNewReply', async (req, res) => {
  try {
    const myStringArray = req.body.Keywords;
    let Channel = req.body?.Channel
    let Deleted;
    const params = {
      strings: {

        value: myStringArray.join(',')
      }
    };
    //console.log("params " + params.strings.value)
    const jsonData = JSON.stringify(req.body.ReplyActions);

    //db.runQuery(req, res, val.addNewReply, [req.body.SP_ID, req.body.Title, req.body.Description, req.body.MatchingCriteria, params.strings.value, jsonData])
    var saveReply = await db.excuteQuery(val.addNewReply, [req.body.SP_ID, req.body.Title, req.body.Description, req.body.MatchingCriteria, params.strings.value, jsonData,Channel])
    if(saveReply && saveReply.length > 0){
      let getRecentAddedDataID = (await db.excuteQuery(val.getRecentInsertion, [req.body.SP_ID]))[0]?.ID; 
      if(getRecentAddedDataID){
        let getDataForID = await db.excuteQuery(val.sideNavKeywords, [getRecentAddedDataID]);
              if(getDataForID && getDataForID.length){
                  for (const element of getDataForID) {
                      if (element.Media && !element.media_type) {
                          Deleted = await db.excuteQuery(val.deleteSmartReply, [getRecentAddedDataID]);
                          break;
                      }
                  }
              }
      }
    }
   
   if(Deleted) throw new Error("Image or Media is missing");
   // console.log(saveReply)
    res.status(200).send({
      msg: "Smart Reply added",
      status: 200
    });
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err?.message ?? err,
      status: 500
    });
  }


})


app.post('/KeywordMatch', async (req, res) => {
  try {
    const myStringArray = req.body.Keywords.map(keyword => keyword.toLowerCase());
    const smartReplyId = req.body.smartReplyId;

    console.log(req.body.Keywords)
    const params = {
      strings: {

        value: myStringArray.join(',')
      }
    };
    console.log("params " + params.strings.value)
    // Add single quotes after every comma
    const updatedString = (params.strings.value).split(',').map(value => "'" + value + "'").join(',');
    console.log("updatedString" + updatedString.length)
    var query ='';
    if (smartReplyId && smartReplyId != 0) {
     query = "SELECT Lower(Keyword) as Keyword FROM SmartReplyKeywords WHERE SmartReplyId IN ( select ID from SmartReply where SP_ID =" + req.body.SP_ID + "and ID !=" + smartReplyId +` and isDeleted !=1) and Keyword IN (` + updatedString + ') and isDeleted !=1';
    } else {
     query = "SELECT Lower(Keyword) as Keyword FROM SmartReplyKeywords WHERE SmartReplyId IN ( select ID from SmartReply where SP_ID =" + req.body.SP_ID + ` and isDeleted !=1) and Keyword IN (` + updatedString + ') and isDeleted !=1';
    }
    var findKey = await db.excuteQuery(query, [])

    // Check if any element from array1 is present in array2
    const matchedElements = myStringArray.filter(element => findKey.some(obj => obj.Keyword === element));
    console.log(findKey);
    console.log(matchedElements)
    if (matchedElements.length == 0) {
      console.log("if")
      res.status(200).send({
        msg: 'keyword ready for add',
        status: 200
      });
    }
    else {
      console.log("else")
      res.status(409).send({
        msg: 'Some keywords is duplicate',
        status: 409
      });
    }
  }
  catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
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

app.put('/updateSmartReply', async (req, res) => {
  // const list = req.body.Tags;
  // const listStr = list.join();
  // console.log("listStr" + listStr)
  // const myStringArray = req.body.Keywords;
  // const params = {
  //   strings: {

  //     value: myStringArray.join(',')
  //   }
  // };
  // console.log("params " + params.strings.value)
  // const jsonData = JSON.stringify(req.body.ReplyActions);
  try{

  const myStringArray = Array.isArray(req.body.Keywords) ? req.body.Keywords : [];
  //console.log(req.body.Keywords)
  const params = {
    strings: {

      value: myStringArray.join(',')
    }
  };
  //console.log("params " + params.strings.value)
  const jsonData = JSON.stringify(req.body.ReplyActions);


  console.log(req.body.ID, req.body.Title, req.body.Description, req.body.MatchingCriteria,req.body?.Channel, params.strings.value, jsonData)

 
 let response = await db.excuteQuery( val.updateSmartReply, [req.body.ID, req.body.Title, req.body.Description, req.body.MatchingCriteria,req.body?.Channel, params.strings.value, jsonData])
 res.send({
  status:200,
  response:response
 })

}catch(err){
    console.log(err)
    res.send({
      status:500,
      err:err
     })
  }
})






//________________ Smart Reply Action API's_______________ This is covered in IncommingMessage.js Not in use here//

app.post('/updateInteractionMapping', async (req, res) => {
  logger.info('SmartReply ******* updateInteractionMapping');
  InteractionId = req.body.InteractionId
  AgentId = req.body.AgentId
  MappedBy = req.body.MappedBy
  is_active = 1
  var values = [[is_active, InteractionId, AgentId, MappedBy]]
  db.runQuery(req, res, val.updateInteractionMapping, [values])
})

app.get('/getInteractionMapping/:InteractionId', (req, res) => {
  logger.info('SmartReply ******* getInteractionMapping');
  db.runQuery(req, res, val.getInteractionMapping, [req.params.InteractionId])
})

app.post('/resetInteractionMapping', (req, res) => {
  logger.info('SmartReply ******* resetInteractionMapping');
  InteractionId = req.body.InteractionId
  var valuesUpdate = [[InteractionId]]

  var updoateQuery = "UPDATE InteractionMapping SET is_active =0 WHERE InteractionId =" + InteractionId;
  db.runQuery(req, res, updoateQuery, [valuesUpdate])
})



app.post('/addTag', async (req, res) => {
  
  var updateQueryQuery = "";
 
  updateQueryQuery = " UPDATE EndCustomer SET tag ='" + req.body.tag + "'  WHERE customerId =" + req.body.customerId

  console.log(updateQueryQuery)
  db.runQuery(req, res, updateQueryQuery, [])
})


app.post('/removeTag', async (req, res) => {
  var maptag = req.body.tag;
  var maptagItems = maptag.split(',')
  console.log("maptag " + maptag)
  var result = await db.excuteQuery(val.selectTagQuery, [req.body.customerId])
  console.log(result)
  var removetagQuery = ""
  if (result.length > 0) {

    const tagValue = result[0].tag
    console.log("tagValue" + tagValue)
    if (tagValue != ' ' && tagValue != null) {
      // Split the tag value into an array of tag items
      const tagItems = tagValue.split(',');

      var itemmap = '';

      console.log(itemmap == maptag)
      // Get the count of tag items
      const tagItemCount = tagItems.length;
      console.log("tagItemCount" + tagItemCount)
      for (var i = 0; i < tagItems.length; i++) {

        if (!(maptagItems.includes(tagItems[i]))) {
          var itemmap = itemmap + (itemmap ? ',' : '') + tagItems[i]

        }


      }
      console.log("for loop end" + itemmap)
      removetagQuery = "UPDATE EndCustomer SET tag ='" + itemmap + "' WHERE customerId = " + req.body.customerId + "";

    }
  }
  console.log(removetagQuery)
  db.runQuery(req, res, removetagQuery, [])

})

//_____________ Send Button Through Meta API's _________________________//

function sendMessage(data) {
  var config = {
    method: 'post',
    url: val.url,
    headers: {
      'Authorization': val.access_token,
      'Content-Type': val.content_type
    },
    data: data
  };

  return axios(config)
}

function getTextMessageInput(recipient, text) {
  return JSON.stringify({

    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": recipient,
    "type": "interactive",
    "interactive": {
      "type": "button",
      "body": {
        "text": text
      },
      "action": {
        "buttons": [
          {
            "type": "reply",
            "reply": {
              "id": "1",
              "title": "Yes"
            }
          },
          {
            "type": "reply",
            "reply": {
              "id": "2",
              "title": "No"
            }
          },
          {
            "type": "reply",
            "reply": {
              "id": "3",
              "title": "ok"
            }
          }
        ]
      }
    }


  });
}

app.post('/button', (req, res) => {
  
  var data = getTextMessageInput(req.body.Phone_number, req.body.text);
  var value = JSON.parse(data)
  console.log(value)
  sendMessage(data).then(function (response) {
    res.status(200).send({
      msg: 'Message sended',
      status: 200
    });
    return;
  }).catch(function (error) {
    console.log(error);

    res.status(500).send({
      msg: err,
      status: 500
    });
    return;
  });
})


app.listen(3005, function () {
  console.log("Node is running on port 3005");

});