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
const { Key } = require("protractor");
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', function (req, res) {
  db.runQuery(req, res, val.selectAllContact, [req.query.SP_ID]);
});



app.post('/contact', function (req, res) {
  console.log("contact")
 // console.log(req.body)
  Name = req.body.Name
  Phone_number = req.body.Phone_number.internationalNumber
  console.log(Phone_number)
  emailId = req.body.emailId
  age = req.body.age
  var tag = req.body.tag
  var status = req.body.status
  facebookId = req.body.facebookId
  InstagramId = req.body.InstagramId
  SP_ID=req.body.SP_ID
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


  var values = [[Name, Phone_number, emailId, age, statusListJoin, tagListJoin, facebookId, InstagramId,SP_ID]];

  db.runQuery(req, res, val.insertContact, [values])


});




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
  console.log(Ids)
  db.runQuery(req, res, val.delet, [req.body.customerId,req.body.SP_ID])
})

app.get('/getContactById', (req, res) => {
  console.log(req.query)
  db.runQuery(req, res, val.selectbyid, [req.query.customerId,req.query.SP_ID])
})

app.put('/editContact', (req, res) => {
  console.log("editContact")
  const id = req.query.customerId;
  const spid=req.query.SP_ID;
  const Phone_number=req.body.Phone_number.e164Number
  
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
     
    } 
    else if(key=='Phone_number'){
      
      values.push(Phone_number)
    }
    else{
      values.push(dataToUpdate[key])
    }
  });
  query = query.slice(0, -2);

  query += ` WHERE customerId = ? and SP_ID=?`;
  values.push(id);
  values.push(spid);

  db.runQuery(req, res, query, values)
})


app.post('/updateAndSave', (req, res) => {
  console.log("updateAndSave")
  //console.log(req.body)
  var result = req.body;
  var fields = result.field
  var CSVdata = result.importedData
  var colMap = result.mapping
  var identifier = result.identifier
  var purpose = result.purpose

  console.log(result)
 

  if (colMap !== undefined) {
    console.log("colMap")
    var name_field = colMap.Name !== '' ? colMap.Name : 'Name';
    var emailid_field = colMap.emailId !== '' ? colMap.emailId : 'emailId';
    var mobileNo_field = colMap.Mobile_Number !== '' ? colMap.Mobile_Number : 'Phone_number'
    var gender_field = colMap.Gender !== '' ? colMap.Gender : 'sex';
    var tag_field = colMap.Tags !== '' ? colMap.Tags : 'tag';
    var status_field = colMap.Status !== '' ? colMap.Status : 'status';
    var country_field = colMap.Country !== '' ? colMap.Country : 'Country';
    var state_field = colMap.State !== '' ? colMap.State : 'state';

  }

  var identifierData = identifier[0]
   console.log(purpose)
  if (purpose == 'Add new contact only') {

   
    for (var i = 0; i < CSVdata.length; i++) {
      var identifierValue = ''
      if (identifierData === 'emailId') {
        identifierValue = JSON.parse(JSON.stringify(CSVdata[i][emailid_field]))
      }
      if (identifierData === 'Phone_number') {
        identifierValue = JSON.parse(JSON.stringify(CSVdata[i][mobileNo_field]))
      }
      var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, CSVdata[i].SP_ID]
      var query = val.importquery + identifierData + '=?' + ' and isBlocked is null and isDeleted is null)'
      console.log(query)
      db.db.query(query, [values, identifierValue], function (error, results) {
        console.log(query)
        if (error) {
          console.log(error);
        } else {
          console.log(results);
        }
      })
    }
  }


  if (purpose == 'Update Existing Contacts Only') {
    if (fields.length == 0) {
      for (var i = 0; i < CSVdata.length; i++) {
        var identifierValue = ''
        if (identifierData === 'emailId') {
          identifierValue = JSON.parse(JSON.stringify(CSVdata[i][emailid_field]))
        }
        if (identifierData === 'Phone_number') {
          identifierValue = JSON.parse(JSON.stringify(CSVdata[i][mobileNo_field]))
        }
        var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, CSVdata[i].SP_ID]
      
        var updateQuery = val.importUpdate + identifierData + '=?'
     
        db.db.query(updateQuery, [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, CSVdata[i].SP_ID, identifierValue], function (error, results, next) {
          if (error) {
            console.log(error)
          } else {
            console.log(results)
          }
        })
      }
    }
    else {
      for (var j = 0; j < fields.length; j++) {
        for (var i = 0; i < CSVdata.length; i++) {
          var updateData = fields[j]
          var identifierData = identifier[0]
          updatedValue = JSON.parse(JSON.stringify(data[i][fields[j]]));
          identifierValue = JSON.parse(JSON.stringify(data[i][identifier[0]]));

          db.db.query('UPDATE EndCustomer SET ' + updateData + '=?' + ' WHERE ' + identifierData + '=?', [updatedValue, identifierValue], function (error, results, next) {
            if (error) {
              console.log(error)
            }
            else {
              console.log(JSON.stringify(results.affectedRows))

            }
          })
        }
      }
    }
  }

  if (purpose === 'Add and Update Contacts') {
    //********ADD NEW CONTACT********* */
    for (var i = 0; i < CSVdata.length; i++) {
      var identifierValue = ''
      if (identifierData === 'emailId') {
        identifierValue = JSON.parse(JSON.stringify(CSVdata[i][emailid_field]))
      }
      if (identifierData === 'Phone_number') {
        identifierValue = JSON.parse(JSON.stringify(CSVdata[i][mobileNo_field]))
      }
      var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, CSVdata[i].SP_ID]
      var query = val.importquery + identifierData + '=?' + ')'
     
      db.db.query(query, [values, identifierValue], function (error, results) {
        console.log(query)
        if (error) {
          console.log(error);
        } else {
          console.log(results);
        }
      })
    }

    //******************************* */
    if (fields.length == 0) {
      for (var i = 0; i < CSVdata.length; i++) {
        var identifierValue = ''
        if (identifierData === 'emailId') {
          identifierValue = JSON.parse(JSON.stringify(CSVdata[i][emailid_field]))
        }
        if (identifierData === 'Phone_number') {
          identifierValue = JSON.parse(JSON.stringify(CSVdata[i][mobileNo_field]))
        }
        var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, CSVdata[i].SP_ID]
       
        var updateQuery = val.importUpdate + identifierData + '=?'
      
        db.db.query(updateQuery, [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, CSVdata[i].SP_ID, identifierValue], function (error, results, next) {
          if (error) {
            console.log(error)
          } else {
            console.log(results)
          }
        })
      }


    }
    else {
      for (var j = 0; j < fields.length; j++) {
        for (var i = 0; i < CSVdata.length; i++) {
          var updateData = fields[j]
          var identifierData = identifier[0]
          updatedValue = JSON.parse(JSON.stringify(data[i][fields[j]]));
          identifierValue = JSON.parse(JSON.stringify(data[i][identifier[0]]));


          db.db.query('UPDATE EndCustomer SET ' + updateData + '=?' + ' WHERE ' + identifierData + '=?', [updatedValue, identifierValue], function (error, results, next) {
            if (error) {
              console.log(error)
            } else {
              console.log(JSON.stringify(results.affectedRows))
            }
          })
        }
      }

    }

  }

  
})

app.post('/verifyData', (req, res) => {
  var resdata = req.body
  var CSVdata = resdata.importedData
  var identifier = resdata.identifier
  var purpose = resdata.purpose
  var colMap = req.body.mapping
  console.log(resdata)
  
  var identity=identifier[0]
  
  if (colMap !== undefined) {
    var emailid_field = colMap.emailId !== '' ? colMap.emailId : 'emailId';
    var phoneNo_field = colMap.Mobile_Number !== '' ? colMap.Mobile_Number : 'Phone_number';
  }

  errData = []
  importData = []
  queryData = []
  for (var i = 0; i < CSVdata.length; i++) {
    var email = (CSVdata[i][emailid_field]);
    var phone = CSVdata[i][phoneNo_field]
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    console.log(email.match(emailFormat) + "***" + phone.match(phoneno))
    if ((!email.match(emailFormat)) || (!phone.match(phoneno))) {

      errData.push(CSVdata[i])
    } else {

      queryData.push(CSVdata[i][identifier[0]])
      console.log(queryData)
      importData.push(CSVdata[i])

    }
  }
  console.log(errData.length)
  if (errData.length !== 0) {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(errData)
    fs.writeFile("CSVerr.csv", csv, function (err) {
      if (err) {
        throw err;
      }
      console.log('File Saved')
    })
    res.attachment("CSVerr.csv")
  }


   console.log("importData")
   console.log(importData)
  if (!importData.length == '0') {
  
    var verifyQuery='select * from EndCustomer WHERE ' + identity +' in (?)'+ 'and isBlocked is null and isDeleted is null' 
    
    db.db.query(verifyQuery, [queryData], (err, result) => {
      if (err) {
        console.log(err);
      }
      
      else if(purpose === 'Add new contact only') {
          res.status(200).send({

            newCon: (importData.length - result.length),
            upCont: 0,
            skipCont: errData.length,
            importData: importData
          });
        }
        else if(purpose === 'Update Existing Contacts Only') {
          res.status(200).send({

            newCon: 0,
            upCont: result.length,
            skipCont: errData.length,
            importData: importData
          });
        }
        else if(purpose === 'Add and Update Contacts') {
          res.status(200).send({

            newCon: (importData.length - result.length),
            upCont: result.length,
            skipCont: errData.length,
            importData: importData
          });
        }
      
    })
  }
  else {
    res.status(200).send({

      newCon: 0,
      upCont: 0,
      skipCont: errData.length,
      importData: importData
    });
  }

})

app.get('/downloadCSVerror', (req, res) => {
  console.log("downloadCSVerror")
  var file = path.join(__dirname, '/CSVerr.csv')


  res.download(file)
})




app.get('/download', (req, res) => {
  var file = path.join(__dirname, '/sample_file.csv')


  res.download(file)
})


app.post('/blockedContact', (req, res) => {
  console.log(req.body.customerId)
  db.runQuery(req, res, val.isBlockedQuery, [req.body.customerId,req.query.SP_ID])
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

