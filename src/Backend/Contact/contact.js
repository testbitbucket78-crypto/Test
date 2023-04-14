var express = require("express");
const db = require("../dbhelper");
var app = express();
<<<<<<< HEAD
const val = require('../Authentication/constant.js');
=======
const val = require('./constant.js');
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
const bodyParser = require('body-parser');
const { Parser } = require('json2csv');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
<<<<<<< HEAD
=======
const nodemailer = require('nodemailer');
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

<<<<<<< HEAD
=======


>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
app.get('/', function (req, res) {

  db.runQuery(req, res, val.sql1, [req.body.id]);
});



app.post('/contact', function (req, res) {
<<<<<<< HEAD
=======
  console.log("contact")
  console.log(req.body)
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
  Name = req.body.Name
  Phone_number = req.body.Phone_number
  emailId = req.body.emailId
  age = req.body.age
  var tag = req.body.tag
  var status = req.body.status
  facebookId = req.body.facebookId
  InstagramId = req.body.InstagramId
<<<<<<< HEAD
  var tagList = tag.join();
  var statusList = status.join();

  var values = [[Name, Phone_number, emailId, age, tagList, statusList, facebookId, InstagramId]];
=======

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
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b

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

<<<<<<< HEAD
var responceData = "";
app.post('/exportCheckedContact', (req, res) => {

  var data = req.body
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(data)

=======

app.post('/exportCheckedContact', (req, res) => {
  console.log(req.body)
  var data = req.body.data
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(data)
 
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
  fs.writeFile("data.csv", csv, function (err) {
    if (err) {
      throw err;
    }
    console.log('File Saved')
  })

  res.attachment("data.csv")
<<<<<<< HEAD
  res.send(csv)
  responceData = data
})
app.get('/getCheckedExportContact', (req, res) => {
  console.log(responceData)
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(responceData)

  fs.writeFile("data.csv", csv, function (err) {
    if (err) {
      throw err;
    }
    console.log('File Saved')
  })

  res.attachment("data.csv")
  res.send(csv)

})

app.delete('/deletContact', (req, res) => {
  var Ids = req.body.customerId;
  console.log(Ids)
  db.runQuery(req, res, val.delet, [Ids])
=======
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
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
})

app.get('/getContactById', (req, res) => {
  db.runQuery(req, res, val.selectbyid, [req.query.customerId])
})

app.put('/editContact', (req, res) => {
<<<<<<< HEAD
  customerId = req.body.customerId
  Phone_number = req.body.Phone_number
  uid = req.body.uid
  sp_account_id = req.body.sp_account_id
  var status = req.body.status
  Name = req.body.Name
  age = req.body.age
  sex = req.body.sex
  emailId = req.body.emailId
  address = req.body.address
  pincode = req.body.pincode
  city = req.body.city
  state = req.body.state
  Country = req.body.Country
  OptInStatus = req.body.OptInStatus
  var tag = req.body.tag
  facebookId = req.body.facebookId
  InstagramId = req.body.InstagramId

  var tagList = tag.join();
  var statusList = status.join();


  db.runQuery(req, res, val.editContact, [Phone_number, uid, sp_account_id, statusList, Name, age, sex, emailId, address, pincode, city, state, Country, OptInStatus, tagList, facebookId, InstagramId, customerId])
=======
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
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
})



app.post('/updateAndSave', (req, res) => {
<<<<<<< HEAD
=======
  console.log(req.body)
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
  var result = req.body;
  var fields = result.field
  var data = result.data
  var identifier = result.identifier
<<<<<<< HEAD
  var rowdataList = [];
  var count = 0
  if (fields.length == 0) {
    db.runQuery(req, res, val.importquery,
      [data.map(item => [item.Name, item.Phone_number, item.emailId, item.status, item.sex, item.age, item.state, item.Country, item.tag, item.uid, item.sp_account_id, item.address, item.pincode, item.city, item.OptInStatus, item.facebookId, item.InstagramId])])
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


})

app.post('/verifyData', (req, res) => {
  var result = req.body
=======
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
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
  console.log("verifyData")
  console.log(req.body)
  values = [];

<<<<<<< HEAD
  for (var i = 0; i < result.length; i++) {
    values[i] = (JSON.parse(JSON.stringify(result[i].emailId)))
=======
  for (var i = 0; i < resdata.length; i++) {
    values[i] = (JSON.parse(JSON.stringify(resdata[i].emailId)))
>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
  }
  var queryData = [values];

  db.db.query(val.verfiyCount, queryData, (err, result) => {
    if (err) {
      console.log(err);
    }
    else {

      res.status(200).send({

<<<<<<< HEAD
        count: result.length
=======
        count: result.length,

>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
      });
    }
  })


})



app.get('/download', (req, res) => {
<<<<<<< HEAD
  var file = path.join(__dirname,'/sample_file.csv')
 
=======
  var file = path.join(__dirname, '/sample_file.csv')

>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b

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
<<<<<<< HEAD
//module.exports = { updateData, identifierData }
=======

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



>>>>>>> 77bb05647371b5a0ac2c71a980a19d3a892ea31b
app.listen(3002);

