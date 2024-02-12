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
const awsHelper = require('../awsHelper')
const { Key } = require("protractor");
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/columns/:spid', async (req, res) => {
  try {

    let query = ` SELECT column_name as displayName,column_name as ActuallName
    FROM information_schema.columns
    WHERE table_name = 'EndCustomer' and column_name not like '%column%' and column_name not in ('created_at', 'customerId', 'isDeleted', 'SP_ID', 'uid', 'updated_at','isBlockedOn','isBlocked' ,'channel','displayPhoneNumber','countryCode','IsTemporary','contact_profile','InstagramId','facebookId','Country','state','city','pincode','address','sex','status','age')
    UNION
    SELECT ColumnName AS column_name,CustomColumn as ActuallName
    FROM SPIDCustomContactFields  
    WHERE SP_ID =?  AND isDeleted!=1;`
    let result = await db.excuteQuery(query, [req.params.spid]);

    res.send({ sataus: 200, result: result })
  } catch (err) {
    console.log(err)
  }
})


app.post('/addCustomContact', async (req, res) => {
  try{
  // Construct the INSERT query dynamically
  let data = req.body.result
  console.log(data)
  let insertQuery = 'INSERT INTO EndCustomer (';
  let values = [];
  // Iterate through the data array and add column names to the query
  data.forEach((item, index) => {
    insertQuery += `${item.ActuallName}`;
    if (item.ActuallName == 'Name' || item.ActuallName == 'Phone_number') {
      if (item.displayName == '') {
        res.status(400).send({
          message: 'Please add Name and Phone no  ',
          status: 400
        })
      }
    }
    if (Array.isArray(item.displayName)) {
      console.log("if")
      var list = item.displayName;
      ListofArrays = [];

      for (var i = 0; i < list.length; i++) {

        ListofArrays.push(list[i]);

      }
      joinList = ListofArrays.join()
      values.push(joinList);

    }

    else {
      console.log("else")
      values.push(item.displayName)
    }
    if (index < data.length - 1) {
      insertQuery += ', ';
    }
  });

  insertQuery += ' ) VALUES (';

  // Add placeholders for values in the query
  data.forEach((item, index) => {
    insertQuery += `?`;
    if (index < data.length - 1) {
      insertQuery += ', ';
    }
  });

  insertQuery += ')';
  console.log(values)
  console.log(insertQuery);
  let result=await db.excuteQuery(insertQuery,values)
  res.send({ status: 200, result: result});
}catch(err){
  res.send({ status: 500, "err": err });
}
})

app.post('/editCustomContact', async (req, res) => {
  try {
    const id = req.query.customerId;
    const spid = req.query.SP_ID;
    let query = val.neweditContact;
    let data = req.body.result
    let values = [];
    // Iterate through the data array and add column names to the query
    data.forEach((item, index) => {
      query += `${item.ActuallName} =?`;

      if (Array.isArray(item.displayName)) {
        console.log("if");
        var list = item.displayName;
        ListofArrays = [];

        for (var i = 0; i < list.length; i++) {
          ListofArrays.push(list[i]);
        }
        joinList = ListofArrays.join();
        values.push(joinList);
      } else {
        console.log("else");
        values.push(item.displayName);
      }

      if (index < data.length - 1) {
        query += ', ';
      }
    });

    query += ' WHERE customerId = ? and SP_ID=?'
    values.push(id);
    values.push(spid);
    console.log(values);
    console.log(query);
    let result = await db.excuteQuery(query, values)
    res.send({ status: 200, result: result })
  } catch (err) {
    console.log(err);
    res.send({ status: 500 })
  }
})


app.get('/', function (req, res) {
  db.runQuery(req, res, val.selectAllContact, [req.query.SP_ID]);
});



app.post('/contact', async function (req, res) {
  console.log("contact")
  try {
    console.log(req.body)
    Name = req.body.Name
    Phone_number = req.body.Phone_number.internationalNumber
    countryCode=req.body.country_code
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

    var values = [[Name, Phone_number, emailId, age, tagListJoin, statusListJoin, facebookId, InstagramId, SP_ID,countryCode]];

    //db.runQuery(req, res, val.insertContact, [values])
    var result = await db.excuteQuery(val.existContactWithSameSpid, [emailId, Phone_number, SP_ID])

    console.log("result >>>>>>>>>>")
    console.log(result)
    if (result.length > 0) {
      // email or phone number already exist, return an error response

      res.status(409).send({
        msg: 'Email or phone number already exist !',
        status: 409
      });
    }
    else {

      var customers = await db.excuteQuery(val.insertContact, [values])

      res.status(200).send({
        msg: 'Contact added successfully !',
        contact: customers,
        status: 200
      });
    }
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


app.post('/importContact', async (req, res) => {

  try {

    var result = req.body;
    var fields = result.field
    var CSVdata = result.importedData
    var identifier = result.identifier
    var purpose = result.purpose
    var SP_ID = result.SP_ID

    if (purpose === 'Add new contact only') {
      try {

        let addNewUserOnly = await addOnlynewContact(CSVdata, identifier,SP_ID)

        res.status(200).send({
          msg: "Contact Added Successfully",
          data: addNewUserOnly,
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


    if (purpose === 'Update Existing Contacts Only') {
      try {

        if (fields.length == 0) {
          var upExistContOnly = await updateContact(CSVdata, identifier,SP_ID);
        }
        else {
          var upExistContOnlyWithFields = await updateSelectedField(CSVdata, identifier, fields,SP_ID);
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

        var addAndUpdateCont = await addOnlynewContact(CSVdata, identifier,SP_ID);

        if (fields.length == 0) {

          var addAndUpdateContwithoutfield = await updateContact(CSVdata, identifier,SP_ID);
          
        }
        else {

          var addAndUpdatewithFields = await  updateSelectedField(CSVdata, identifier, fields,SP_ID);

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

async function addOnlynewContact(CSVdata, identifier,SP_ID) {
  for (let i = 0; i < CSVdata.length; i++) {
    const set = CSVdata[i];
    const fieldNames = set.map((field) => field.FieldName).join(', ');

    // Find the value of the identifier based on the FieldName
    const identifierField = set.find((field) => field.FieldName === identifier);
    const identifierValue = identifierField ? identifierField.FieldValue : '';

    let query = `INSERT INTO EndCustomer (${fieldNames},SP_ID) SELECT ? WHERE NOT EXISTS (SELECT * FROM EndCustomer WHERE ${identifier}=? AND SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0));`;
    const values = set.map((field) => field.FieldValue);
    values.push(SP_ID);
    console.log(query)
    console.log(values);
    var result = await db.excuteQuery(query, [values, identifierValue, SP_ID])
    console.log(result)
   
  }
  return result;
}


async function updateSelectedField(CSVdata, identifier, fields,SP_ID) {
  for (var j = 0; j < fields.length; j++) {
    for (var i = 0; i < CSVdata.length; i++) {
      var updateData = fields[j]
      const set = CSVdata[i];

      const identifierField = set.find((field) => field.FieldName === identifier);
      const identifierValue = identifierField ? identifierField.FieldValue : '';
      const updatedField = set.find((field) => field.FieldName === updateData);
      const updatedFieldValue = updatedField ? updatedField.FieldValue : '';

      let query = 'UPDATE EndCustomer SET ' + updateData + '=?' + ' WHERE ' + identifier + '=?  and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)'
      console.log(query)
      var upExistContOnlyWithFields = await db.excuteQuery(query, [updatedFieldValue, identifierValue, SP_ID])
      console.log(upExistContOnlyWithFields)
     
    }
  }
  return upExistContOnlyWithFields;
}


async function updateContact(CSVdata, identifier,SP_ID) {
  for (var i = 0; i < CSVdata.length; i++) {
    const set = CSVdata[i];

    const identifierField = set.find((field) => field.FieldName === identifier);
    const identifierValue = identifierField ? identifierField.FieldValue : '';

    // Build the SET clause for the UPDATE query
    const setClause = set.map((field) => `${field.FieldName} = ?`).join(', ');

    // Build the UPDATE query
    let query = `UPDATE EndCustomer SET ${setClause} WHERE ${identifier} = ? and SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0);`;
    console.log(query)
    // Add values for placeholders in the correct order
    const values = set.map((field) => field.FieldValue);
    values.push(identifierValue);
    values.push(SP_ID);

    var upExistContOnly = await db.excuteQuery(query, values);
    console.log(upExistContOnly)
   
  }
  return upExistContOnly;
}


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


    console.log("importData" + importData.length)
    console.log(importData)
    if (importData.length > '0') {

      var verifyQuery = 'select * from EndCustomer WHERE ' + identity + ' in (?)' + ' and SP_ID=?  and  (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)'
      var result = await db.excuteQuery(verifyQuery, [queryData, SP_ID])
      console.log("_______" + result.length)

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
    let blockedQuery =  val.isBlockedQuery
  console.log(req.body.isBlocked ,"req.body.isBlocked == 1"  ,req.body.isBlocked == 1)
    if(req.body.isBlocked == 1){
        blockedQuery = `UPDATE EndCustomer set  isBlocked=?,isBlockedOn=now() ,OptInStatus='No' where customerId=? and SP_ID=?`
    }
    db.runQuery(req, res, blockedQuery, [req.body.isBlocked,req.body.customerId, req.query.SP_ID])
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


app.post('/addProfileImg', async (req, res) => {
  try {
    customerId = req.body.customerId
    contact_profile = req.body.contact_profile
    SP_ID = req.body.SP_ID
    // Remove header
    let streamSplit = contact_profile.split(';base64,');
    let base64Image = streamSplit.pop();//With the change done in aws helper this is not required though keeping it in case required later.
    let datapart = streamSplit.pop();// this is dependent on the POP above

    let imgType = datapart.split('/').pop();
    let imageName = 'ContactProfile.png';//Default it to png.
    if (imgType) {
      imageName = 'ContactProfile' + '.' + imgType;
    }


    let awsres = await awsHelper.uploadStreamToAws(SP_ID + "/" + customerId + "/" + imageName, contact_profile)


    let contactimgquery = `UPDATE EndCustomer  set contact_profile=? where customerId=?`
    let result = await db.excuteQuery(contactimgquery, [awsres.value.Location, customerId]);
    res.status(200).send({
      msg: result,
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
})


app.get('/getProfileImg/:cuid', async (req, res) => {
  try {
    let getProfileQuery = `SELECT contact_profile FROM EndCustomer WHERE customerId=?`;
    let getProfile = await db.excuteQuery(getProfileQuery, [req.params.cuid]);
    res.status(200).send({
      msg: getProfile,
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
})

app.listen(3002);

