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
const axios = require('axios')
const moment = require('moment');
app.use(bodyParser.json({ limit: '100mb' }));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
const authenticateToken = require('../Authorize');

app.get('/columns/:spid', authenticateToken, async (req, res) => {
  try {

    let result = await db.excuteQuery(val.getColumnsQuery, [req.params.spid]);

    res.send({ sataus: 200, result: result })
  } catch (err) {
    console.log(err)
  }
})

app.post('/getFilteredList', authenticateToken, async (req, res) => {
  try {

    let IsFilteredList = false;
    let contactList = await db.excuteQuery('SELECT * FROM EndCustomer where SP_ID=? and isDeleted !=1 and IsTemporary !=1', [req.body.SP_ID])
    if (req.body?.Query != '') {
      IsFilteredList = true
      let Query = req.body.Query + " and isDeleted !=1 and IsTemporary !=1"
      contactList = await db.excuteQuery(Query, [])
    }

    res.send({
      status: 200,
      result: contactList,
      IsFilteredList: IsFilteredList
    })
  } catch (err) {
    console.log(err);
    res.send({
      status: 500,
      msg: err
    })
  }

})


app.post('/addCustomContact', authenticateToken, async (req, res) => {
  try {
    let data = req.body.result;

    // Check if data is an array
    if (!Array.isArray(data)) {
      return res.status(400).json({
        message: 'Data should be an array',
        status: 400
      });
    }

    // Construct the INSERT query dynamically
    let insertQuery = 'INSERT INTO EndCustomer (';
    let values = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // Add column names to the query
      insertQuery += `${item.ActuallName}`;
      if (i < data.length - 1) {
        insertQuery += ', ';
      }

      // Add values to the values array
      if (item.ActuallName === 'Name' || item.ActuallName === 'Phone_number') {
     
        if (!item.displayName) {
     
          return res.status(400).json({
            message: 'Please add Name and Phone number',
            status: 400
          });
        } else if (item.ActuallName === 'Phone_number') {
       
          let existQuery = `SELECT * FROM EndCustomer WHERE Phone_number = ? AND isDeleted != 1 and IsTemporary !=1 AND SP_ID = ?`;
          let existingContact = await db.excuteQuery(existQuery, [item.displayName, req.body.SP_ID]);

          if (existingContact.length > 0) {
            return res.status(409).json({
              message: 'Phone number already exists',
              status: 409
            });
          }
        }
      }

      // Handle arrays and non-arrays uniformly
      if (Array.isArray(item.displayName)) {
        values.push(item.displayName.join());
      } else {
        values.push(item.displayName);
      }
    }

    insertQuery += ') VALUES (';

    // Add placeholders for values in the query
    for (let i = 0; i < data.length; i++) {
      insertQuery += '?';
      if (i < data.length - 1) {
        insertQuery += ', ';
      }
    }

    insertQuery += ')';
    console.log(values);
    console.log(insertQuery);
    let result = await db.excuteQuery(insertQuery, values);
    res.status(200).json({ status: 200, result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, err });
  }
});


app.post('/editCustomContact', authenticateToken, async (req, res) => {
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


app.get('/', async function (req, res) {
  try {
    let contacts = await db.excuteQuery(val.selectAllContact, [req.query.SP_ID]);
    res.status(200).send({
      result: contacts,
      status: 200
    });
  } catch (err) {
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
});


app.post('/exportCheckedContact', authenticateToken, (req, res) => {
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
      subject: "Engagekart - Contacts export report",
      html: `
      <p>Dear ${req.body?.Name},</p>
      <p>Please find attached here the file containing your exported contacts from your Engagekart account.</p>
      <p>Thank you,</p>
      <p>Team Engagekart</p>
      `,
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


app.post('/deletContact', authenticateToken, (req, res) => {
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

app.get('/getContactById', authenticateToken, (req, res) => {
  try {
    console.log(req.query)
    db.runQuery(req, res, val.selectbyid, [req.query.SP_ID, req.query.customerId])
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})

app.put('/editContact', authenticateToken, (req, res) => {
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


app.post('/importContact', authenticateToken, async (req, res) => {

  try {

    var result = req.body;
    var fields = result.field
    var CSVdata = result.importedData
    var identifier = result.identifier
    var purpose = result.purpose
    var SP_ID = result.SP_ID
    let emailId = result?.emailId
    let user = result?.user

    if (purpose === 'Add new contact only') {
      try {

        let addNewUserOnly = await addOnlynewContact(CSVdata, identifier, SP_ID)

        sendMailAfterImport(emailId, user, addNewUserOnly?.count)
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
          var upExistContOnly = await updateContact(CSVdata, identifier, SP_ID);
        }
        else {
          var upExistContOnlyWithFields = await updateSelectedField(CSVdata, identifier, fields, SP_ID);
        }
        sendMailAfterImport(emailId, user, 0)
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

        var addAndUpdateCont = await addOnlynewContact(CSVdata, identifier, SP_ID);

        if (fields.length == 0) {

          var addAndUpdateContwithoutfield = await updateContact(CSVdata, identifier, SP_ID);

        }
        else {

          var addAndUpdatewithFields = await updateSelectedField(CSVdata, identifier, fields, SP_ID);


        }

        sendMailAfterImport(emailId, user, addAndUpdateCont?.count)
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

function sendMailAfterImport(emailId, user, noOfContact) {
  try {

    let text =  `
    <p>Dear ` + user + `,</p>
    <p>The Contacts import initiated by you has been successfully processed. You can check your Engagekart account and start engaging with these newly added contacts.</p>
    <p>Happy Engaging!</p>
    <p>Thank you,</p>
    <p>Team Engagekart</p>
  `

    var mailOptions = {
      from: val.email,
      to: emailId,
      subject: "Engagekart - Contacts import successful",
      html: text,

    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      }
      console.log('Message sent: %s');


    });
  } catch (err) {
    console.log("sendMailAfterImport", err)
  }
}


async function findTagId(TagName, spid) {
  try {
    let tagId = await db.excuteQuery('select * from EndCustomerTagMaster where SP_ID =? and TagName=? and isDeleted !=1', [spid, TagName]);

    let ID = tagId[0]?.ID;
    console.log("tagId[0]?.ID", ID);
    return ID;
  } catch (err) {
    console.log("find tag err", err);
    return err;
  }
}

async function addOnlynewContact(CSVdata, identifier, SP_ID) {
  try {
    let result;
    let count = 0;

    for (let i = 0; i < CSVdata.length; i++) {
      const set = CSVdata[i];
      const fieldNames = set.map((field) => field.ActuallName).join(', ');

      // Find the value of the identifier based on the FieldName
      const identifierField = set.find((field) => field.ActuallName === identifier);
      const identifierValue = identifierField ? identifierField.displayName : '';

      // Replace tag value with tag ID
      for (let field of set) {
        if (field.ActuallName === 'tag') {
          field.displayName = await findTagId(field.displayName, SP_ID);
        }
      }

      let query = `INSERT INTO EndCustomer (${fieldNames}) SELECT ? WHERE NOT EXISTS (SELECT * FROM EndCustomer WHERE ${identifier}=? and SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0));`;
      const values = set.map((field) => field.displayName);
      console.log(values, fieldNames);

      // Ensure db.executeQuery returns a promise
      result = await db.excuteQuery(query, [values, identifierValue, SP_ID]);
      if (result?.affectedRows == 1) {
        count++;
      }
    }

    return { result, count };
  } catch (err) {
    return err;
  }
}

async function updateSelectedField(CSVdata, identifier, fields, SP_ID) {
  try {
    for (let j = 0; j < fields.length; j++) {
      const updateData = fields[j];

      for (let i = 0; i < CSVdata.length; i++) {
        const set = CSVdata[i];

        // Find identifier value and updated field value
        const identifierField = set.find((field) => field.ActuallName === identifier);
        const identifierValue = identifierField ? identifierField.displayName : '';
        const updatedField = set.find((field) => field.ActuallName === updateData);

        // Replace tag value with tag ID
        let updatedFieldValue = updatedField ? updatedField.displayName : '';
        if (updatedField.ActuallName === 'tag') {
          updatedFieldValue = await findTagId(updatedField.displayName, SP_ID);
        }

        // Construct the update query
        let query = `UPDATE EndCustomer SET ${updateData}=? WHERE ${identifier}=? AND SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0)`;

        // Execute the update query
        var upExistContOnlyWithFields = await db.excuteQuery(query, [updatedFieldValue, identifierValue, SP_ID]);
        console.log(upExistContOnlyWithFields);
      }
    }
    return upExistContOnlyWithFields;
  } catch (err) {
    return err;
  }
}

async function updateContact(CSVdata, identifier, SP_ID) {
  try {
    for (let i = 0; i < CSVdata.length; i++) {
      const set = CSVdata[i];

      // Find the identifier field
      const identifierField = set.find((field) => field.ActuallName === identifier);
      const identifierValue = identifierField ? identifierField.displayName : '';

      // Replace tag value with tag ID
      for (let field of set) {
        if (field.ActuallName === 'tag') {
          field.displayName = await findTagId(field.displayName, SP_ID);
        }
      }

      // Build the SET clause for the UPDATE query
      const setClause = set.map((field) => `${field.ActuallName} = ?`).join(', ');

      // Build the UPDATE query
      let query = `UPDATE EndCustomer SET ${setClause} WHERE ${identifier} = ? AND SP_ID = ? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0);`;
      console.log(query);

      // Add values for placeholders in the correct order
      const values = set.map((field) => field.displayName);
      values.push(identifierValue);
      values.push(SP_ID);

      var upExistContOnly = await db.excuteQuery(query, values);
      console.log(upExistContOnly);
    }
    return upExistContOnly;
  } catch (err) {
    return err;
  }
}

async function getHeadersArray(spid) {
  try {


    let getfields = await db.excuteQuery(val.getcolumn, [spid]);


    // Update fields based on ActuallName
    const updatedFields = getfields.map(field => {
      switch (field.ActuallName) {
        case 'Name':
          field.type = 'Text';
          field.mandatory = 1;
          field.displayName = 'Name'
          break;
        case 'Phone_number':
          field.type = 'Number';
          field.mandatory = 1;
          field.displayName = 'Phone Number'
          break;
        case 'emailId':
          field.type = 'Text';
          field.mandatory = 0;
          field.displayName = 'Email'
          break;
        case 'OptInStatus':
          field.type = 'Switch';
          field.mandatory = 0;
          field.displayName = 'Message Opt-in'
          break;
        case 'tag':
          field.type = 'Multi Select';
          field.mandatory = 0;
          field.displayName = 'Tag'
          break;
        case 'ContactOwner':
          field.type = 'User';
          field.mandatory = 1;
          field.displayName = 'Contact Owner'
          break;
          case 'countryCode':
            field.type = 'Text';
            field.mandatory = 1;
            field.displayName = 'countryCode'
            break;
          case 'displayPhoneNumber':
            field.type = 'Number';
            field.mandatory = 1;
            field.displayName = 'displayPhoneNumber'
            break;
        default:
          // No changes required for other ActuallName values
          break;
      }
      return field; // Return the updated field object
    })

    return updatedFields;
  } catch (error) {
    console.error(error);

  }
}

app.post('/verifyData', authenticateToken, async (req, res) => {
  try {
    const { importedData, identifier, purpose, SP_ID } = req.body;
    const identity = identifier;

    let errData = [];
    let importData = [];
    let queryData = [];
    let seenPhoneNumbers = new Set();

    let allColumnsData = await mergeColumnData(SP_ID);
    let userList = await getUserList(SP_ID);
    // let multiSelectValues = await getMultiSelectValues(SP_ID);
    let TagsVal = await getTags(SP_ID);
    let headersArray = await getHeadersArray(SP_ID);
    let existSelect = true;
    let existMultiselect = true;
    let existPhone = true;

    for (let j = 0; j < importedData.length; j++) {
      const currentData = importedData[j];
      let phone;
      let reasons = [];
      let withoutCountryPhone ;
      for (let i = 0; i < currentData.length; i++) {
        const { ActuallName, displayName } = currentData[i];
        if (allColumnsData.get(ActuallName) === 'Select' && ActuallName != 'tag') {
          const { exists, value } = await SelectValues(ActuallName, SP_ID, displayName);
          //  console.log(exists,"select")
          if (exists) {
            currentData[i].displayName = value;
          } else {
            existSelect = false
          }
        }
        if (allColumnsData.get(ActuallName) === 'Multi Select') {
          const { exists, value } = await MultiSelectValues(ActuallName, SP_ID, displayName);
           console.log(exists,"Multi" ,value)
          if (exists) {
            currentData[i].displayName = value;
          } else {
            existMultiselect = false
          }
        }



        if (ActuallName === 'Phone_number') {
          phone = displayName;

          const phoneCheckResult = checkPhoneNumbersLength([phone], countryCodeMap, expectedLengths)[0];
          if (phoneCheckResult.error) {
            existPhone = false;
          } else if (!phoneCheckResult.isValidLength) {
          //  console.log("isValidLength")
            existPhone = false;
          } else {
            console.log("currentData[i].countryCode = phoneCheckResult.country;", phoneCheckResult.phoneNumber)
            // Add country code and display phone number to the existing object
            const countryCode = phoneCheckResult.country;
             withoutCountryPhone = phoneCheckResult.phoneNumber;

            // Find the index of the currentData object
            const currentIndex = currentData.findIndex(obj => obj.ActuallName === 'Phone_number');
            // Insert new properties after the currentData[i] object
            currentData.splice(currentIndex + 1, 0, { displayName: countryCode, ActuallName: 'countryCode' });
           // currentData.splice(currentIndex + 2, 0, { displayName: displayPhoneNumber, ActuallName: 'displayPhoneNumber' });
           
          }
        }
if(ActuallName === 'displayPhoneNumber'){
  currentData[i].displayName = withoutCountryPhone
}
        
        if (allColumnsData.get(ActuallName) !== undefined) {
          const dataTypeVerification = await isDataInCorrectFormat(allColumnsData.get(ActuallName), ActuallName, displayName, userList, TagsVal, headersArray, existSelect, existMultiselect, existPhone);

          if (dataTypeVerification?.isError) {
            reasons.push(dataTypeVerification.reason);
          }
        }
      }

      if (reasons.length === 0) {
        if (seenPhoneNumbers.has(phone)) {
          reasons.push("Duplicate phone number");
        } else {
          seenPhoneNumbers.add(phone);
          queryData.push(phone);
          importData.push(currentData);
        }
      }

      if (reasons.length > 0) {
        errData.push({ data: currentData, reason: reasons });
      }
    }

    if (importData.length > 0) {
      const verifyQuery = 'SELECT * FROM EndCustomer WHERE ' + identity + ' IN (?) AND SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)';
      const result = await db.excuteQuery(verifyQuery, [queryData, SP_ID]);

      let newCon = 0;
      let upCont = 0;

      const newContacts = Math.abs(importData.length - result.length);

      if (purpose === 'Add new contact only') {
        newCon = newContacts;
        const resultPhoneNumbers = result.map(obj => obj.Phone_number);
        const filteredResult = importData.filter(arr => resultPhoneNumbers.includes(arr.find(item => item.ActuallName === 'Phone_number').displayName));

        if (newCon === 0 || (importData.length > newCon)) {
          for (let j = 0; j < filteredResult.length; j++) {
            const currentData = filteredResult[j];
            errData.push({ data: currentData, reason: "This contact already exists" });
          }
        }
      } else if (purpose === 'Update Existing Contacts Only') {
        upCont = result.length;
        const resultPhoneNumbers = result.map(obj => obj.Phone_number);
        const filteredResult = importData.filter(arr => !resultPhoneNumbers.includes(arr.find(item => item.ActuallName === 'Phone_number').displayName));

        if (upCont === 0 || (importData.length > upCont)) {
          for (let j = 0; j < filteredResult.length; j++) {
            const currentData = filteredResult[j];
            errData.push({ data: currentData, reason: "This contact does not already exist" });
          }
        }
      } else if (purpose === 'Add and Update Contacts') {
        newCon = newContacts;
        upCont = result.length;
        console.log("add and update", newContacts, upCont);
      }

      let skippedContact = await writeErrFile(errData, res, headersArray);
      res.status(200).send({
        newCon: newCon,
        upCont: upCont,
        skipCont: skippedContact?.length,
        importData: importData
      });
    } else {
      let skippedContact = await writeErrFile(errData, res, headersArray);
      res.status(200).send({
        newCon: 0,
        upCont: 0,
        skipCont: skippedContact?.length,
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
});


async function writeErrFile(errData, res, headersArray) {
  try {
    if (errData.length !== 0) {
      let maxReasonCount = 0;
      const formattedErrData = errData.map(error => {
        const formattedEntry = {};
        error.data.forEach(entry => {
          const matchedHeader = headersArray.find(header => header.ActuallName === entry.ActuallName);
          if (matchedHeader) {
            formattedEntry[matchedHeader.displayName] = entry.displayName;
          } else {
            formattedEntry[entry.displayName] = entry.displayName;
          }
        });
        if (Array.isArray(error.reason)) {
          error.reason.forEach((reason, index) => {
            formattedEntry[`reason_${index + 1}`] = reason;
            maxReasonCount = Math.max(maxReasonCount, index + 1);
          });
        } else {
          formattedEntry['reason_1'] = error.reason;
          maxReasonCount = Math.max(maxReasonCount, 1);
        }
        return formattedEntry;
      });

      const reasonColumns = Array.from({ length: maxReasonCount }, (_, i) => `reason_${i + 1}`);

      const fields = [];
      errData[0].data.forEach(entry => {
        // Exclude specific values like SP_ID and displayName
        if (entry.ActuallName !== 'SP_ID' && entry.ActuallName !== 'displayPhoneNumber') {
          const matchedHeader = headersArray.find(header => header.ActuallName === entry.ActuallName);
          if (matchedHeader) {
            fields.push(matchedHeader.displayName);
          } else {
            fields.push(entry.displayName);
          }
        }
      });

      fields.push(...reasonColumns);

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(formattedErrData);

      fs.writeFile("CSVerr.csv", csv, function (err) {
        if (err) {
          res.send(err);
        }
        console.log('Error file saved');
      });

      res.attachment("CSVerr.csv");
      return errData;
    }
  } catch (err) {
    console.log("writeErrFile");
    console.log(err)
  }
}



async function mergeColumnData(SP_ID) {
  try {
    // Fetch all column names and data types from EndCustomer table
    const endCustomerColumns = [
      {
        "displayName": "Contact Owner",
        "ActualName": "ContactOwner",
        "type": "User"
      },
      {
        "displayName": "Email",
        "ActualName": "emailId",
        "type": "Text"
      },
      {
        "displayName": "Name",
        "ActualName": "Name",
        "type": "Text"
      },
      {
        "displayName": "Message Opt-in",
        "ActualName": "OptInStatus",
        "type": "Switch"
      },
      {
        "displayName": "Phone Number",
        "ActualName": "Phone_number",
        "type": "Number",
      },
      {
        "displayName": "Tag",
        "ActualName": "tag",
        "type": "Select",
      }
    ];

    // Fetch all column names and data types from SPIDCustomContactFields table
    const spidCustomColumnsQuery = `SELECT ColumnName, CustomColumn,  type FROM SPIDCustomContactFields WHERE SP_ID=? AND isDeleted != 1`;
    const spidCustomColumns = await db.excuteQuery(spidCustomColumnsQuery, [SP_ID]);



    // Combine the data from both sources into a single array
    const allColumns = [...endCustomerColumns, ...spidCustomColumns.map(row => ({ displayName: row.ColumnName, ActualName: row.CustomColumn, type: row.type }))];

    // Store the ActualName and type properties in a Map for easy access
    const columnMap = new Map(allColumns
      .filter(column => column.type !== undefined)
      .map(column => [column.ActualName, column.type]));


    // Return the Map
    return columnMap;
  } catch (error) {
    console.error("Error in mergeColumnData:", error);
    return error;
  }
}


async function isDataInCorrectFormat(columnDataType, actuallName, displayName, userList, tagsList, headersArray, existSelect, existMultiselect, existPhone) {
  try {
    if (!columnDataType) return { isError: false, reason: `${headersArray[actuallName] || actuallName} Unknown column data type` };
    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const phoneFormat = /^[0-9]{6,15}$/;

    // Map ActuallName to displayName
    const field = headersArray.find(f => f.ActuallName === actuallName);
    const fieldDisplayName = field ? field.displayName : actuallName;

    // Convert display name to appropriate data type
    let convertedValue;
    switch (columnDataType) {
      case 'Number':
        if (actuallName === 'Phone_number' && !existPhone) {    //&& !displayName.match(phoneFormat)  remove this for country code validation
          return { isError: true, reason: `${fieldDisplayName} is not valid` };
        } else {
          if (!/^\d+$/.test(displayName)) {
            return { isError: true, reason: `${fieldDisplayName} is not a valid number` };
          }
          convertedValue = parseInt(displayName);
        }
        break;

      case 'Text':
        if (actuallName === 'emailId') {
          if (displayName && !displayName.match(emailFormat)) {
            return { isError: true, reason: `${fieldDisplayName} is not a valid email address` };
          } else {
            convertedValue = displayName ? displayName.toString() : '';
          }
        } else {
          if (actuallName === 'Name' && displayName && !/^[a-zA-Z ]*$/.test(displayName)) {
            return { isError: true, reason: `${fieldDisplayName} contains non-alphabetic characters` };
          } else {
            convertedValue = displayName ? displayName.toString() : '';
          }
        }
        break;

      case 'User':
        if (displayName) {
          convertedValue = userList.includes(displayName);
          return { isError: !convertedValue, reason: `${fieldDisplayName} is invalid contact owner` };
        }
        break;

      case 'Select':
        if (displayName) {
          if (actuallName === 'tag') {
            if (Array.isArray(displayName)) {
              // If displayName is an array, check if the first element is in tagsList
              convertedValue = tagsList.includes(displayName[0]);
            } else if (typeof displayName === 'string') {
              // If displayName is a string, check if it is in tagsList
              convertedValue = tagsList.includes(displayName);
            }
          } else {
            convertedValue = existSelect;
          }
          return { isError: !convertedValue, reason: `${fieldDisplayName} does not exist in the list` };
        }
        break;
      case 'Multi Select':
        if (displayName) {

          convertedValue = existMultiselect;

          return { isError: !convertedValue, reason: `${fieldDisplayName} does not exist in the list` };
        }
        break;
      case 'Time':
        if (displayName) {
          const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

          if (!timeRegex.test(displayName)) {
            return { isError: true, reason: `${fieldDisplayName} is invalid` };
          }
        }

        break;

      case 'Date':
        if (displayName) {
          const date = new Date(displayName);
          const dateDashRegex = /^\d{4}-\d{2}-\d{2}$/;
          const dateSlashRegex = /^\d{4}\/\d{2}\/\d{2}$/;

          if (dateDashRegex.test(displayName) || dateSlashRegex.test(displayName)) {
            convertedValue = !isNaN(date.getTime()) && displayName === formatDate(date, displayName.includes('-') ? '-' : '/');
          }
          return { isError: !convertedValue, reason: `${fieldDisplayName} is invalid` };
        }
        break;

      case 'Switch':
        if (displayName) {
          convertedValue = ['yes', 'no'].includes(displayName.toLowerCase()) ? displayName.toLowerCase() : false;
          if (!convertedValue) {
            return { isError: true, reason: `${fieldDisplayName} is not a valid switch value` };
          }
        }
        break;

      default:
        convertedValue = displayName;
        break;
    }

    // If the converted data type matches the column data type, return true, else return false
    switch (columnDataType) {
      case 'Number':
        return { isError: isNaN(convertedValue), reason: !isNaN(convertedValue) ? "" : `${fieldDisplayName} is not a valid number` };
      case 'Text':
        return { isError: typeof convertedValue !== 'string', reason: typeof convertedValue === 'string' ? "" : `${fieldDisplayName} is not valid text` };
      case 'Switch':
        return { isError: typeof convertedValue !== 'string', reason: typeof convertedValue === 'string' ? "" : `${fieldDisplayName} is not valid switch` };
      default:
        return { isError: false, reason: `${fieldDisplayName} Unknown column data type` };
    }
  } catch (error) {
    console.error("Error in isDataInCorrectFormat:", error);
    return { isError: true, reason: error.message };
  }
}


function formatDate(date, separator) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}${separator}${month}${separator}${day}`;
}

// Helper functions to format dates
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
async function getTags(SP_ID) {
  try {
    const tags = await db.excuteQuery('SELECT TagName FROM EndCustomerTagMaster WHERE SP_ID=? AND isDeleted != 1', [SP_ID]);
console.log(tags.map(row => row.TagName).flat())
    return tags.map(row => row.TagName).flat();
  } catch (error) {
    console.error("Error in getTagList:", error);
    return error;
  }
}

async function getUserList(SP_ID) {
  try {
    const users = await db.excuteQuery('SELECT name FROM user WHERE SP_ID=? AND IsDeleted != 1', [SP_ID]);
    return users.map(row => row.name).flat();
  } catch (error) {
    console.error("Error in getUserList:", error);
    return error;
  }
}

async function getMultiSelectValues(SP_ID) {
  try {
    const selectedVal = await db.excuteQuery('SELECT dataTypeValues FROM SPIDCustomContactFields WHERE SP_ID=? AND Type = ? AND isDeleted != 1 AND dataTypeValues IS NOT NULL', [SP_ID, 'Select']);
    const options = selectedVal.map(row => JSON.parse(row.dataTypeValues).map(item => item.optionName));
    return options.flat();
  } catch (error) {
    console.error("Error in getMultiSelectValues:", error);
    return error;
  }
}


async function SelectValues(ActualName, SP_ID, colValue) {
  try {
    const selectedVal = await db.excuteQuery('SELECT dataTypeValues FROM SPIDCustomContactFields WHERE SP_ID=? AND CustomColumn=? AND Type=? AND isDeleted != 1 AND dataTypeValues IS NOT NULL', [SP_ID, ActualName, 'Select']);
    // console.log("seeeeeeeeeeeeeeeeee, SP_ID, colValue",ActualName, SP_ID, colValue,selectedVal)
    if (selectedVal.length === 0) {
      return { exists: false, value: colValue }; // Handle case when no data is returned
    }

    const options = selectedVal.map(row => JSON.parse(row.dataTypeValues));
    let updatedColValue = colValue;
    let exists = false;

    options.flat().forEach(item => {
      if (item.optionName === colValue) {
        updatedColValue = `${item.id}:${item.optionName}`;
        //   console.log("get function of sel;ect")
        exists = true;
      }
    });

    return { exists, value: updatedColValue };
  } catch (error) {
    console.error("Error in SelectValues:", error);
    return { exists: false, error };
  }
}


async function MultiSelectValues(ActualName, SP_ID, colValue) {
  try {
    const selectedVal = await db.excuteQuery('SELECT dataTypeValues FROM SPIDCustomContactFields WHERE SP_ID=? AND CustomColumn=? AND Type=? AND isDeleted != 1 AND dataTypeValues IS NOT NULL', [SP_ID, ActualName, 'Multi Select']);
    // console.log("ActualName, SP_ID, colValue",ActualName, SP_ID, colValue,selectedVal)
    if (selectedVal.length === 0) {
      return { exists: false, value: colValue }; // Handle case when no data is returned
    }

    const options = selectedVal.map(row => JSON.parse(row.dataTypeValues));
    const colValuesArray = colValue.split(','); // Assuming colValue is a comma-separated string of values
    const updatedColValuesArray = colValuesArray.map(value => {
      let updatedValue = value;
      let exists = false;
      options.flat().forEach(item => {
        if (item.optionName === value) {
          updatedValue = `${item.id}:${item.optionName}`;
          // console.log("mulllllllllllll function of sel;ect")

          exists = true;
        }
      });
      return { exists, value: updatedValue };
    });

    const updatedColValues = updatedColValuesArray.map(item => item.value).join(',');
    const allExists = updatedColValuesArray.every(item => item.exists);
    return { exists: allExists, value: updatedColValues };
  } catch (error) {
    console.error("Error in MultiSelectValues:", error);
    return { exists: false, error };
  }
}







app.get('/downloadCSVerror', authenticateToken, (req, res) => {
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




app.get('/download', authenticateToken, (req, res) => {
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


app.post('/blockedContact', authenticateToken, (req, res) => {
  try {
    let blockedQuery = val.isBlockedQuery
    console.log(req.body.isBlocked, "req.body.isBlocked == 1", req.body.isBlocked == 1)
    if (req.body.isBlocked == 1) {
      blockedQuery = `UPDATE EndCustomer set  isBlocked=?,isBlockedOn=now() ,OptInStatus='No' where customerId=? and SP_ID=?`
      UnassignedBlockedContact(req.body.customerId, req.query.SP_ID)
    }

    db.runQuery(req, res, blockedQuery, [req.body.isBlocked, req.body.customerId, req.query.SP_ID])
  } catch (err) {
    console.error(err);
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})

async function UnassignedBlockedContact(customerId, spid) {
  try {
    let getInteraction = await db.excuteQuery(`SELECT  InteractionId FROM Interaction WHERE customerId = ? and SP_ID=? ORDER BY InteractionId DESC`, [customerId, spid])
    let findMappingQuery = `SELECT *
FROM InteractionMapping
WHERE InteractionId = (SELECT  InteractionId FROM Interaction WHERE customerId = ? and SP_ID=? ORDER BY InteractionId DESC);`

    let mapping = await db.excuteQuery(findMappingQuery, [customerId, spid]);

    if (mapping?.length > 0) {
      let updateMapping = await db.excuteQuery(`update InteractionMapping set AgentId = -1 where MappingId =?`, [mapping[0]?.MappingId])
    }
    console.log('empty', getInteraction[0]?.InteractionId, customerId, spid)

    let updateStatus = await db.excuteQuery(`update Interaction set interaction_status=? where InteractionId=? and SP_ID=? AND customerId=?`, ['empty', getInteraction[0]?.InteractionId, spid, customerId])
    console.log("updateStatus", updateStatus)
  } catch (err) {
    console.log("err", err)
  }
}

//common method for send email through node mailer
let transporter = nodemailer.createTransport({
  //service: 'gmail',
  host: val.emailHost,
  port: val.port,
  secure: true,
  auth: {
    user: val.email,
    pass: val.appPassword
  },
});


app.post('/addProfileImg', authenticateToken, async (req, res) => {
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


app.get('/getProfileImg/:cuid', authenticateToken, async (req, res) => {
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


app.post('/addflow', authenticateToken, async (req, res) => {
  try {
    // let getProfileQuery = `SELECT contact_profile FROM EndCustomer WHERE customerId=?`;
    // let getProfile = await db.excuteQuery(getProfileQuery, [req.params.cuid]);
    console.log(req.body)
    res.status(200).send({

      status: 200
    });
  } catch (err) {
    console.error(err);

    res.status(500).send({
      msg: err,
      status: 500
    });
  }
})

const countryCodes = [
  'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
  'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
  'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
  'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
  'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
  'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1767', 'DO +1809', 'DZ +213',
  'EC +593', 'EE +372', 'EG +20', 'EH +212', 'ER +291', 'ES +34', 'ET +251', 'FI +358', 'FJ +679', 'FK +500',
  'FM +691', 'FO +298', 'FR +33', 'GA +241', 'GB +44', 'GD +1473', 'GE +995', 'GF +594', 'GG +44', 'GH +233',
  'GI +350', 'GL +299', 'GM +220', 'GN +224', 'GP +590', 'GQ +240', 'GR +30', 'GS +500', 'GT +502', 'GU +1671',
  'GW +245', 'GY +592', 'HK +852', 'HN +504', 'HR +385', 'HT +509', 'HU +36', 'ID +62', 'IE +353', 'IL +972',
  'IM +44', 'IN +91', 'IO +246', 'IQ +964', 'IR +98', 'IS +354', 'IT +39', 'JE +44', 'JM +1876', 'JO +962',
  'JP +81', 'KE +254', 'KG +996', 'KH +855', 'KI +686', 'KM +269', 'KN +1869', 'KP +850', 'KR +82', 'KW +965',
  'KY +1345', 'KZ +7', 'LA +856', 'LB +961', 'LC +1758', 'LI +423', 'LK +94', 'LR +231', 'LS +266', 'LT +370',
  'LU +352', 'LV +371', 'LY +218', 'MA +212', 'MC +377', 'MD +373', 'ME +382', 'MF +590', 'MG +261', 'MH +692',
  'MK +389', 'ML +223', 'MM +95', 'MN +976', 'MO +853', 'MP +1 670', 'MQ +596', 'MR +222', 'MS +1 664', 'MT +356',
  'MU +230', 'MV +960', 'MW +265', 'MX +52', 'MY +60', 'MZ +258', 'NA +264', 'NC +687', 'NE +227', 'NF +672',
  'NG +234', 'NI +505', 'NL +31', 'NO +47', 'NP +977', 'NR +674', 'NU +683', 'NZ +64', 'OM +968', 'PA +507',
  'PE +51', 'PF +689', 'PG +675', 'PH +63', 'PK +92', 'PL +48', 'PM +508', 'PN +872', 'PR +1 787', 'PS +970',
  'PT +351', 'PW +680', 'PY +595', 'QA +974', 'RE +262', 'RO +40', 'RS +381', 'RU +7', 'RW +250', 'SA +966',
  'SB +677', 'SC +248', 'SD +249', 'SE +46', 'SG +65', 'SH +290', 'SI +386', 'SJ +47', 'SK +421', 'SL +232',
  'SM +378', 'SN +221', 'SO +252', 'SR +597', 'SS +211', 'ST +239', 'SV +503', 'SX +1721', 'SY +963', 'SZ +268',
  'TC +1649', 'TD +235', 'TF +262', 'TG +228', 'TH +66', 'TJ +992', 'TK +690', 'TL +670', 'TM +993', 'TN +216',
  'TO +676', 'TR +90', 'TT +1868', 'TV +688', 'TW +886', 'TZ +255', 'UA +380', 'UG +256', 'US +1', 'UY +598',
  'UZ +998', 'VA +39', 'VC +1784', 'VE +58', 'VG +1284', 'VI +1340', 'VN +84', 'VU +678', 'WF +681', 'WS +685',
  'YE +967', 'YT +262', 'ZA +27', 'ZM +260', 'ZW +263'
];

// Expected lengths of phone numbers for specific countries
const expectedLengths = {
  '376': 6, '971': 9, '93': 9, '1268': 7, '1264': 7, '355': 9, '374': 8, '244': 9, '54': 10, '1684': 10,
  '43': 10, '61': 9, '297': 7, '358': 10, '994': 9, '387': 8, '1246': 7, '880': 10, '32': 9, '226': 8,
  '359': 9, '973': 8, '257': 8, '229': 8, '590': 9, '1441': 7, '673': 7, '591': 8, '599': 9, '55': 11,
  '1242': 10, '975': 8, '267': 8, '375': 9, '501': 7, '1': 10, '61': 9, '243': 9, '236': 8, '242': 9,
  '41': 9, '225': 8, '682': 5, '56': 9, '237': 9, '86': 11, '57': 10, '506': 8, '53': 8, '238': 7,
  '357': 8, '420': 9, '49': 10, '253': 8, '45': 8, '1767': 10, '1809': 10, '213': 9, '593': 9, '372': 7,
  '20': 10, '212': 9, '291': 7, '34': 9, '251': 9, '358': 9, '679': 7, '500': 7, '691': 7, '298': 6,
  '33': 9, '241': 7, '44': 10, '1473': 10, '995': 9, '594': 9, '44': 10, '233': 9, '350': 8, '299': 6,
  '220': 7, '224': 9, '240': 9, '30': 10, '1671': 10, '245': 7, '592': 7, '852': 8, '504': 8, '385': 9,
  '509': 8, '36': 9, '62': 10, '353': 9, '972': 9, '44': 10, '91': 10, '246': 7, '964': 10, '98': 10,
  '354': 7, '39': 10, '44': 10, '1876': 10, '962': 9, '81': 10, '254': 9, '996': 9, '855': 9, '686': 5,
  '269': 7, '1869': 10, '850': 10, '82': 10, '965': 8, '1345': 10, '7': 10, '856': 9, '961': 8, '1758': 10,
  '423': 7, '94': 9, '231': 7, '266': 8, '370': 8, '352': 9, '371': 8, '218': 10, '212': 9, '377': 8,
  '373': 8, '382': 9, '261': 9, '692': 7, '389': 8, '223': 8, '95': 9, '976': 8, '853': 8, '1670': 10,
  '596': 9, '222': 9, '356': 8, '230': 7, '960': 7, '265': 7, '52': 10, '60': 9, '258': 9, '264': 9,
  '687': 6, '227': 8, '672': 6, '234': 10, '505': 8, '31': 9, '47': 8, '977': 10, '674': 6, '683': 4,
  '64': 9, '968': 8, '507': 8, '51': 9, '689': 6, '675': 8, '63': 10, '92': 10, '48': 9, '508': 6,
  '787': 10, '970': 9, '351': 9, '680': 7, '595': 9, '974': 8, '262': 9, '40': 9, '381': 8, '7': 10,
  '250': 9, '966': 9, '677': 7, '248': 7, '249': 9, '46': 9, '65': 8, '290': 5, '386': 9, '421': 9,
  '232': 8, '378': 9, '221': 9, '252': 7, '597': 7, '211': 9, '239': 7, '503': 8, '1721': 10, '963': 9,
  '268': 7, '1649': 10, '235': 9, '262': 9, '228': 8, '66': 9, '992': 9, '690': 5, '670': 8, '993': 8,
  '216': 8, '676': 5, '90': 10, '1868': 10, '688': 5, '886': 9, '255': 9, '380': 9, '256': 9, '598': 8,
  '998': 9, '39': 9, '1784': 10, '58': 10, '1284': 10, '1340': 10, '84': 9, '678': 5, '681': 6, '685': 7,
  '967': 9, '262': 9, '27': 9, '260': 9, '263': 9
};

// Function to parse country codes into a map

function parseCountryCodes(countryCodes) {
  const codeMap = new Map();
  countryCodes.forEach(code => {
    const [country, phoneCode] = code.split(' +');
    codeMap.set(phoneCode.trim(), `${country} +${phoneCode.trim()}`); // Store country name and code as value
  });
  return codeMap;
}



function separatePhoneNumber(countryPhone, countryCodeMap) {
  for (const [code, fullCode] of countryCodeMap) {
    if (countryPhone.startsWith(code)) {
      const phoneNumber = countryPhone.slice(code.length).replace(/^0+/, ''); // Remove country code and leading zeros
      return { country: fullCode, phoneNumber };
    }
  }
  return null;
}
const countryCodeMap = parseCountryCodes(countryCodes);




// Function to check length of phone numbers and validate country code
const checkPhoneNumbersLength = (phoneNumbers, countryCodeMap, expectedLengths) => {
 return phoneNumbers.map(phone => {
    const result = separatePhoneNumber(phone, countryCodeMap);
    if (result) {
      const expectedLength = expectedLengths[result.country.slice(1)];
      const isValidLength = expectedLength !== undefined ? result.phoneNumber.length === expectedLength : true;
      return {
        country: result.country,
        phoneNumber: result.phoneNumber,
        length: result.phoneNumber.length,
        isValidLength
      };
    } else {
      return { phone, error: "Invalid country code or phone number" };
    }
  });
};

// Example usage



//const phoneNumberLengths = checkPhoneNumbersLength(phoneNumbers, countryCodeMap, expectedLengths);
//console.log(phoneNumberLengths);



app.listen(3002);

