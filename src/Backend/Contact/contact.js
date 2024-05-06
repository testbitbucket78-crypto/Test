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
        console.log("==========================")
        if (!item.displayName) {
          console.log("++++++++++++++++++++++++")
          return res.status(400).json({
            message: 'Please add Name and Phone number',
            status: 400
          });
        } else if (item.ActuallName === 'Phone_number') {
          console.log("********************************")
          let existQuery = `SELECT * FROM EndCustomer WHERE Phone_number = ? AND isDeleted != 1 AND SP_ID = ?`;
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
    let contacts = await db.excuteQuery(val.selectAllContact, [req.query.SP_ID, req.query.SP_ID]);

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
    db.runQuery(req, res, val.selectbyid, [req.query.SP_ID, req.query.SP_ID, req.query.customerId])
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
        // sendMailAfterImport(emailId,user,addNewUserOnly?.length)
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
        // sendMailAfterImport(emailId,user,0)
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
        //  sendMailAfterImport(emailId,user,addAndUpdateCont?.length)
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

    let text = `<p>Hi` + user + `, your contact import is complete! `
      + noOfContact + `new contacts have been added to your Engagekart account.
    Start connecting now!</p>
    - Team Engagekart`

    var mailOptions = {
      from: val.email,
      to: emailId,
      subject: "Conformation of upload csv file: ",
      html: text,

    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(err)
      }
      console.log('Message sent: %s');


    });
  } catch (err) {
    console.log("sendMailAfterImport", err)
  }
}

async function addOnlynewContact(CSVdata, identifier, SP_ID) {

  try {
    let result;
    for (let i = 0; i < CSVdata.length; i++) {
      const set = CSVdata[i];
      const fieldNames = set.map((field) => field.ActuallName).join(', ');

      // Find the value of the identifier based on the FieldName
      const identifierField = set.find((field) => field.ActuallName === identifier);
      const identifierValue = identifierField ? identifierField.displayName : '';

      let query = `INSERT INTO EndCustomer (${fieldNames}) SELECT ? WHERE NOT EXISTS (SELECT * FROM EndCustomer WHERE ${identifier}=?  and SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0));`;
      const values = set.map((field) => field.displayName);
      // values.push(SP_ID);


      // Ensure db.executeQuery returns a promise
      result = await db.excuteQuery(query, [values, identifierValue, SP_ID]);


    }
    return result;
    // Ensure to handle the returned result outside the loop if needed
  } catch (err) {
    return err;
  }

}


async function updateSelectedField(CSVdata, identifier, fields, SP_ID) {
  try {
    // Iterate over each field in the 'fields' array
    for (var j = 0; j < fields.length; j++) {
      const updateData = fields[j];

      // Iterate over each set of CSV data
      for (var i = 0; i < CSVdata.length; i++) {
        const set = CSVdata[i];

        // Find identifier value and updated field value
        const identifierField = set.find((field) => field.ActuallName === identifier);
        const identifierValue = identifierField ? identifierField.displayName : '';
        const updatedField = set.find((field) => field.ActuallName === updateData);
        const updatedFieldValue = updatedField ? updatedField.displayName : '';

        // Construct the update query
        let query = 'UPDATE EndCustomer SET ' + updateData + '=? WHERE ' + identifier + '=? AND SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0)';


        // Execute the update query
        var upExistContOnlyWithFields = await db.excuteQuery(query, [updatedFieldValue, identifierValue, SP_ID]);
        //console.log(upExistContOnlyWithFields);
      }
    }
    return upExistContOnlyWithFields;
  } catch (err) {
    return err;
  }
}


async function updateContact(CSVdata, identifier, SP_ID) {
  try {
    for (var i = 0; i < CSVdata.length; i++) {
      const set = CSVdata[i];

      // Find the identifier field
      const identifierField = set.find((field) => field.ActuallName === identifier);
      const identifierValue = identifierField ? identifierField.displayName : '';

      // Build the SET clause for the UPDATE query
      const setClause = set.map((field) => `${field.ActuallName} = ?`).join(', ');

      // Build the UPDATE query
      let query = `UPDATE EndCustomer SET ${setClause} WHERE ${identifier} = ? AND SP_ID = ? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0);`;
      // console.log(query);

      // Add values for placeholders in the correct order
      const values = set.map((field) => field.displayName); // Using displayName as FieldValue
      values.push(identifierValue);
      values.push(SP_ID);

      var upExistContOnly = await db.excuteQuery(query, values);
      // console.log(upExistContOnly);
    }
    return upExistContOnly;
  } catch (err) {
    return err;
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
    let userList = await getUserList(SP_ID)
    let multiSelectValues = await getMultiSelectValues(SP_ID)


    for (let j = 0; j < importedData.length; j++) {
      const currentData = importedData[j];
      let phone;
      let reasons = [];
      for (let i = 0; i < currentData.length; i++) {
        const { ActuallName, displayName } = currentData[i];
        if (allColumnsData.get(ActuallName) != undefined) {
          let dataTypeVerification = await isDataInCorrectFormat(allColumnsData.get(ActuallName), ActuallName, displayName, userList, multiSelectValues);

          if (dataTypeVerification?.isError) {
            reasons.push(dataTypeVerification.reason);
          }

        }
        if (ActuallName === 'Phone_number') {
          phone = displayName;
        }
      }

      if (reasons.length == 0) {
        if (seenPhoneNumbers.has(phone)) {
          console.log("seerm", phone)
          reasons.push("Duplicate phone number")
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


        // Extract Phone_number values from importData
        const resultPhoneNumbers = result.map(obj => obj.Phone_number);

        // Filter out result based on Phone_number
        const filteredResult = importData.filter(arr =>
          resultPhoneNumbers.includes(arr.find(item => item.ActuallName === 'Phone_number').displayName)
        );

        if (newCon == 0 || (importData.length > newCon)) {
          for (let j = 0; j < filteredResult.length; j++) {
            const currentData = filteredResult[j];
            errData.push({ data: currentData, reason: "This contact already exist" });
          }
        }
      } else if (purpose === 'Update Existing Contacts Only') {
        upCont = result.length;

        // Extract Phone_number values from importData
        const resultPhoneNumbers = result.map(obj => obj.Phone_number);

        // Filter out result based on Phone_number
        const filteredResult = importData.filter(arr =>
          !resultPhoneNumbers.includes(arr.find(item => item.ActuallName === 'Phone_number').displayName)
        );

        if (upCont == 0 || (importData.length > upCont)) {
          for (let j = 0; j < filteredResult.length; j++) {
            const currentData = filteredResult[j];
            errData.push({ data: currentData, reason: "This contact not already exist" });
          }

        }
      } else if (purpose === 'Add and Update Contacts') {
        newCon = newContacts;
        upCont = result.length;

        console.log("add and updatew", newContacts, upCont)
      }


      let skipedContact = await writeErrFile(errData, res)
      res.status(200).send({
        newCon: newCon,
        upCont: upCont,
        skipCont: skipedContact?.length,
        importData: importData
      });
    } else {
      let skipedContact = await writeErrFile(errData, res)
      res.status(200).send({
        newCon: 0,
        upCont: 0,
        skipCont: skipedContact?.length,
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

async function writeErrFile(errData, res) {
  try {
    if (errData.length !== 0) {
      let maxReasonCount = 0;
      const formattedErrData = errData.map(error => {
        const formattedEntry = {};
        error.data.forEach(entry => {
          formattedEntry[`${entry.ActuallName}`] = entry.displayName;
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
        fields.push(entry.ActuallName);
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


async function isDataInCorrectFormat(columnDataType, ActuallName, displayName, userList, multiSelectValues) {
  try {
    if (!columnDataType) return { isError: false, reason: `${ActuallName} Unknown column data type` };
    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const phoneFormat = /^[0-9]{6,15}$/;
    // Convert display name to appropriate data type
    let convertedValue;
    switch (columnDataType) {
      case 'Number':
        if (ActuallName === 'Phone_number' && !displayName.match(phoneFormat)) {

          return { isError: true, reason: `${ActuallName} is not a valid` };

        } else {
          if (!/^\d+$/.test(displayName)) {
            return { isError: true, reason: `${ActuallName} is not a valid number` };
          }
          convertedValue = parseInt(displayName);
        }
        break;

      case 'Text':
        if (ActuallName === 'emailId') {
          if (displayName && !displayName.match(emailFormat)) {
            return { isError: true, reason: `${ActuallName} is not a valid email address` };
          } else {
            convertedValue = displayName ? displayName.toString() : '';
          }
        } else {
          if (ActuallName === 'Name' && displayName && !/^[a-zA-Z ]*$/.test(displayName)) {
            return { isError: true, reason: `${ActuallName} contains non-alphabetic characters` };
          } else {
            convertedValue = displayName ? displayName.toString() : '';
          }
        }

        break;
      case 'User':
        if (displayName) {
          convertedValue = userList.includes(displayName);
          console.log("convertedValue" ,convertedValue)
          return { isError: !convertedValue, reason: `${ActuallName} is invalid contact owner` };
        }
        break;
      case 'Select':
        if (displayName) {
          convertedValue = multiSelectValues.includes(displayName);
          return { isError: !convertedValue, reason: `${ActuallName} is not exist in list` };
        }
        break;
      case 'DateTime':
        if (displayName) {
          convertedValue = !isNaN(date.getTime());
          return { isError: !convertedValue, reason: `${ActuallName} is invalid` };
        }
        break;
      case 'Switch':
        if (displayName) {
          convertedValue = ['yes', 'no'].includes(displayName.toLowerCase()) ? displayName.toLowerCase() : false;
          if (!convertedValue) {
            return { isError: true, reason: `${ActuallName} is not a valid switch value` };
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
        return { isError: isNaN(convertedValue), reason: !isNaN(convertedValue) ? "" : `${ActuallName} is not a valid number` };
      case 'Text':
        return { isError: typeof convertedValue != 'string', reason: typeof convertedValue === 'string' ? "" : `${ActuallName} is not a valid text` };
      case 'Switch':
        return { isError: typeof convertedValue != 'string', reason: typeof convertedValue === 'string' ? "" : `${ActuallName}  is not a valid switch` };
      default:
        return { isError: false, reason: `${ActuallName} Unknown column data type` };
    }
  } catch (error) {
    console.error("Error in isDataInCorrectFormat:", error);
    return { isError: true, reason: error.message };
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

app.listen(3002);

