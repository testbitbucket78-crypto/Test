var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const awsHelper = require('../awsHelper');
const middleWare = require('../middleWare')
const removeTags = require('../removeTagsFromRichTextEditor')
const moment = require('moment');
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
            console.log("addFieldResult", addFieldResult)
            // Return 500 if insertion failed
            if (!addFieldResult.insertId) {
                res.status(500).send({
                    status: 500,
                    message: 'Failed to insert custom field'
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
    } else {
        // Fetch all active data for the given SP_ID
        const allData = await db.excuteQuery(val.getColCount, [SP_ID]);

        // Generate a new custom column name (ensure it's within the limit)
        if (allData[0].columnCount < 25) {
            CustomColumn = "column" + (allData[0].columnCount + 1);
        } else {
            throw new Error("Maximum column limit reached. Reuse or delete existing columns.");
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


async function Createtemplate(messageData) {
    try {
        //   var access_token = 'Bearer EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S'
        //_____________________________ TEMPLATE SETTINGS _________________________________//

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
            url: `https://graph.facebook.com/v20.0/192571223940007/message_templates?access_token`,
            data: dataObject, // Use the video message structure
            "headers": {
                "Authorization": 'Bearer EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S',
                "Content-Type": "application/json",
            }
        })
        console.log("response", response.data)

        return response.data;
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



async function getOfficialTemplate() {
    try {
        const response = await axios({
            method: "GET",
            url: `https://graph.facebook.com/v20.0/192571223940007/message_templates?access_token`,
            "headers": {
                "Authorization": 'Bearer EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S',
                "Content-Type": "application/json",
            }
        });
        // console.log(response.data, "**********");
        return response.data;
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
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        isTemplate = req.body.isTemplate
        industry = req.body.industry
        isCopied = req.body?.isCopied
        let image = Links
        let statusCode = 200;
        console.log(ID, status, Channel)
        if (ID == 0) {
            let templateStatus;
            let addedtem;
            if (Channel == 'WhatsApp Official' || Channel == 'WA API') {
                if(isTemplate == 1 && isCopied != 1){
                    templateStatus = await Createtemplate(template_json);
                    console.log("templateStatus", templateStatus)
    
                    status = templateStatus.status
                    if (templateStatus.status){
                    let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id]]
                    addedtem = await db.excuteQuery(val.addTemplates, [temValues])
                    }else{
                        statusCode = 400;
                    }
                }else if (isTemplate == 0 || isCopied == 1) {
                    let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), req.body.status, spid, created_By, created_at, isTemplate, industry, category_id]]
                    addedtem = await db.excuteQuery(val.addTemplates, [temValues])
                }
            } else if (Channel == 'WhatsApp Web' || Channel == 'WA Web') {

                let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id]]
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
               
                if (isTemplate == 1) {
                     updatedTemplate = await Createtemplate(template_json);
                    console.log("edittemplateStatus", updatedTemplate);
                    status = updatedTemplate.status
                    if(updatedTemplate.status){
                    let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id, ID]
                    updatedTemplate = await db.excuteQuery(val.updateTemplate, updatedTemplateValues)
                    console.log(Channel, status, "updatedTemplate", updatedTemplate)
                    }else{
                        statusCode = 400;
                    }
                }else if(isTemplate == 0){
                    let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id, ID]
                    updatedTemplate = await db.excuteQuery(val.updateTemplate, updatedTemplateValues)
                    console.log(Channel, status, "updatedTemplate", updatedTemplate)
                }
            } else if (Channel == 'WhatsApp Web' || Channel == 'WA Web') {
                let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), req.body.status, spid, created_By, created_at, isTemplate, industry, category_id, ID]
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
        let officialTemplates = await getOfficialTemplate();
        //console.log(officialTemplates)
        let templates = await db.excuteQuery(val.selectTemplate, [req.params.spid, req.params.isTemplate]);

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
        });
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
            const placeholders = parseMessageTemplate(content);
            if (placeholders.length > 0) {
                console.log(placeholders)
                const results = await removeTags.getDefaultAttribue(placeholders, TemplateData.sp_id, customerID);
                console.log("results", results)

                placeholders.forEach(placeholder => {
                    const result = results.find(result => result.hasOwnProperty(placeholder));
                    const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
                    content = content.replace(`{{${placeholder}}}`, replacement);
                });
            }

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
            message_status = await middleWare.channelssetUp(TemplateData.sp_id, channel, type, phone_number.mobile_number, content, media)
            console.log(message_status)

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

module.exports = {
    addCampaignTimings, updateCampaignTimings, selectCampaignTimings, getUserList, addAndUpdateCampaign,
    selectCampaignAlerts, addCampaignTest, selectCampaignTest, addTag, gettags, deleteTag, addTemplate, getTemplate, deleteTemplates,
    testCampaign, addCustomField, editCustomField, getCustomField, deleteCustomField, getCustomFieldById, enableMandatoryfield,
    enableStatusfield, getApprovedTemplate, addGallery, getGallery, isExistTemplate ,uploadMediaOnMeta

}