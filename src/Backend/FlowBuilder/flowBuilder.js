var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors');
const { type } = require("os");
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

const addBot = async (req, res) => {
    try {       
    //    let myUTCString = new Date().toUTCString();
    //     const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');     
      const values = [
        req.spid,
        req.name,
        req.description,
        req.channel_id,
        req.status,
        req.timeout_value,
        req.timeout_message,
        req.created_by,
        advanceAction
      ];
        let bot = await db.excuteQuery(val.insertBot, [[values]])
        res.send({
            msg: bot,
            status: 200
        })
    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }
}


const submitBots = async (req, res) => {
    try {       
       let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');    
    let nodes = req.nodes; 
    let nodeJson = req.node_FE_Json;
    let published_at = req.status =='publish' ? created_at :null;
    let bot = await db.excuteQuery(val.insertBot, [req.status, nodeJson, published_at, req.botId]); // Update bot status and node_FE_Json

      nodes.forEach((node) => {

        node.spid = req.spid;
        let Node =[
            req.botId,
             node.type,
             node.message,
             node.node_Json,
             node.tempNodeId,
             node.previous_Node_Id,
        ]
         node =  db.excuteQuery(val.insertNode, [[Node]])
      })
        res.send({
            msg: bot,
            status: 200
        })
    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }
}


// const addNode = async (req, res) => {
//     try {       
//     //    let myUTCString = new Date().toUTCString();
//     //     const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       const values = [
//         req.spid,
//         req.name,
//         req.description,
//         req.channel_id,
//         req.status,
//         req.timeout_value,
//         req.timeout_message,
//         req.created_by
//       ];
//         let bot = await db.excuteQuery(val.insertBot, [[values]])
//         res.send({
//             msg: bot,
//             status: 200
//         })
//     } catch (err) {
//         res.send({
//             err: err,
//             status: 500
//         })
//     }
// }


const checkExistingBot = async (req, res) => {
    try {

        let selectBot = await db.excuteQuery(val.isBotExist, [req.params.spid, req.params.name]);
        if (selectBot?.length == 0) {

            res.send({
                "status": 200,
                "message": "Bot ready to add",
            })
        } else {
            res.send({
                "status": 409,
                "message": "Bot Name already exist"
            })
        }
    } catch (err) {
        res.send({
            "status": 500,
            "message": err
        })
    }
}


const getAllBots = async (req, res) => {
    try {
        console.log(req.query); 
        let bots = await db.excuteQuery(val.getAllBots,[req.query.spid])
        res.status(200).send({
            bots: bots,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


const getBotDetailById = async (req, res) => {
    try {
        let bot = await db.excuteQuery(val.getBotById, [req.params.spid, req.params.botId])
        if( bot?.length == 0) {
            return res.status(404).send({
                message: "Bot not found",
                status: 409
            });
        } else{
        let nodeList = await db.excuteQuery(val.getBotDetailById, [req.params.spid, req.params.botId]);
        bot[0]['nodes'] = nodeList; 
        res.status(200).send({
            bots: bot,
            status: 200
        })
        }
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


const deleteBotbyId = async (req, res) => {
    try {
        let botRunning = await db.excuteQuery(val.isBotRunning, [req.params.spid, req.params.botId]);
        if (botRunning?.length == 0) {
            let deleteBot = await db.excuteQuery(val.deleteBot, [req.params.botId]);
            res.send({
                "status": 200,
                "message": "Bot is deleted successfully",
            })
        } else {
            let deprecateBot = await db.excuteQuery(val.deprecateBot, [req.params.botId]);
            res.send({
                "status": 200,
                "message": "Bot is running, so it is deprecated",
            })
        }
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


module.exports = { getGallery , addBot,  checkExistingBot, getAllBots, getBotDetailById, deleteBotbyId, submitBots };