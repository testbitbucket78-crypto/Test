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
  try {
    // Construct the INSERT query dynamically
    let data = req.body.result
    console.log(data)
  
    // Iterate through the data array and add column names to the query
    
      let insertQuery = 'INSERT INTO EndCustomer (';
      let values = [];
  
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
    let result = await db.excuteQuery(insertQuery, values)
  
  res.send({ status: 200, result: 'result' });
}catch (err) {
  console.log(err)
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

        let addNewUserOnly = await addOnlynewContact(CSVdata, identifier)

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

async function addOnlynewContact(CSVdata, identifier) {
  
  try {
    let result;
    for (let i = 0; i < CSVdata.length; i++) {
      const set = CSVdata[i];
      const fieldNames = set.map((field) => field.ActuallName).join(', ');
  
      // Find the value of the identifier based on the FieldName
      const identifierField = set.find((field) => field.ActuallName === identifier);
      const identifierValue = identifierField ? identifierField.displayName : '';
  
      let query = `INSERT INTO EndCustomer (${fieldNames}) SELECT ? WHERE NOT EXISTS (SELECT * FROM EndCustomer WHERE ${identifier}=?  AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0));`;
      const values = set.map((field) => field.displayName);
      // values.push(SP_ID);
  
      console.log(query);
      console.log(values);
  
      // Ensure db.executeQuery returns a promise
       result = await db.excuteQuery(query, [values, identifierValue]);
     
     
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
    for (var i = 0; i < CSVdata.length; i++) {
      const set = CSVdata[i];
  
      // Find the identifier field
      const identifierField = set.find((field) => field.ActuallName === identifier);
      const identifierValue = identifierField ? identifierField.displayName : '';
  
      // Build the SET clause for the UPDATE query
      const setClause = set.map((field) => `${field.ActuallName} = ?`).join(', ');
  
      // Build the UPDATE query
      let query = `UPDATE EndCustomer SET ${setClause} WHERE ${identifier} = ? AND SP_ID = ? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked = 0);`;
      console.log(query);
  
      // Add values for placeholders in the correct order
      const values = set.map((field) => field.displayName); // Using displayName as FieldValue
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


app.post('/verifyData', async (req, res) => {
  try {
    
    var resdata = req.body;
    var CSVdata = resdata.importedData;
    var identifier = resdata.identifier;
    var purpose = resdata.purpose;
    var SP_ID = resdata.SP_ID;

    var identity = identifier;

    errData = [];
    importData = [];
    queryData = [];

    console.log(CSVdata.length);

    for (var j = 0; j < CSVdata.length; j++) {
        var currentData = CSVdata[j];

        var email, phone; // Initialize email and phone variables here

        for (let i = 0; i < currentData.length; i++) {
            var currentEntry = currentData[i];
            console.log(currentEntry, i);

            if (currentEntry.ActuallName === 'emailId') {
                email = currentEntry.displayName; // Assign to email variable
            }
            if (currentEntry.ActuallName === 'Phone_number') {
                phone = currentEntry.displayName; // Assign to phone variable
            }
        }

        var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        var phoneno = /^[0-9]{6,15}$/;


        if ((!email || !email.match(emailFormat)) || (!phone || !phone.match(phoneno))) {
            errData.push(currentData);
        } else {
            queryData.push(currentData.find(entry => entry.ActuallName === identifier).displayName);
            importData.push(currentData);
        }
    }

    if (errData.length !== 0) {
    
        // Restructure errData to have ActuallName as header
        var formattedErrData = errData.map(data => {
            var formattedEntry = {};
            data.forEach(entry => {
                formattedEntry[entry.ActuallName] = entry.displayName;
            });
            return formattedEntry;
        });
    
        // Write error data to CSV file
        const json2csvParser = new Parser({ fields: Object.keys(formattedErrData[0]) });
        const csv = json2csvParser.parse(formattedErrData);
        fs.writeFile("CSVerr.csv", csv, function (err) {
            if (err) {
                res.send(err);
            }
            console.log('File Saved');
        });
        res.attachment("CSVerr.csv");
    
    
    }

    if (importData.length > 0) {
        // Execute query and handle purpose
        var verifyQuery = 'SELECT * FROM EndCustomer WHERE ' + identity + ' IN (?) AND SP_ID=? AND (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)';
        var result = await db.excuteQuery(verifyQuery, [queryData, SP_ID]);
     

        try {
            if (purpose === 'Add new contact only') {
                res.status(200).send({
                    newCon: Math.abs(importData.length - result.length),
                    upCont: 0,
                    skipCont: errData.length,
                    importData: importData
                });
            } else if (purpose === 'Update Existing Contacts Only') {
                res.status(200).send({
                    newCon: 0,
                    upCont: result.length,
                    skipCont: errData.length,
                    importData: importData
                });
            } else if (purpose === 'Add and Update Contacts') {
                res.status(200).send({
                    newCon: Math.abs(importData.length - result.length),
                    upCont: result.length,
                    skipCont: errData.length,
                    importData: importData
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
    } else {
        // Send response with no new contacts
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


app.post('/addflow', async (req, res) => {
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

