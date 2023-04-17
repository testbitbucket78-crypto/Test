var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant.js');
const bodyParser = require('body-parser');
const { Parser } = require('json2csv');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', function (req, res) {

  db.runQuery(req, res, val.sql1, [req.body.id]);
});



app.post('/contact', function (req, res) {
  console.log("contact")
  console.log(req.body)
  Name = req.body.Name
  Phone_number = req.body.Phone_number
  emailId = req.body.emailId
  age = req.body.age
  var tag = req.body.tag
  var status = req.body.status
  facebookId = req.body.facebookId
  InstagramId = req.body.InstagramId

  var tagList = [];

  for (var i = 0; i < tag.length; i++) {
    tagList.push(tag[i].item_text)
  }
  var tagListJoin = tagList.join();
  console.log(tagListJoin)
  var statusList = [];

  for (var i = 0; i < status.length; i++) {
    statusList.push(status[i].item_text)
  }
  var statusListJoin = statusList.join();
  console.log(statusListJoin)


  var values = [[Name, Phone_number, emailId, age, statusListJoin, tagListJoin, facebookId, InstagramId]];

  db.runQuery(req, res, val.sql, [values])


});

app.get('/exportAllContact', (req, res) => {
  db.db.query(val.sql1, [req.body], (err, result) => {
    var data = result
    console.log(data)
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data)

    fs.writeFile("data.csv", csv, function (err) {
      if (err) {
        throw err;
      }
      console.log('File Saved')
    })

    res.attachment("data.csv")
    res.send(csv)
  })
})


app.post('/exportCheckedContact', (req, res) => {
  console.log(req.body)
  var data = req.body.data
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(data)
 
  fs.writeFile("data.csv", csv, function (err) {
    if (err) {
      throw err;
    }
    console.log('File Saved')
  })

  res.attachment("data.csv")
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 10000);
  var mailOptions = {
    from: val.email,
    to: req.body.loginData,
    subject: "Request for download Contact_Data: ",
    html: '<p>Please find  the attachment of exported Contact_Data, kindly use  this file to see your contacts</p>',
    attachments: [
      {
        filename: `${timestamp}-${randomNumber}.csv`,
        path: path.join(__dirname, '/data.csv'),
      },
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    res.status(200).send({ msg: "data has been sent" });
  });
  return res.status(200).send({ msg: "Contacts exported sucessfully!" });
  
})


app.post('/deletContact', (req, res) => {

  var Ids = req.body.customerId;
  console.log(req.body.customerId)
  db.runQuery(req, res, val.delet, [req.body.customerId])
})

app.get('/getContactById', (req, res) => {
  db.runQuery(req, res, val.selectbyid, [req.query.customerId])
})

app.put('/editContact', (req, res) => {
  const id = req.query.customerId;
  const dataToUpdate = req.body;
  console.log(dataToUpdate)
  let query = val.neweditContact;
  const values = [];
  Object.keys(dataToUpdate).forEach(key => {

    query += `${key} = ?, `;

    if (Array.isArray(dataToUpdate[key])) {
      var list = dataToUpdate[key];
      ListofArrays = [];

      for (var i = 0; i < list.length; i++) {
        if (list[i].item_text == undefined) {
          ListofArrays.push(list[i]);
        } else {
          ListofArrays.push(list[i].item_text);
        }
      }
      joinList = ListofArrays.join()
      values.push(joinList);
    } else {
      values.push(dataToUpdate[key]);
    }
  });
  query = query.slice(0, -2);

  query += ` WHERE customerId = ?`;
  values.push(id);
  console.log(values)
  db.runQuery(req, res, query, values)
})



app.post('/updateAndSave', (req, res) => {
  console.log(req.body)
  var result = req.body;
  var fields = result.field
  var data = result.data
  var identifier = result.identifier
  var purpose = result.purpose
  var rowdataList = [];
  var count = 0

  if (purpose == 'Add new contact only') {
    db.runQuery(req, res, val.importquery,
      [data.map(item => [item.Name, item.Phone_number, item.emailId, item.status, item.sex, item.age, item.state, item.Country, item.tag, item.uid, item.SP_ID, item.address, item.pincode, item.city, item.OptInStatus, item.facebookId, item.InstagramId])])

  }
  // if (purpose == 'Update Existing Contacts Only') {
  //    console.log(" 2"+purpose)
  // }
  else {
    if (fields.length == 0) {
      db.runQuery(req, res, val.importquery,
        [data.map(item => [item.Name, item.Phone_number, item.emailId, item.status, item.sex, item.age, item.state, item.Country, item.tag, item.uid, item.SP_ID, item.address, item.pincode, item.city, item.OptInStatus, item.facebookId, item.InstagramId])])
    } else {
      for (var j = 0; j < fields.length; j++) {
        for (var i = 0; i < result.data.length; i++) {
          var updateData = fields[j]
          var identifierData = identifier[0]

          rowdataList.push(data[i]);
          updatedValue = JSON.parse(JSON.stringify(data[i][fields[j]]));
          identifierValue = JSON.parse(JSON.stringify(data[i][identifier[0]]));


          db.db.query('UPDATE EndCustomer SET ' + updateData + '=?' + ' WHERE ' + identifierData + '=?', [updatedValue, identifierValue], function (error, results, next) {
            if (error) {
              console.log(error)
            } else {

              count = count + 1

              if (JSON.stringify(results.affectedRows) == 0) {

                rowdata = rowdataList[count - 1]
                values = [[rowdata.Name, rowdata.Phone_number, rowdata.emailId, rowdata.status, rowdata.sex, rowdata.age, rowdata.state, rowdata.Country, rowdata.tag, rowdata.uid, rowdata.sp_account_id, rowdata.address, rowdata.pincode, rowdata.city, rowdata.OptInStatus, rowdata.facebookId, rowdata.InstagramId]]

                db.db.query(val.importquery, [values], function (err, result) {
                  if (err) {
                    console.log(err)
                  } else {
                    console.log(result)
                  }
                })
              }
            }
          })
        }
      }

    }

  }
})

app.post('/verifyData', (req, res) => {
  var resdata = req.body
  console.log("verifyData")
  console.log(req.body)
  values = [];

  for (var i = 0; i < resdata.length; i++) {
    values[i] = (JSON.parse(JSON.stringify(resdata[i].emailId)))
  }
  var queryData = [values];

  db.db.query(val.verfiyCount, queryData, (err, result) => {
    if (err) {
      console.log(err);
    }
    else {

      res.status(200).send({

        count: result.length,

      });
    }
  })


})



app.get('/download', (req, res) => {
  var file = path.join(__dirname, '/sample_file.csv')


  res.download(file)
})



app.get('/filter', (req, res) => {
  console.log("filter")
  console.log(req.query)

  db.runQuery(req, res, val.filterQuery, [req.query.Phone_number])
})

app.get('/search', (req, res) => {
  console.log("search")
  console.log(req.query)

  db.runQuery(req, res, val.searchQuery, [req.query.Phone_number, req.query.Name, req.query.emailId])
})

app.post('/blockedContact', (req, res) => {
  console.log(req.body.customerId)
  db.runQuery(req, res, val.isBlockedQuery, [req.body.customerId])
})


//common method for send email through node mailer
let transporter = nodemailer.createTransport({
  //service: 'gmail',
  host: val.emailHost,
  port: val.port,
  secure: false,
  auth: {
    user: val.email,
    pass: val.appPassword
  },
});



app.listen(3002);

