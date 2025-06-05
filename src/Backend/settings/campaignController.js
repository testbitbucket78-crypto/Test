var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const awsHelper = require('../awsHelper');
const middleWare = require('../middleWare')
const removeTags = require('../removeTagsFromRichTextEditor')
const moment = require('moment');
const { Parser } = require('json2csv');
const nodemailer = require('nodemailer');
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));
const logger = require('../common/logger.log');
let fs = require('fs-extra');
const path = require("path");
const FormData = require('form-data');
const { channelForSendingMessage, channelsForTemplates } = require("../enum")

const XLSX = require('xlsx');
const { EmailConfigurations } =  require('../Authentication/constant');
const { MessagingName }= require('../enum');
const commonFun = require('../common/resuableFunctions.js')
const addCampaignTimings = async (req, res) => {
    try {
        console.log(req.body)
        sp_id = req.body.sp_id
        days = req.body.days
        // start_time = req.body.start_time
        // end_time = req.body.end_time

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
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

    let myUTCString = new Date().toUTCString();
    const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
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

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

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

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
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

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        if (ID != '0') {
            let updatedTad = await db.excuteQuery(val.updatetag, [TagName, TagColour, created_at, ID]);
            console.log(updatedTad)
            res.status(200).send({
                msg: 'tag Updated',
                status: 200
            })
        }
        else {
            let selectTag = await db.excuteQuery('Select * from EndCustomerTagMaster where SP_ID=? and TagName=?', [SP_ID, TagName])
            if (selectTag?.length == 0) {
                const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                let addValue = [[TagName, TagColour, SP_ID, created_at,updated_at]];
                let addedTag = await db.excuteQuery(val.addtag, [addValue]);
                console.log(addedTag)
                res.status(200).send({
                    msg: 'tag added',
                    status: 200
                })
            } else {
                res.status(409).send({
                    msg: 'Tag name already exist',
                    status: 409
                })
            }

        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const gettags = async (req, res) => {
    try {
        let taglist = await db.excuteQuery(val.selecttag, [req.params.spid, req.params.spid])
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


        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
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
        const ColumnName = req.body.ColumnName;
        const SP_ID = req.body.SP_ID;
        const Type = req.body.Type;
        const description = req.body.description;

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let values = (req.body.values);



        // Check if the ColumnName already exists for the given SP_ID
        const checkExistenceQuery = `SELECT * FROM SPIDCustomContactFields WHERE SP_ID=? AND ColumnName=? AND isDeleted!=1`;
        const countResult = await db.excuteQuery(checkExistenceQuery, [SP_ID, ColumnName]);



        // If the count is greater than 0, it means the ColumnName already exists
        if (countResult?.length > 0) {
            res.status(409).send({
                status: 409,
                message: 'Column already exists for the given SP_ID'
            });

        } else {


         /*   // Fetch all data for the given SP_ID
            const allData = await db.excuteQuery(val.getColCount, [SP_ID]);


            // Generate the custom column name
            const CustomColumn = "column" + (allData[0].columnCount + 1);

            // Prepare values for insertion
            const insertionValues = [CustomColumn, ColumnName, SP_ID, Type, description, created_at,updated_at, JSON.stringify(values)]; */

            // Insert the new custom field
            const addFieldResult =await insertCustomField(SP_ID, ColumnName, Type, description, created_at, updated_at, values)  //await db.excuteQuery(val.addcolumn, [[insertionValues]]);
           // console.log("addFieldResult", addFieldResult)
            // Return 500 if insertion failed
            if (!addFieldResult.insertId) {
                res.status(500).send({
                    status: 500,
                    message: addFieldResult
                });
                return;
            } else {
                // Check if the Type is 'select', format the values accordingly and update id with addfiled inserted id
                if (Type === 'Select' || Type === 'Multi Select') {
                    values = values.map(option => ({
                        id: addFieldResult.insertId + '_' + option.id,
                        optionName: option.optionName
                    }));
                    let updateRes = await db.excuteQuery('UPDATE  SPIDCustomContactFields SET dataTypeValues=? WHERE id =?', [JSON.stringify(values), addFieldResult.insertId])
                }
                console.log("efdgfd", addFieldResult)
                // Return success response
                res.status(200).send({
                    status: 200,
                    addfiled: addFieldResult
                });
            }
        }

    } catch (err) {
        console.log(err);
        db.errlog(err);
        res.status(500).send(err);
    }
};


async function insertCustomField(SP_ID, ColumnName, Type, description, created_at, updated_at, values) {
    // Check for soft-deleted columns
    const deletedColumn = await db.excuteQuery(val.checkDeletedColumn, [SP_ID]);

    let CustomColumn;
    
    if (deletedColumn.length > 0) {
        // Reuse the soft-deleted column
        CustomColumn = deletedColumn[0].CustomColumn;

        // Ensure that all previous instances of this column are permanently deleted or marked as active
        await db.excuteQuery(val.permanentDeleteColumn, [SP_ID, CustomColumn]);
    } else {
        // Fetch all active data for the given SP_ID
        const allData = await db.excuteQuery(val.getColCount, [SP_ID]);

        // Generate a new custom column name (ensure it's within the limit)
        if (allData[0].columnCount < 25) {
            CustomColumn = "column" + (allData[0].columnCount + 1);
        } else {
           return "Maximum column limit reached. Reuse or delete existing columns";
        }
    }

    // Prepare values for insertion
    const insertionValues = [CustomColumn, ColumnName, SP_ID, Type, description, created_at, updated_at, JSON.stringify(values)];

    // Insert the new custom field
    const addFieldResult = await db.excuteQuery(val.addcolumn, [[insertionValues]]);

    return addFieldResult;
}

const editCustomField = async (req, res) => {
    try {
        ColumnName = req.body.ColumnName;
        Type = req.body.Type;
        description = req.body.description;
        let values = req.body.values;
        id = req.body.id
        values = values.map(option => ({
            id: id + '_' + option.id,
            optionName: option.optionName
        }));
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');


        let editedField = await db.excuteQuery(val.editfield, [ColumnName, Type, description, updated_at, JSON.stringify(values), id])
        console.log(ColumnName, Type, description, updated_at, id, editedField)
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
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let mandatoryfield = await db.excuteQuery(val.enableMandatory, [req.body.Mandatory, created_at, req.body.id])
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
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let enableStatus = await db.excuteQuery(val.enablestatus, [req.body.Status, created_at, req.body.id])
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

        getfields.forEach((record) => {
            if (record.created) {
                const createdDate = new Date(record.created); 
                record.created = createdDate 
            }
    
            if (record.updated) {
                const updatedDate = new Date(record.updated);
                record.updated = updatedDate
            }
        });

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
                default:
                    // No changes required for other ActuallName values
                    break;
            }
            return field; // Return the updated field object
        });

        res.send({
            status: 200,
            getfields: updatedFields
        });
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
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

        let getColumnName = await db.excuteQuery(val.getCustomColumnById,[req.params.id,req.params.spid]); //

        let blankCustomFieldQuery = `UPDATE EndCustomer SET ${getColumnName[0]?.CustomColumn} =? WHERE SP_ID=? AND customerId >=1`;
        console.log(blankCustomFieldQuery,"blankCustomFieldQuery",getColumnName[0]?.CustomColumn)
        let updateEndCustomer = await db.excuteQuery(blankCustomFieldQuery,[null,req.params.spid])

        let deletField = await db.excuteQuery(val.deletecolumn, [created_at, req.params.id]);
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

async function getWAdetails(spid) {
    try {
        let details = await db.excuteQuery('select * from WA_API_Details where spid=? and isDeleted !=1', [spid]);
        if (details?.length == 1) {
            return details;
        }
        return 'not exist';
    } catch (err) {
        return 'not exist';
    }
}

async function Createtemplate(messageData,spid) {
    try {
        let WAdetails = await getWAdetails(spid);
        if(WAdetails != 'not exist'){
        // Convert array to object
        const dataObject = messageData[0];
        // // Find the BODY component
        const bodyComponent = dataObject.components.find(component => component.type === 'BODY');

        // // Check if BODY component exists and then update its text
        if (bodyComponent) {
            console.log("bodyComponent")
            bodyComponent.text = await removeTags.removeTagsFromMessages(bodyComponent.text);
        }


        console.log("Yes json", JSON.stringify(messageData))
        const response = await axios({
            method: "POST",
            url: `https://graph.facebook.com/v20.0/${WAdetails[0].waba_id}/message_templates?access_token`,
            data: dataObject, // Use the video message structure
            "headers": {
                "Authorization": 'Bearer ' +WAdetails[0].token,
                "Content-Type": "application/json",
            }
        })
        console.log("response", response.data)

        return response.data;
    }else{
     return 'channel not found'
    }
    } catch (err) {
        logger.error('add template :', err.response ? err.response.data : err.message);
        console.log("error", err.response ? err.response.data : err.message);
        return err.message;
    }
}

async function editTemplate(templateID, messageData) {
    try {

        // Convert array to object
        const dataObject = messageData[0];

        const response = await axios({
            method: "POST",
            url: `https://graph.facebook.com/v20.0/${templateID}`,
            data: dataObject, // Use the video message structure
            "headers": {
                "Authorization": 'Bearer EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S',
                "Content-Type": "application/json",
            }
        })
        console.log("response", response.data)

        return response.data;
    } catch (err) {
        console.log("error", err.response ? err.response.data : err.message);
        return err.message;
    }
}



async function getOfficialTemplate(spid) {
    try {
        let WAdetails = await getWAdetails(spid);
        if(WAdetails != 'not exist'){
        const response = await axios({
            method: "GET",
            url: `https://graph.facebook.com/v20.0/${WAdetails[0].waba_id}/message_templates?access_token`,
            "headers": {
                "Authorization": 'Bearer '+WAdetails[0].token,
                "Content-Type": "application/json",
            }
        });
        // console.log(response.data, "**********");
        return response.data;
    }else{
        return 'channel not found';
    }
    } catch (err) {
        console.log("error", err.response ? err.response.data : err.message);
        return err.message;
    }
}


async function uploadMediaOnMeta(file_length,file_name,file_type,filePath) {
    try {
        console.log("uploadMediaOnMeta")
        // First API - Upload the file details
        const uploadUrl = 'https://graph.facebook.com/v20.0/1147412316230943/uploads';
        const uploadData = {
          file_length: file_length,
          file_type: file_type,
          file_name: file_name // Initial file name for the first API
        };
    
        const uploadResponse = await axios.post(uploadUrl, uploadData, {
          headers: {
            'Authorization': val.access_token,
            'Content-Type': 'application/json'
          }
        });
    
        const { id: uploadId} = uploadResponse.data; // Assuming response has 'id' and 'file_name'
        console.log('File uploaded successfully, ID:', uploadId);
    
        // Now, for the second API, upload the actual file using the returned file name
        const secondUrl = `https://graph.facebook.com/v20.0/${uploadId}`;
      
      
         // Prepare the form-data
         const form = new FormData();
         //const filePath = path.join(__dirname +"/uploads", file_name); // File path based on returned file_name
         form.append('file', fs.createReadStream(filePath)); // Attach file to form
         const formHeaders = form.getHeaders();
        
       

         const secondResponse = await axios.post(secondUrl, form, {
             headers: {
                 'Authorization':'OAuth EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S',
                 ...formHeaders // Include form-data headers
             }
         });
    
       // console.log('File uploaded in 2nd API:', secondResponse.data);
        await fs.unlink(filePath);
        return secondResponse.data;
      } catch (error) {
       // console.error('Error during API integration:', error.response ? error.response.data : error);
        await fs.unlink(filePath);
        return error.message;
      }
}

const addTemplate = async (req, res) => {
    try {
        ID = req.body.ID
        templateID = req.body?.templateID
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
            category_id = req.body.category_id
            interactiveButtons = req.body.interactiveButtonsPayload;
            

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        isTemplate = req.body.isTemplate
        industry = req.body.industry
        isCopied = req.body?.isCopied
        let image = Links
        let statusCode = 200;
        let buttons = req.body?.buttons
        let categoryChange = req.body?.categoryChange
        console.log(ID, status, Channel,req.body?.categoryChange)
        if (ID == 0) {
            let templateStatus;
            let addedtem;
            if (Channel == 'WhatsApp Official' || Channel == 'WA API') {
                if(isTemplate == 1 && isCopied != 1 && status != 'draft'){
                    templateStatus = await Createtemplate(template_json,spid);
                    console.log("templateStatus", templateStatus)
    
                    status = templateStatus.status
                    if (templateStatus.status){
                    let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id,templateStatus.id,buttons,categoryChange,'UNKNOWN',interactiveButtons]]
                    addedtem = await db.excuteQuery(val.addTemplates, [temValues])
                    }else{
                        statusCode = 400;
                    }
                }else if (isTemplate == 0 || isCopied == 1  || status == 'draft') {
                    let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), req.body.status, spid, created_By, created_at, isTemplate, industry, category_id,'',buttons,categoryChange,'UNKNOWN',interactiveButtons]]
                    addedtem = await db.excuteQuery(val.addTemplates, [temValues])
                }
            } else if (Channel == 'WhatsApp Web' || Channel == 'WA Web') {

                let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id,'','',categoryChange,'UNKNOWN',interactiveButtons]]
                addedtem = await db.excuteQuery(val.addTemplates, [temValues])
            }
            res.status(200).send({
                addedtem: addedtem,
                templateStatus: templateStatus,
                status: statusCode
            })

        }
        else {
            let updatedTemplate;
            if (Channel == 'WhatsApp Official' || Channel == 'WA API') {
                if (isTemplate == 1  && isCopied != 1 && status != 'draft') {
                     updatedTemplate = await Createtemplate(template_json,spid);
                    console.log("edittemplateStatus", updatedTemplate);
                    status = updatedTemplate.status
                    if(updatedTemplate.status){
                    let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id,updatedTemplate.id,buttons,categoryChange, ID]
                    updatedTemplate = await db.excuteQuery(val.updateTemplate, updatedTemplateValues)
                    console.log(Channel, status, "updatedTemplate", updatedTemplate)
                    }else{
                        statusCode = 400;
                    }
                }else {
                   
                    let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id,'',buttons,categoryChange, ID]
                    updatedTemplate = await db.excuteQuery(val.updateTemplate, updatedTemplateValues)
                    console.log(Channel, status, "updatedTemplate", updatedTemplate)
                }
            } else if (Channel == 'WhatsApp Web' || Channel == 'WA Web') {
                let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), req.body.status, spid, created_By, created_at, isTemplate, industry, category_id,'',buttons,categoryChange,ID]
                updatedTemplate = await db.excuteQuery(val.updateTemplate, updatedTemplateValues)
                console.log(Channel, "updatedTemplate", updatedTemplate)
            }

            res.status(200).send({
                updatedTemplate: updatedTemplate,
                status: statusCode
            })
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const isExistTemplate = async (req, res) => {
    try {

        let selectTemplate = await db.excuteQuery('SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1 and isTemplate=? and TemplateName=?', [req.params.spid, req.params.isTemplate, req.params.name]);
        if (selectTemplate?.length == 0) {

            res.send({
                "status": 200,
                "message": "Template ready to add",
            })
        } else {
            res.send({
                "status": 409,
                "message": "Template Name already exist"
            })
        }
    } catch (err) {
        res.send({
            "status": 500,
            "message": err
        })
    }
}

const getTemplate = async (req, res) => {
    try {
        let officialTemplates = await getOfficialTemplate(req.params.spid);
        //console.log(officialTemplates)
        let templates = await db.excuteQuery(val.selectTemplate, [req.params.spid, req.params.isTemplate]);
        if ( officialTemplates != 'channel not found' ){
        // Create a lookup object from newData
        const statusLookup = officialTemplates.data.reduce((lookup, item) => {
            lookup[item.name] = item.status;
            return lookup;
        }, {});
        let updateQuery = 'UPDATE templateMessages SET status = CASE';
        const updateValues = [];
        // Update status in rowDataPackets based on the lookup object
        templates.forEach(packet => {
            // console.log(packet.status  ,packet.TemplateName)
            if (packet.status != 'draft') {
                //     console.log("if")
                if (statusLookup[packet.TemplateName]) {
                    updateQuery += ` WHEN ID = ? THEN ?`;
                    updateValues.push(packet.ID, statusLookup[packet.TemplateName]);
                    packet.status = statusLookup[packet.TemplateName];
                }
            }
        });
        updateQuery += ' ELSE status END';
        console.log(updateQuery, updateValues)
        await db.excuteQuery(updateQuery, updateValues);

    }
        //  console.log(templates)
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

const getTemplateForGallery = async (req, res) => {
    try {
        let Channel = channelsForTemplates[req?.params?.channel];
        let officialTemplates = await getOfficialTemplate(req.params.spid);
        //console.log(officialTemplates)
        let templates = await db.excuteQuery(val.selectTemplateForGallery, [req.params.spid, req.params.isTemplate, Channel]);
        if ( officialTemplates != 'channel not found' ){
        // Create a lookup object from newData
        const statusLookup = officialTemplates.data.reduce((lookup, item) => {
            lookup[item.name] = item.status;
            return lookup;
        }, {});

        // Update status in rowDataPackets based on the lookup object
        templates.forEach(packet => {
            // console.log(packet.status  ,packet.TemplateName)
            if (packet.status != 'draft') {
                //     console.log("if")
                if (statusLookup[packet.TemplateName]) {
                    packet.status = statusLookup[packet.TemplateName];
                }
            }
        })
    }
        //  console.log(templates)
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

const addGallery = async (req, res) => {
    try {
        console.log(req.body)
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
            category_id = req.body.category_id
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        isTemplate = req.body.isTemplate
        industry = req.body.industry
        topic = req.body.topic
        let image = ""
        image = Links
        if (Links != null && Links != undefined && Links != "" && Links != " " && media_type == 'image') {
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
            let selectTemplate = await db.excuteQuery('SELECT * FROM templateMessages WHERE spid=0 and isDeleted !=1 and isTemplate=2 and TemplateName=?', [spid, isTemplate, TemplateName]);
            if (selectTemplate?.length == 0) {
                let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, 0, created_By, created_at, '2', industry, category_id, created_at, topic]]
                let addedtem = await db.excuteQuery(val.addGallery, [temValues])
                res.status(200).send({
                    addedtem: addedtem,
                    status: 200
                })
            } else {
                res.status(409).send({
                    msg: 'Gallery name already exist',
                    status: 409
                })
            }
        }
        else {
            let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id, topic, ID]
            let updatedTemplate = await db.excuteQuery(val.updateGallery, updatedTemplateValues)
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

const getGallery = async (req, res) => {
    try {
        let templates = await db.excuteQuery(val.getGallery, [req.params.spid, req.params.isTemplate])
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


const getApprovedTemplate = async (req, res) => {
    try {
        let templates = await db.excuteQuery(val.selectApprovedTemplate, [req.params.spid, req.params.isTemplate])
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
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        ID = req.body.ID;
        let deleteVal = await db.excuteQuery(val.deleteTemplate, [created_at, ID]);
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
        var TemplateData = req.body
        let customerID = "";
        var messateText = TemplateData.message_content
        let channel = TemplateData.channel_id
        let media = TemplateData.message_media
        let content = await removeTags.removeTagsFromMessages(messateText)
        let message_variables = req.body.message_variables && req.body.message_variables.length > 0 ? JSON.parse(req.body.message_variables) : undefined;
        let buttons = TemplateData?.buttons;
        let language = TemplateData?.language
        let isTemplate = TemplateData?.isTemplate
            let message_text = req.body.message_text;
            let message_media = req.body.message_media;
            let media_type = req.body.media_type;
            let Message_template_id = req.body.template_id;
            let Quick_reply_id = req.body.quick_reply_id;
            let Type = req.body.message_type;
            let assignAgent = req.body?.assignAgent;
            var msgVar = req.body?.message_variables;
            var header = req.body?.headerText
            let templateName = req.body?.name
            var body = req.body?.bodyText
            const mediaType = determineMediaType(media_type);
            let DynamicURLToBESent;
            buttons = typeof buttons === 'string' ? JSON.parse(buttons) : buttons

        if (message_variables) {
            message_variables.forEach(variable => {
                const label = variable.label;
                const value = variable.value;
                content = content.replace(new RegExp(label, 'g'), value);
            });
        }

        if (TemplateData.segments_contacts?.length) {

            customerID = JSON.parse(TemplateData.segments_contacts)[0];
            // Parse the message template to get placeholders
            var placeholders = parseMessageTemplate(content);
            // if (placeholders.length > 0) {
            //     console.log(placeholders)
            //     const results = await removeTags.getDefaultAttribue(placeholders, TemplateData.sp_id, customerID);
            //     console.log("results", results)

            //     placeholders.forEach(placeholder => {
            //         const result = results.find(result => result.hasOwnProperty(placeholder));
            //         const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
            //         content = content.replace(`{{${placeholder}}}`, replacement);
            //     });
            // }

        } else if (TemplateData.csv_contacts?.length) {
            let contact = JSON.parse(TemplateData.csv_contacts)[0];
            // Replace any remaining placeholders in the content with values from the contact object
            Object.keys(contact).forEach(key => {
                const value = contact[key];
                content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
        }


        let testNo = await db.excuteQuery(val.selectCampaignTest, [TemplateData.sp_id]);



        let message_status = '';
        var type = 'image';
        if (media == null || media == "") {
            var type = 'text';
        }

        for (let phone_number of testNo) {
            const customerID = await db.excuteQuery(val.getCampaignId, [phone_number?.mobile_number, phone_number?.SP_ID]);
            let headerVar = await commonFun.getTemplateVariables(msgVar, header, phone_number?.SP_ID, customerID[0]?.customerId);
            let bodyVar = await commonFun.getTemplateVariables(msgVar, body, phone_number?.SP_ID, customerID[0]?.customerId);
            let userChannel = channelForSendingMessage[phone_number?.Channel];
            
          if (placeholders && placeholders.length > 0) {
                const results = await removeTags.getDynamicURLToBESent(message_variables, phone_number?.SP_ID, customerID[0]?.customerId);
                placeholders.forEach((placeholder, index) => {
                    const result = results[index];
                    const replacement = result;
                    content = content.replace(`{{${placeholder}}}`, replacement);
                });
            }

             let buttonsVariable = typeof req.body?.buttonsVariable === 'string' ? JSON.parse(req.body?.buttonsVariable) : req.body?.buttonsVariable;
             if(!commonFun.isInvalidParam(req.body?.buttonsVariable) && buttonsVariable.length > 0) {
                DynamicURLToBESent = await removeTags.getDynamicURLToBESent(buttonsVariable, phone_number?.SP_ID, customerID[0]?.customerId);
             }
             if(isTemplate == true && userChannel == 'WhatsApp Official'){
                message_status = await middleWare.createWhatsAppPayload(mediaType, phone_number.mobile_number, templateName, language, headerVar, bodyVar, message_media, phone_number?.SP_ID, buttons, DynamicURLToBESent)
             }
             else{
                let spNumber = await db.excuteQuery(val.getAgentId, [phone_number?.SP_ID]);

                message_status = await middleWare.channelssetUp(TemplateData.sp_id, userChannel, type, phone_number.mobile_number, content, media, "", "", spNumber)
             }
        }

        res.send({
            status: 200,
            message_status: message_status?.status,
            err: message_status?.err
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}
function determineMediaType(mediaType) {
    switch (mediaType) {
        case 'video/mp4':
        case 'video':
            return 'video';
        case 'application/pdf':
            return 'document';
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/png':
         case 'image':
            return 'image';
        case '':
            return 'text';
        default:
            return 'text';
    }
}

// Function to parse the message template and retrieve placeholders
function parseMessageTemplate(template) {
    const placeholderRegex = /{{(.*?)}}/g;
    const placeholders = [];
    let match;
    while ((match = placeholderRegex.exec(template))) {
        placeholders.push(match[1]);
    }
    return placeholders;
}

const getFlows = async (req,res) =>{
    try {
        let WAdetails = await getWAdetails(req.params.spid);
        if(WAdetails != 'not exist'){
        const response = await axios({
            method: "GET",
            url: `https://graph.facebook.com/v20.0/${WAdetails[0].waba_id}/flows?access_token`,
            "headers": {
                "Authorization": 'Bearer '+WAdetails[0].token,
                "Content-Type": "application/json",
            }
        });
        let Flows = await db.excuteQuery(val.getflows, [req.params.spid]);
            console.log(Flows,'Flows')
        // Filter the flows locally to return only those with status 'PUBLISHED'
        // const publishedFlows = response.data.data.filter(flow => flow.status === 'PUBLISHED');
         const publishedFlows = response.data.data;
         const existingFlowIds = new Set(Flows.map(row => row.flowid));

        const newData = publishedFlows.filter(item => !existingFlowIds.has(item?.id));
        console.log(newData,'newData')
        if (newData.length >0) {     
        const insertValues = newData.map(item => [req.params.spid,item.id, item.name,item.status, 0]); 
        const query = `INSERT INTO Flows (spid, flowid, flowname,status, responses) VALUES ?`;
        await db.excuteQuery(query, [insertValues]);

    }
    let FlowsData = await db.excuteQuery(val.getflows, [req.params.spid]);
        res.send({
            status: 200,
            flows: FlowsData
        })
    }else{
        res.send({
            status: 400,
            flows: 'channel not found'
        }) 
    }
    } catch (err) {
        res.send({
            status: 500,
            err: err.message
        })
    }
}

const getFlowDetail = async (req, res) => {
    try {
        let FlowDetail = await db.excuteQuery(val.getflowDetail, [req.params.spid, req.params.flowId]);        
         res.send({
            status: 200,
            flows: FlowDetail
        })
    } catch (err) {
         res.send({
            status: 500,
            err: err.message
        })
    }
}

const saveFlowMapping = async (req, res) => {
    try {
            let flowId = req.body?.flowId;
            let spid = req.body.spId;
            let ColumnMapping = req.body.mapping;
       
            let save = await db.excuteQuery(val.saveflowMapping, [JSON.stringify(ColumnMapping),spid,flowId]);
            if(req.body.isUpdateValues){
                 updatePreviousValue(req); 
            }

            res.send({
                status: 200,
                flows: save
            })
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

async function updatePreviousValue(req){
    try {
        let FlowDetail = await db.excuteQuery(val.getflowDetail, [req.body.spId, req.body?.flowId]);
        FlowDetail.forEach((record) => {
           let mapping =  req.body.mapping;
           let flowresponse= JSON.parse(JSON.parse(record?.flowresponse));
              mapping.forEach((map) => {
                  let value= flowresponse[map?.ActuallName];
                  if(map.attributeMapped != "" && map?.isOverride && value){
                    let updateQuery = `UPDATE EndCustomer SET ${map.attributeMapped}=? WHERE SP_ID=? AND customerId=?`;
                    db.excuteQuery(updateQuery, [value, req.body.spId, record.customerId]);
                } else if(map.attributeMapped != "" && !map?.isOverride && value){
                    let updateQuery = `UPDATE EndCustomer SET ${map.attributeMapped} =? WHERE SP_ID =? AND customerId =? AND (${map.attributeMapped} IS NULL OR ${map.attributeMapped} = '')`;
                    db.excuteQuery(updateQuery, [value, req.body.spId, record.customerId]);
                }
              })
        });
    } catch (err) {
        console.log(err)
        res.send(err)
    }
}


const exportFlowData = async (req, res) => {
    try {
      console.log(req.body)
      var data = req.body.data
      let SP_ID = req.body.spId
      let Channel = req?.body?.Channel
      let emailSender = MessagingName[Channel];
      const transporter = getTransporter(emailSender);
      const senderConfig = EmailConfigurations[emailSender];
  
      let isDateTime = await processData(data)
      if (data.length > 0 && isDateTime) {
        let result = await formatterDateTime(data, SP_ID);
        if (result) {
          data = result
        }
      }
      // Create a unique directory for temporary files
      const uniqueDir = path.join(__dirname, `temp_${Date.now()}`);
      if (!fs.existsSync(uniqueDir)) {
        fs.mkdirSync(uniqueDir);
      }
  
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);
      const filePath = path.join(uniqueDir, 'data.csv'); 
      fs.writeFileSync(filePath, csv, function (err) {
        if (err) {
          res.send(err);
        }
        console.log('File Saved')
      })
      const xlsxPath = await convertCsvToXlsx(csv, path.join(uniqueDir, 'data.xlsx'));
      res.attachment("data.csv")
      const timestamp = Date.now();
      const randomNumber = Math.floor(Math.random() * 10000);
      var mailOptions = {
        from: senderConfig.email,
        to: req.body.loginData,
        subject: `${emailSender} - Contacts export report`,
        html: `
          <p>Dear ${req.body?.Name},</p>
          <p>Please find attached here the file containing your exported contacts from your ${emailSender} account.</p>
          <p>Thank you,</p>
          <p>Team ${emailSender}</p>
        `,
        attachments: [
          {
            filename: `${timestamp}-${randomNumber}.xlsx`,
            path: xlsxPath,
          },
        ]
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error(`export contact email send error ${error}`)
          fs.rmSync(uniqueDir, { recursive: true, force: true });
          // res.send(error);
        } else {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          logger.info(`Message sent: %s, ${info.messageId}`)
          fs.rmSync(uniqueDir, { recursive: true, force: true });
          // res.status(200).send({ msg: "data has been sent" });
        }
  
      });
  
      return res.status(200).send({ msg: "Contacts exported sucessfully!" });
    } catch (err) {
        console.log(err)
      res.send(err);
    }  
  }
  function convertCsvToXlsx(fileBuffer, outputFileName = 'Converted_File.xlsx') {
    // using utf-8 encodign to avoid edge cases of CSV
    return new Promise((resolve, reject) => {
      try {
        const csvString = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('utf-8');
        if (!csvString.trim()) {
          return reject(new Error('Input CSV is empty.'));
        }
  
        const workbook = XLSX.read(csvString, { type: 'string', codepage: 65001 });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]] || XLSX.utils.aoa_to_sheet([]);
        for (const cell in worksheet) {
          if (cell[0] === "!") continue;
          let value = worksheet[cell].v;
          if (typeof value === 'number') {
            worksheet[cell].v = value.toString();
            worksheet[cell].z = '0'; 
          }
  
          if (typeof value !== 'number') {
            worksheet[cell].z = '@'; 
          }
        }
        
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet1');
        XLSX.writeFile(newWorkbook, outputFileName);
  
        console.log(`XLSX file created successfully: ${outputFileName}`);
        resolve(outputFileName);
      } catch (error) {
        console.error(`Error during conversion: ${error.message}`);
        reject(error);
      }
    });
  }
  

  async function processData(data) {
    if (data.length > 0) {
      let containsDateOrTime = false;
  
      const datePatterns = [
        /\b\d{4}-\d{2}-\d{2}\b/,       // YYYY-MM-DD
        /\b\d{2}\/\d{2}\/\d{4}\b/,     // DD/MM/YYYY
        /\b\d{2}-\d{2}-\d{4}\b/,       // DD-MM-YYYY
        /\b\d{4}\/\d{2}\/\d{2}\b/      // YYYY/MM/DD
      ];
  
      const timePatterns = [
        /\b([01]?\d|2[0-3]):[0-5]\d:[0-5]\d\b/,         // HH:MM:SS in 24-hour format
        /\b([01]?\d|2[0-3]):[0-5]\d\b/,                 // HH:MM in 24-hour format
        /\b(1[0-2]|0?[1-9]):[0-5]\d\s?(AM|PM)\b/i,      // HH:MM AM/PM in 12-hour format
        /\b(1[0-2]|0?[1-9]):[0-5]\d:[0-5]\d\s?(AM|PM)\b/i // HH:MM:SS AM/PM in 12-hour format
      ];
  
      for (const item of data) {
        // Loop through each key-value pair in the object
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const value = item[key];
            const isDate = datePatterns.some(pattern => pattern.test(value));
            const isTime = timePatterns.some(pattern => pattern.test(value));
  
            if (isDate || isTime) {
              containsDateOrTime = true;
              break; // Exit inner loop if a date or time value is found
            }
          }
        }
        if (containsDateOrTime) break; // Exit outer loop if a date or time value is found
      }
    }
  }

  function getTransporter(channel) {
    const senderConfig = EmailConfigurations[channel];
    if (!senderConfig) {
        throw new Error(`Invalid channel: ${channel}`);
    }
  
    return nodemailer.createTransport({
        host: senderConfig.emailHost,
        port: senderConfig.port,
        secure: true,
        auth: {
            user: senderConfig.email,
            pass: senderConfig.appPassword,
        },
    });
  }
  

  async function formatterDateTime(data, sp_id) {
    const select = 'SELECT * FROM localDetails WHERE SP_ID = ?';
    const formatSettings = await db.excuteQuery(select, [sp_id]);
  
    if (!formatSettings || formatSettings.length === 0) {
       return data;
    }
  
    let { Date_Format, Time_Format } = formatSettings[0];
    for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const { Date: originalDate, Time: originalTime } = record;
  
        try {
            const date = moment(originalDate);
            const time = moment(originalTime, 'HH:mm'); 
            if(Date_Format) Date_Format = convertToUppercaseFormat(Date_Format)
            let formattedDate = date.format(Date_Format || 'MM/DD/YYYY');
            if(formattedDate == 'Invalid date'){formattedDate = originalDate};
            let formattedTime = time.format(Time_Format === '12' ? 'h:mm A' : 'HH:mm');
            if(formattedTime == 'Invalid date') {formattedTime = originalTime};
            
            data[i] = {
                ...record,
                Date: formattedDate,
                Time: formattedTime
            };
        } catch (error) {
            console.error('Error formatting record:', error);
        }
    }
  
    return data;
  }

  function convertToUppercaseFormat(format) {
    const formatMapping = {
        'd': 'D', 
        'dd': 'DD', 
        'm': 'M', 
        'mm': 'MM',
        'yy': 'YY', 
        'yyyy': 'YYYY'
    };
  
    return format.replace(/d{1,2}|m{1,2}|y{2,4}/gi, match => formatMapping[match.toLowerCase()] || match);
  }
  
module.exports = {
    addCampaignTimings, updateCampaignTimings, selectCampaignTimings, getUserList, addAndUpdateCampaign,
    selectCampaignAlerts, addCampaignTest, selectCampaignTest, addTag, gettags, deleteTag, addTemplate, getTemplate, deleteTemplates,
    testCampaign, addCustomField, editCustomField, getCustomField, deleteCustomField, getCustomFieldById, enableMandatoryfield,
    enableStatusfield, getApprovedTemplate, addGallery, getGallery, isExistTemplate ,uploadMediaOnMeta,getFlows, getTemplateForGallery,getFlowDetail,saveFlowMapping,exportFlowData

}