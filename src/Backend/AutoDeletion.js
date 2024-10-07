const cron = require('node-cron');
const db = require('./dbhelper');
var express = require("express");
const awsHelper = require('./awsHelper');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const moment = require('moment');
const logger = require('./common/logger.log')

async function autoDeletion() {
    let getDataQuery = `select * from managestorage where  isDeleted !=1 and SP_ID=40`;
    let storageData = await db.excuteQuery(getDataQuery, []);
    if (storageData?.length > 0) {
        for (let data of storageData) {

            let myUTCString = new Date().toUTCString();
            const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

            function subtractDaysFromNow(auto_deletion_days) {
                return moment().subtract(auto_deletion_days, 'days').format('YYYY-MM-DD HH:mm:ss');
            }

            //_____Media deletion___________//
            if (data.autodeletion_media != '-1') {

                let deletemedia = await awsHelper.deleteObjectFromBucket(data.autodeletion_media, data.SP_ID);

                let deleteMediaQuery = `UPDATE Message set is_deleted=1,updated_at=? where SPID=? and  message_media !="text"  AND DATE(created_at) <=  ? `
                const daysOfmessage = subtractDaysFromNow(data.autodeletion_message);
                console.log(daysOfmessage,"daysOfmessage")
                logger.info(`Media deletion days spid  ${data.SP_ID} days given ${data.autodeletion_media}  substracted days ${daysOfmessage}`)
                await db.excuteQuery(deleteMediaQuery, [updated_at, data.SP_ID,daysOfmessage])
            }




            // delete messages
            if (data.autodeletion_message != '-1') {
                let deleteMessageQuery = `UPDATE Message set is_deleted=1,updated_at=? where SPID=? AND created_at < ?`;
                const daysOfmessage = subtractDaysFromNow(data.autodeletion_message);
                let deletedMessage = await db.excuteQuery(deleteMessageQuery, [new Date(), data.SP_ID, daysOfmessage]);
                logger.info(`Message deletion days spid  ${data.SP_ID} days given ${data.autodeletion_message}  substracted days ${deletedMessage} `)
            }


            // delete contacts

            if (data.autodeletion_contacts != '-1') {
                let deleteContactQuery = `UPDATE EndCustomer set isDeleted=1,updated_at=? where SP_ID=? AND created_at < ?`

                const daysOfcontact = subtractDaysFromNow(data.autodeletion_contacts);
                let deletedcontact = await db.excuteQuery(deleteContactQuery, [new Date(), data.SP_ID, daysOfcontact]);
                let interactionDeletion = db.excuteQuery(`update Interaction SET is_deleted =1,interaction_status=?,updated_at=?  WHERE SP_ID=? AND created_at < `, ['Resolved', new Date(), data.SP_ID, daysOfcontact])
                logger.info(`Contact deletion days spid  ${data.SP_ID} days given ${data.autodeletion_contacts}  substracted days ${daysOfcontact} `)
            }
        }
    }

}

cron.schedule('0 12 * * *', async () => { 
    console.log('Running scheduled task...');
    autoDeletion();

});

app.listen(3007, () => {
    console.log("Auto Deletion scheduler  is listening on port 3007");
});