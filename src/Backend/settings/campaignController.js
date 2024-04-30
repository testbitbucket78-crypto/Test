var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const awsHelper = require('../awsHelper');
const middleWare = require('../middleWare')
const removeTags = require('../removeTagsFromRichTextEditor')
const cors = require('cors');
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
            let selectTag = await db.excuteQuery('Select * from EndCustomerTagMaster where SP_ID=? and TagName=?', [SP_ID, TagName])
            if (selectTag?.length == 0) {
                let addValue = [[TagName, TagColour, SP_ID, created_at, created_at]];
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
        const ColumnName = req.body.ColumnName;
        const SP_ID = req.body.SP_ID;
        const Type = req.body.Type;
        const description = req.body.description;
        const created_at = new Date().toUTCString();
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


            // Fetch all data for the given SP_ID
            const allData = await db.excuteQuery(val.getColCount, [SP_ID]);


            // Generate the custom column name
            const CustomColumn = "column" + (allData[0].columnCount + 1);

            // Prepare values for insertion
            const insertionValues = [CustomColumn, ColumnName, SP_ID, Type, description, created_at, JSON.stringify(values)];

            // Insert the new custom field
            const addFieldResult = await db.excuteQuery(val.addcolumn, [[insertionValues]]);

            // Return 500 if insertion failed
            if (!addFieldResult.insertId) {
                res.status(500).send({
                    status: 500,
                    message: 'Failed to insert custom field'
                });
                return;
            } else {
                // Check if the Type is 'select', format the values accordingly and update id with addfiled inserted id
                if (Type === 'Select') {
                    values = values.map(option => ({
                        id: addFieldResult.insertId + '_' + option.id,
                        optionName: option.optionName
                    }));
                    let updateRes = await db.excuteQuery('UPDATE  SPIDCustomContactFields SET dataTypeValues=? WHERE id =?', [JSON.stringify(values), addFieldResult.insertId])
                }

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


const editCustomField = async (req, res) => {
    try {
        ColumnName = req.body.ColumnName,
            Type = req.body.Type,
            description = req.body.description,

            updated_at = new Date().toUTCString();

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
     
  
      // Update fields based on ActuallName
      const updatedFields = getfields.map(field => {
        switch (field.ActuallName) {
          case 'Name':
            field.type = 'Text';
            field.mandatory = 1;
            field.displayName='Name'
            break;
          case 'Phone_number':
            field.type = 'Number';
            field.mandatory = 1;
            field.displayName='Phone Number'
            break;
          case 'emailId':
            field.type = 'Text';
            field.mandatory = 0;
            field.displayName='Email'
            break;
          case 'OptInStatus':
            field.type = 'Switch';
            field.mandatory = 0;
            field.displayName='Message Opt-in'
            break;
          case 'tag':
            field.type = 'Multi Select';
            field.mandatory = 0;
            field.displayName='Tag'
            break;
          case 'ContactOwner':
            field.type = 'User';
            field.mandatory = 1;
            field.displayName='Contact Owner'
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
            category_id = req.body.category_id
        created_at = new Date()
        isTemplate = req.body.isTemplate
        industry = req.body.industry

        let image = Links

        if (ID == 0) {

            let temValues = [[TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id]]
            let addedtem = await db.excuteQuery(val.addTemplates, [temValues])
            res.status(200).send({
                addedtem: addedtem,
                status: 200
            })

        }
        else {
            let updatedTemplateValues = [TemplateName, Channel, Category, Language, media_type, Header, BodyText, image, FooterText, JSON.stringify(template_json), status, spid, created_By, created_at, isTemplate, industry, category_id, ID]
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
        created_at = new Date()
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
                const results = await removeTags.getDefaultAttribue(placeholders,TemplateData.sp_id,customerID);
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
            message_status: message_status?.status
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
    enableStatusfield, getApprovedTemplate, addGallery, getGallery, isExistTemplate

}