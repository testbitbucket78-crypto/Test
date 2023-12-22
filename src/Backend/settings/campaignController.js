var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const awsHelper = require('../awsHelper');
const middleWare = require('../middleWare')
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));

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
            let addValue = [[TagName, TagColour, SP_ID, created_at,created_at]];
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
        let taglist = await db.excuteQuery(val.selecttag, [req.params.spid,req.params.spid])
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

const addCustomField = async (req, res) => {
    try {
        ColumnName = req.body.ColumnName,
            SP_ID = req.body.SP_ID,
            Type = req.body.Type,
            description = req.body.description,
            created_at = new Date();


        let count = await db.excuteQuery(val.getColCount, [SP_ID]);

        CustomColumn = "column" + (count[0].columnCount + 1);
        let values = [CustomColumn, ColumnName, SP_ID, Type, description, created_at, created_at]

        let addfiled = await db.excuteQuery(val.addcolumn, [[values]]);

        res.send({
            status: 200,
            addfiled: addfiled
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const editCustomField = async (req, res) => {
    try {
        ColumnName = req.body.ColumnName,
            Type = req.body.Type,
            description = req.body.description,
            updated_at = new Date()
        id = req.body.id
        let editedField = await db.excuteQuery(val.editfield, [ColumnName, Type, description, updated_at, id])
        res.send({
            status: 200,
            editedField: editedField
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const enableMandatoryfield = async (req, res) => {
    try {
        let mandatoryfield = await db.excuteQuery(val.enableMandatory, [req.body.Mandatory, new Date(), req.body.id])
        res.send({
            status: 200,
            mandatoryfield: mandatoryfield
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const enableStatusfield = async (req, res) => {
    try {

        let enableStatus = await db.excuteQuery(val.enablestatus, [req.body.Status, new Date(), req.body.id])
        res.send({
            status: 200,
            enableStatus: enableStatus
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}
const getCustomField = async (req, res) => {
    try {
        let getfields = await db.excuteQuery(val.getcolumn, [req.params.spid]);
        res.send({
            status: 200,
            getfields: getfields
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getCustomFieldById = async (req, res) => {
    try {
        let getfields = await db.excuteQuery(val.getcolumnid, [req.params.id]);
        res.send({
            status: 200,
            getfields: getfields
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const deleteCustomField = async (req, res) => {
    try {
        let deletField = await db.excuteQuery(val.deletecolumn, [new Date(), req.params.id]);
        res.send({
            status: 200,
            deletField: deletField
        })
    } catch (err) {
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
            category_id=req.body.category_id
            created_at = new Date()
        isTemplate = req.body.isTemplate
        industry = req.body.industry

        let image = ""
        image=Links
        if (Links != null && Links != undefined && Links != "" && Links != " " && media_type =='image') {
            // Remove header
            let streamSplit = Links.split(';base64,');
            let base64Image = streamSplit.pop();//With the change done in aws helper this is not required though keeping it in case required later.
            let datapart = streamSplit.pop();// this is dependent on the POP above

            let imgType = datapart.split('/').pop();
            let imageName = 'template_img.png';//Default it to png.
            if (imgType) {
                imageName = 'template_img' + '.' + imgType;
            }
            const timestamp = Date.now();
            const randomNumber = Math.floor(Math.random() * 10000);
            let awsres = await awsHelper.uploadStreamToAws(spid + "/" + timestamp + "_" + randomNumber + "/" + created_By + "/" + imageName, Links)

            image = awsres.value.Location
           console.log(awsres.value.Location)
        }
        if (ID == 0) {
            let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry,category_id]]
            let addedtem = await db.excuteQuery(val.addTemplates, [temValues])
            res.status(200).send({
                addedtem: addedtem,
                status: 200
            })
        }
        else {
            let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry,category_id, ID]
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
        let templates = await db.excuteQuery(val.selectTemplate, [req.params.spid, req.params.isTemplate])
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

const testCampaign = async (req, res) => {
    try {

        console.log("sendCampinMessage")
        var TemplateData = req.body
        console.log(TemplateData)
        let messageData = '';
        var messageTo = TemplateData.phone_number
        var messateText = TemplateData.message_content
        let content = messateText;
        let channel = TemplateData.channel_label
        console.log("channel");
        console.log(channel)
        console.log("content")
        console.log(content)
        // content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
        // content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
        // content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
        // content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
        // content = content.replace('&nbsp;', '\n')
        // content = content.replace(/<br[^>]*>/g, '\n')
        // content = content.replace(/<\/?[^>]+(>|$)/g, "")
        let testNo = await db.excuteQuery(val.selectCampaignTest, [TemplateData.sp_id])
        for (let phone_number of testNo) {
            middleWare.channelssetUp(channel, 'text', phone_number.mobile_number, content)
        }


    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}




module.exports = {
    addCampaignTimings, updateCampaignTimings, selectCampaignTimings, getUserList, addAndUpdateCampaign,
    selectCampaignAlerts, addCampaignTest, selectCampaignTest, addTag, gettags, deleteTag, addTemplate, getTemplate, deleteTemplates,
    testCampaign, addCustomField, editCustomField, getCustomField, deleteCustomField, getCustomFieldById, enableMandatoryfield,
    enableStatusfield

}