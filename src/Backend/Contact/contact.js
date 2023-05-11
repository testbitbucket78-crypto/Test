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
  try {
    console.log(req.body)
    Name = req.body.Name
    Phone_number = req.body.Phone_number.internationalNumber

    emailId = req.body.emailId
    if (Name == '' || Phone_number == '' || emailId == '') {
      res.status(400).send({
        message: 'Please Name ,Phone no and email id',
        status: 400
      })
    }
    age = req.body.age

    var tag = req.body.tag
    var status = req.body.status
    facebookId = req.body.facebookId
    InstagramId = req.body.InstagramId
    SP_ID = req.body.SP_ID
    var tagList = [];
    var tagListJoin = '';
    if (tag != undefined && tag != '') {
      for (var i = 0; i < tag.length; i++) {
        tagList.push(tag[i].item_text)
      }

      tagListJoin = tagList.join();
      console.log(tagListJoin)
    }
    var statusList = [];
    var statusListJoin = ''
    if (tag != undefined && tag != '') {
      for (var i = 0; i < status.length; i++) {
        statusList.push(status[i].item_text)
      }
      statusListJoin = statusList.join();
      console.log(statusListJoin)
    }

    var values = [[Name, Phone_number, emailId, age, tagListJoin, statusListJoin, facebookId, InstagramId, SP_ID]];

    db.runQuery(req, res, val.insertContact, [values])
  } catch (err) {
    console.log(err)
    db.errlog(err);
    res.send(err)
  }

});




app.post('/exportCheckedContact', (req, res) => {
  try {
    console.log(req.body)
    var data = req.body.data
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data)

    fs.writeFile("data.csv", csv, function (err) {
      if (err) {
        res.send(err);
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
        res.send(error);
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.status(200).send({ msg: "data has been sent" });
    });
    return res.status(200).send({ msg: "Contacts exported sucessfully!" });
  } catch (err) {
    db.errlog(err);
    res.send(err);
  }

})


app.post('/deletContact', (req, res) => {
  try {

    var Ids = req.body.customerId;
    console.log(req.body)
    db.runQuery(req, res, val.delet, [req.body.customerId, req.body.SP_ID])
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})

app.get('/getContactById', (req, res) => {
  try {
    console.log(req.query)
    db.runQuery(req, res, val.selectbyid, [req.query.customerId, req.query.SP_ID])
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})

app.put('/editContact', (req, res) => {
  try {
    console.log("editContact")
    const id = req.query.customerId;
    const spid = req.query.SP_ID;
    const Phone_number = req.body.Phone_number.e164Number

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
      else if (key == 'Phone_number') {

        values.push(Phone_number)
      }
      else {
        values.push(dataToUpdate[key])
      }
    });
    query = query.slice(0, -2);

    query += ` WHERE customerId = ? and SP_ID=?`;
    values.push(id);
    values.push(spid);

    db.runQuery(req, res, query, values)
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})


app.post('/updateAndSave', async (req, res) => {
  try {
    console.log("updateAndSave")
    //console.log(req.body)
    var result = req.body;
    var fields = result.field
    var CSVdata = result.importedData
    var colMap = result.mapping
    var identifier = result.identifier
    var purpose = result.purpose
    var SP_ID = result.SP_ID
    console.log(SP_ID)


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

    if (purpose === 'Add new contact only') {
      try {

        for (var i = 0; i < CSVdata.length; i++) {
          var identifierValue = ''
          if (identifierData === 'emailId') {
            identifierValue = JSON.parse(JSON.stringify(CSVdata[i][emailid_field]))
          }
          if (identifierData === 'Phone_number') {
            identifierValue = JSON.parse(JSON.stringify(CSVdata[i][mobileNo_field]))
          }
          var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, SP_ID]
          var query = val.importquery + identifierData + '=? AND SP_ID=?' + ' and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0))'
          console.log(query)
          var addNewUserOnly = await db.excuteQuery(query, [values, identifierValue, SP_ID])



          res.status(200).send({
            msg: "Contact Added Successfully",
            data: addNewUserOnly,
            status: 200
          });
        }
      } catch (err) {
        console.log(err);
        db.errlog(err);
        res.status(500).send({
          msg: err,
          status: 500
        });
      }


    }


    if (purpose === 'Update Existing Contacts Only') {
      try {
        if (fields.length == 0) {
          for (var i = 0; i < CSVdata.length; i++) {
            var identifierValue = ''
            if (identifierData === 'emailId') {
              identifierValue = JSON.parse(JSON.stringify(CSVdata[i][emailid_field]))
            }
            if (identifierData === 'Phone_number') {
              identifierValue = JSON.parse(JSON.stringify(CSVdata[i][mobileNo_field]))
            }
            var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid]

            var updateQuery = val.importUpdate + identifierData + '=? and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)'
            var upExistContOnly = await db.excuteQuery(updateQuery, [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, identifierValue, SP_ID])

          }
        }
        else {
          for (var j = 0; j < fields.length; j++) {
            for (var i = 0; i < CSVdata.length; i++) {
              var updateData = fields[j]
              var identifierData = identifier[0]
              updatedValue = JSON.parse(JSON.stringify(CSVdata[i][fields[j]]));
              identifierValue = JSON.parse(JSON.stringify(CSVdata[i][identifier[0]]));
              var upExistContOnlyWithFields = await db.excuteQuery('UPDATE EndCustomer SET ' + updateData + '=?' + ' WHERE ' + identifierData + '=?  and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)', [updatedValue, identifierValue, SP_ID])

              console.log(JSON.stringify(upExistContOnlyWithFields.affectedRows))
            }
          }
        }
        res.status(200).send({
          msg: "Existing Contact Updated Successfully",
          upExistContOnly: upExistContOnly,
          upExistContOnlyWithFields: upExistContOnlyWithFields,
          status: 200
        });
      } catch (err) {
        console.log(err);
        db.errlog(err);
        res.status(500).send({
          msg: err,
          status: 500
        });

      }
    }

    if (purpose === 'Add and Update Contacts') {
      //********ADD NEW CONTACT********* */
      try {
        for (var i = 0; i < CSVdata.length; i++) {
          var identifierValue = ''
          if (identifierData === 'emailId') {
            identifierValue = JSON.parse(JSON.stringify(CSVdata[i][emailid_field]))
          }
          if (identifierData === 'Phone_number') {
            identifierValue = JSON.parse(JSON.stringify(CSVdata[i][mobileNo_field]))
          }
          var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, SP_ID]
          var query = val.importquery + identifierData + '=? and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)' + ')'
          var addAndUpdateCont = await db.excuteQuery(query, [values, identifierValue, SP_ID])


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
            var values = [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid]

            var updateQuery = val.importUpdate + identifierData + '=? and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)'
            var addAndUpdateContwithoutfield = await db.excuteQuery(updateQuery, [CSVdata[i][name_field], CSVdata[i][mobileNo_field], CSVdata[i][emailid_field], CSVdata[i][status_field], CSVdata[i][gender_field], CSVdata[i].age, CSVdata[i][state_field], CSVdata[i][country_field], CSVdata[i][tag_field], CSVdata[i].address, CSVdata[i].pincode, CSVdata[i].city, CSVdata[i].OptInStatus, CSVdata[i].facebookId, CSVdata[i].InstagramId, CSVdata[i].channel, CSVdata[i].uid, identifierValue, SP_ID])

          }


        }
        else {
          for (var j = 0; j < fields.length; j++) {
            for (var i = 0; i < CSVdata.length; i++) {
              var updateData = fields[j]
              var identifierData = identifier[0]
              updatedValue = JSON.parse(JSON.stringify(CSVdata[i][fields[j]]));
              identifierValue = JSON.parse(JSON.stringify(CSVdata[i][identifier[0]]));
              var addAndUpdatewithFields = await db.excuteQuery('UPDATE EndCustomer SET ' + updateData + '=?' + ' WHERE ' + identifierData + '=? and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)', [updatedValue, identifierValue, SP_ID])

            }

          }

        }

        res.status(200).send({
          msg: "Add and Updated Contact Successfully",
          addAndUpdatewithFields: addAndUpdatewithFields,
          addAndUpdateContwithoutfield: addAndUpdateContwithoutfield,
          addAndUpdateCont: addAndUpdateCont,
          status: 200
        });
      } catch (err) {
        console.error(err);
        db.errlog(err);
        res.status(500).send({
          msg: err,
          status: 500
        });
      }
    }
  } catch (err) {
    console.error(err);
    db.errlog(err);
  }
})



app.post('/verifyData', async (req, res) => {
  try {
    var resdata = req.body
    var CSVdata = resdata.importedData
    var identifier = resdata.identifier
    var purpose = resdata.purpose
    var colMap = req.body.mapping
    var SP_ID = resdata.SP_ID
    console.log(resdata)

    var identity = identifier[0]

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
          res.send(err);
        }
        console.log('File Saved')
      })
      res.attachment("CSVerr.csv")
    }


    console.log("importData" +importData.length)
    console.log(importData)
    if (importData.length>'0') {

      var verifyQuery = 'select * from EndCustomer WHERE ' + identity + ' in (?)' + ' and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)'
      var result = await db.excuteQuery(verifyQuery, [queryData, SP_ID])
     console.log("_______"+result.length)

      try {
        if (purpose === 'Add new contact only') {
          res.status(200).send({

            newCon: Math.abs(importData.length - result.length),
            upCont: 0,
            skipCont: errData.length,
            importData: importData
          });
        }
        else if (purpose === 'Update Existing Contacts Only') {
          res.status(200).send({

            newCon: 0,
            upCont: result.length,
            skipCont: errData.length,
            importData: importData
          });
        }
        else if (purpose === 'Add and Update Contacts') {
          res.status(200).send({

            newCon: Math.abs(importData.length - result.length),
            upCont: result.length,
            skipCont: errData.length,
            importData: importData
          });
        }

      } catch (err) {
        console.log(err)
        db.errlog(err);
        res.status(500).send({
          msg: err,
          status: 500
        });
      }

    } else {
      res.status(200).send({

        newCon: 0,
        upCont: 0,
        skipCont: errData.length,
        importData: importData
      });
    }
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }

})

app.get('/downloadCSVerror', (req, res) => {
  try {
    console.log("downloadCSVerror")
    var file = path.join(__dirname, '/CSVerr.csv')


    res.download(file)
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})




app.get('/download', (req, res) => {
  try {
    var file = path.join(__dirname, '/sample_file.csv')


    res.download(file)
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})


app.post('/blockedContact', (req, res) => {
  try {
    console.log(req.body.customerId)
    db.runQuery(req, res, val.isBlockedQuery, [req.body.customerId, req.query.SP_ID])
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
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

