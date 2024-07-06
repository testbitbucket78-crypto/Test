var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


const getGallery = async (req, res) => {
    try {
      
        let Gallery = await db.excuteQuery(val.getGalleryQuery, [])
        res.send({
            msg: Gallery,
            status: 200
        })
    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }
}


module.exports = { getGallery }