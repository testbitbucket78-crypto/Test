var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('../Authentication/constant.js');
const bodyParser = require('body-parser');
const { Parser } = require('json2csv');
const cors = require('cors');
const fs = require("fs");
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {

  db.runQuery(req, res, val.sql1, [req.body.id]);
});



app.post('/contact', function (req, res) {
  Name = req.body.Name
  Phone_number = req.body.Phone_number
  emailId = req.body.emailId
  age = req.body.age
  var tag = req.body.tag
  var status = req.body.status
  facebookId = req.body.facebookId
  InstagramId = req.body.InstagramId
  var tagList = tag.join();
  var statusList = status.join();

  var values = [[Name, Phone_number, emailId, age, tagList, statusList, facebookId, InstagramId]];

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

var responceData = "";
app.post('/exportCheckedContact', (req, res) => {

  var data = req.body
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
})

app.get('/getContactById', (req, res) => {
  db.runQuery(req, res, val.selectbyid, [req.query.customerId])
})

app.put('/editContact', (req, res) => {
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
})

app.get('/items', (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  // Calculate the starting index of the items to return
  const startIndex = (page - 1) * limit;

  // Calculate the ending index of the items to return
  const endIndex = page * limit;
  db.db.query('select *from EndCustomer', function (error, results, fields) {
    if (error) {
      console.log(error)
    } else {
      var itemList = results
      console.log(results)
      // Slice the items array to return only the items for the requested page
      const items = itemList.slice(startIndex, endIndex);

      // Create an object with the paginated items and the total number of items
      const result = {
        items: items,
        totalItems: itemList.length
      };

      // Return the paginated items as a JSON response
      res.json(result);
    }
  })
  // Slice the items array to return only the items for the requested page
  const items = itemList.slice(startIndex, endIndex);

  // Create an object with the paginated items and the total number of items
  const result = {
    items: items,
    totalItems: itemList.length
  };

  // Return the paginated items as a JSON response
  res.json(result);
});

app.post('/updateAndSave', (req, res) => {
  var result = req.body;
  var fields = result.field
  var data = result.data
  var identifier = result.identifier
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
  console.log("verifyData")
  console.log(req.body)
  values = [];

  for (var i = 0; i < result.length; i++) {
    values[i] = (JSON.parse(JSON.stringify(result[i].emailId)))
  }
  var queryData = [values];

  db.db.query(val.verfiyCount, queryData, (err, result) => {
    if (err) {
      console.log(err);
    }
    else {

      res.status(200).send({

        count: result.length
      });
    }
  })


})



app.get('/download', (req, res) => {
  var file = val.Path
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
//module.exports = { updateData, identifierData }
app.listen(3002);

