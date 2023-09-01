var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const awsHelper=require('../awsHelper')
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const addCampaignTimings = async (req, res) => {
    try {
        console.log(req.body)
        sp_id = req.body.sp_id
        days = req.body.days
        // start_time = req.body.start_time
        // end_time = req.body.end_time
        created_at = new Date();
        //const values = CampaignTimingID.map(CTids => [sp_id, CTids, start_time, end_time, created_at]);
        //let result= await db.excuteQuery(val.addCampaignTimingsQuery,[values])


        let deleteCampaignTimings = await db.excuteQuery(val.deleteCampaignTimingsQuery, [created_at, sp_id])

        console.log(deleteCampaignTimings)
        console.log("deleteCampaignTimings")

        days.forEach(async (item) => {

            item.day.forEach(async (ele) => {
                const values = [sp_id, ele, item.start_time, item.end_time, created_at];
                result = await db.excuteQuery(val.addCampaignTimingsQuery, [[values]])
            })

        })

        res.status(200).send({
            msg: "added successfully",
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const updateCampaignTimings = async (req, res) => {
    sp_id = req.body.sp_id
    CampaignTimingID = req.body.CampaignTimingID
    start_time = req.body.start_time
    end_time = req.body.end_time
    updated_at = new Date();
    const values = CampaignTimingID.map(CTids => [sp_id, CTids, start_time, end_time, updated_at, updated_at]);
    let deleteCampaignTimings = await db.excuteQuery(val.deleteCampaignTimingsQuery, [updated_at, sp_id])
    console.log(deleteCampaignTimings)
    let updatedCampaignTimings = await db.excuteQuery(val.updateCampaignTimingsQuery, [values])
    res.status(200).send({
        updatedCampaignTimings: updatedCampaignTimings,
        status: 200
    })
}

const selectCampaignTimings = async (req, res) => {
    try {
        let seletedCampaignTimings = await db.excuteQuery(val.selectCampaignTimingsQuery, [req.params.sid])
        res.status(200).send({
            seletedCampaignTimings: seletedCampaignTimings,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getUserList = async (req, res) => {
    try {
        let userlist = await db.excuteQuery(val.campaignAlertUsersList, [req.params.sid])
        res.status(200).send({
            userlist: userlist,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const addAndUpdateCampaign = async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        uid = req.body.uid
        created_at = new Date();
        let deletexisting = await db.excuteQuery(val.deleteCampaignAlerts, [created_at, SP_ID])

        uid.forEach(async (item) => {
            let camValues = [[SP_ID, item, created_at]]
            let addCampaignAlerts = await db.excuteQuery(val.addCampaignAlerts, [camValues])
        })

        res.status(200).send({
            msg: "addCampaignAlerts",
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const selectCampaignAlerts = async (req, res) => {
    try {
        let getCampaignAlerts = await db.excuteQuery(val.selectCampaignAlerts, [req.params.sid])
        res.status(200).send({
            getCampaignAlerts: getCampaignAlerts,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const addCampaignTest = async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        uid = req.body.uid
        created_at = new Date();
        let deletexisting = await db.excuteQuery(val.deleteCampaignTest, [created_at, SP_ID])

        uid.forEach(async (item) => {
            let camValues = [[SP_ID, item, created_at]]
            let addCampaignTest = await db.excuteQuery(val.addCampaignTest, [camValues])
        })

        res.status(200).send({
            msg: "addCampaignTests",
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const selectCampaignTest = async (req, res) => {
    try {
        let getCampaignTest = await db.excuteQuery(val.selectCampaignTest, [req.params.sid])
        res.status(200).send({
            getCampaignTest: getCampaignTest,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


//______________________________________CONTACT SETTINGS____________________________________//

const addTag = async (req, res) => {
    try {
        console.log(req.body)
        ID = req.body.ID
        SP_ID = req.body.SP_ID
        TagName = req.body.TagName
        TagColour = req.body.TagColour
        created_at = new Date();
        if (ID != '0') {
            let updatedTad = await db.excuteQuery(val.updatetag, [TagName, TagColour, created_at, ID]);
            console.log(updatedTad)
            res.status(200).send({
                msg: 'tag Updated',
                status: 200
            })
        }
        else {
            let addValue = [[TagName, TagColour, SP_ID, created_at]];
            let addedTag = await db.excuteQuery(val.addtag, [addValue]);
            console.log(addedTag)
            res.status(200).send({
                msg: 'tag added',
                status: 200
            })

        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const gettags = async (req, res) => {
    try {
        let taglist = await db.excuteQuery(val.selecttag, [req.params.spid])
        res.status(200).send({
            taglist: taglist,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const deleteTag = async (req, res) => {
    try {
        const updated_at = new Date();
        let tagDelete = await db.excuteQuery(val.deletetag, [updated_at, req.body.ID])
        res.status(200).send({
            tagDelete: tagDelete,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}



//_____________________________ TEMPLATE SETTINGS _________________________________//


const addTemplate = async (req, res) => {
    try {
        ID = req.body.ID
        TemplateName = req.body.TemplateName,
            Channel = req.body.Channel,
            Category = req.body.Category,
            Language = req.body.Language,
            media_type = req.body.media_type,
            Header = req.body.Header,
            BodyText = req.body.BodyText,
            Links = req.body.Links,
            FooterText = req.body.FooterText,
            template_json = req.body.template_json,
            status = req.body.status,
            spid = req.body.spid,
            created_By = req.body.created_By,
            created_at = new Date()
            isTemplate=req.body.isTemplate

        let awsres = await awsHelper.uploadStreamToAws(spid +"/"+ created_By + '/template_img.jpg', Links)

        console.log(awsres.value.Location)
        if (ID == 0) {
            let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, awsres.value.Location, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at,isTemplate]]
            let addedtem = await db.excuteQuery(val.addTemplates, [temValues])
            res.status(200).send({
                addedtem: addedtem,
                status: 200
            })
        }
        else {
            let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, awsres.value.Location, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at,isTemplate, ID]
            let updatedTemplate = await db.excuteQuery(val.updateTemplate, updatedTemplateValues)
            res.status(200).send({
                updatedTemplate: updatedTemplate,
                status: 200
            })
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getTemplate = async (req, res) => {
    try {
        let templates = await db.excuteQuery(val.selectTemplate, [req.params.spid,req.params.isTemplate])
        res.status(200).send({
            templates: templates,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const deleteTemplates = async (req, res) => {
    try {
        updated_at = new Date();
        ID = req.body.ID;
        let deleteVal = await db.excuteQuery(val.deleteTemplate, [updated_at, ID]);
        res.status(200).send({
            deleteVal: deleteVal,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

module.exports = {
    addCampaignTimings, updateCampaignTimings, selectCampaignTimings, getUserList, addAndUpdateCampaign,
    selectCampaignAlerts, addCampaignTest, selectCampaignTest, addTag, gettags, deleteTag, addTemplate, getTemplate, deleteTemplates
}