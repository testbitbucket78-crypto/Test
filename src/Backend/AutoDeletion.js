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
    let getDataQuery = `select * from managestorage where isDeleted != 1`;
    let storageData = await db.excuteQuery(getDataQuery, []);
    
    // Log the length of storageData
    logger.info(`Number of records fetched from managestorage: ${storageData?.length}`);

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

                let deleteMediaQuery = `UPDATE Message set is_deleted=1,updated_at=? where SPID=? and message_media !="text" AND DATE(created_at) <= ? `;
                const daysOfmessage = subtractDaysFromNow(data.autodeletion_media);
                let deletedMedia = await db.excuteQuery(deleteMediaQuery, [updated_at, data.SP_ID, daysOfmessage]);
                logger.info(`Media deletion initiated for SPID: ${data.SP_ID}, days given: ${data.autodeletion_media}, subtracted days: ${daysOfmessage} ,affected rows: ${deletedMedia?.affectedRows}`);
               

            } else {
                logger.info(`Media not marked for deletion for SPID: ${data.SP_ID}, days given: ${data.autodeletion_media}`);
            }

            //_____Message deletion___________//
            if (data.autodeletion_message != '-1') {
                let deleteMessageQuery = `UPDATE Message set is_deleted=1,updated_at=? where SPID=? AND created_at < ?`;
                const daysOfmessage = subtractDaysFromNow(data.autodeletion_message);

                let deletedMessage = await db.excuteQuery(deleteMessageQuery, [new Date(), data.SP_ID, daysOfmessage]);
                logger.info(`Message deletion initiated for SPID: ${data.SP_ID}, days given: ${data.autodeletion_message}, subtracted days: ${daysOfmessage}, affected rows: ${deletedMessage?.affectedRows}`);

            } else {
                logger.info(`Message not marked for deletion for SPID: ${data.SP_ID}, days given: ${data.autodeletion_message}`);
            }

            //_____Contact deletion___________//
            if (data.autodeletion_contacts != '-1') {
                let deleteContactQuery = `UPDATE EndCustomer set isDeleted=1,updated_at=? where SP_ID=? AND created_at < ?`;
                const daysOfcontact = subtractDaysFromNow(data.autodeletion_contacts);

                let deletedContact = await db.excuteQuery(deleteContactQuery, [new Date(), data.SP_ID, daysOfcontact]);
              //  let interactionDeletion = await db.excuteQuery(`UPDATE Interaction SET is_deleted =1, interaction_status=?, updated_at=? WHERE SP_ID=? AND created_at < ?`, ['Resolved', new Date(), data.SP_ID, daysOfcontact]);

                logger.info(`Contact deletion initiated for SPID: ${data.SP_ID}, days given: ${data.autodeletion_contacts}, subtracted days: ${daysOfcontact}, affected rows: ${deletedContact?.affectedRows}`);

            } else {
                logger.info(`Contact not marked for deletion for SPID: ${data.SP_ID}, days given: ${data.autodeletion_contacts}`);
            }
        }
    } else {
        logger.info(`No records found for deletion.`);
    }
}

cron.schedule('0 12 * * *', async () => { 
    console.log('Running scheduled task...');
    autoDeletion();

});

app.listen(3007, () => {
    console.log("Auto Deletion scheduler  is listening on port 3007");
});