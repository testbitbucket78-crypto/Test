var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



// app.get('/all', function (req, res) {


//   var data =

//   {
//     "Subscribers":
//       [
//         { "id": 1, "title": "Total Subscribers", "count": 0 },
//         { "id": 2, "title": "Active Subscribers", "count": 0 },
//         { "id": 3, "title": "Inactive Subscribers", "count": 0 }
//       ],
//     "Interactions":
//       [
//         { "id": 1, "title": "Open Interactions", "count": 0 },
//         { "id": 2, "title": "Closed Interactions", "count": 0 },
//         { "id": 3, "title": "Total Interactions", "count": 0 }
//       ],
//     "Campaigns":
//       [
//         { "id": 1, "title": "Scheduled Campaigns", "count": 0 },
//         { "id": 2, "title": "Delivered Campaigns", "count": 0 },
//         { "id": 3, "title": "Pending Campaigns", "count": 0 },
//         { "id": 4, "title": "Failed Campaigns", "count": 0 }
//       ],
//     "Agents":
//       [
//         { "id": 1, "title": "Total Agents", "count": 0 },
//         { "id": 2, "title": "Active Agents", "count": 0 },
//         { "id": 3, "title": "Inactive Agents", "count": 0 }
//       ]
//   }


//   //];
//   res.send(data);
// });


app.get('/', async (req, res) => {
  // console.log("Node is running ")

  // res.send(200)
  try {
    console.log("Node is running ")
    res.send(200);
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})

app.get('/Interactions:/sPid', async (req, res) => {
  // db.runQuery(req, res, val.interactionsQuery, [req.body])
  try {
    const users = await db.excuteQuery(val.interactionsQuery, [req.query.sPid,req.query.sPid]);
    res.send(users);
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
});


app.get('/Campaigns:/sPid', async (req, res) => {
  console.log(req.query.sPid)
  // db.runQuery(req, res, val.campaignsQuery, [req.query.sPid])
  try {
    const users = await db.excuteQuery(val.campaignsQuery, [req.query.sPid]);
    res.send(users);
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
});

app.get('/Agents:/sPid', async (req, res) => {
  // db.runQuery(req, res, val.agentsQuery, [req.body])
  try {
    const users = await db.excuteQuery(val.agentsQuery, [req.query.sPid,req.query.sPid,req.query.sPid]);
    res.send(users);
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }

})

app.get('/Subscribers:/sPid', async (req, res) => {
  console.log(req.query.sPid)
  // db.runQuery(req, res, val.subscribersQuery, [req.query.sPid,req.query.sPid])
  try {
    const users = await db.excuteQuery(val.subscribersQuery, [req.query.sPid, req.query.sPid]);
    res.send(users);
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})

app.get('/recentConversation/:spid', async (req, res) => {
  console.log(req.query.spid)

  // db.runQuery(req,res,val.conversationQuery,[req.query.spid])
  try {
    const users = await db.excuteQuery(val.conversationQuery, [req.query.spid]);
    res.send(users);
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})




app.listen(3001, function () {
  console.log("Node is running");

});
