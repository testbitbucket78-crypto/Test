const db = require('../dbhelper');
const { MessagingLimitTiers } = require('../enum');
const removeTags = require('../removeTagsFromRichTextEditor')
async function isStatusEmpty(InteractionId, spid, cusid) {
  try {
    let isUpdateTime;
    let isNewContact = await db.excuteQuery('select * from Interaction where interaction_status =? and customerId = ? and SP_ID=? and IsTemporary !=1 and is_deleted !=1', ['empty', cusid, spid]);
    let getInteractionStatus = await db.excuteQuery('select * from Interaction where interaction_status =? and InteractionId = ? and SP_ID=? and IsTemporary !=1 and is_deleted !=1', ['empty', InteractionId, spid]);
    if (isNewContact?.length == 1 && getInteractionStatus.length > 0) {
      isUpdateTime = 1;
    } else if (getInteractionStatus.length > 0) {
      isUpdateTime = 0;
    }
    console.log("isUpdateTime", isUpdateTime)

    return isUpdateTime;
  } catch (err) {
    return err;
  }
}


// getDefaultAttribue with Fallback
async function getDefaultAttribue(message_variables, spid, customerId) {
  try {
    // Check if message_variables is a string and parse it
    if (typeof message_variables === 'string') {
      // console.log("string", message_variables);
      try {
        message_variables = JSON.parse(message_variables);
      } catch (err) {
        console.error("Failed to parse message_variables:", err);
        return [];
      }
    }

    // Check if message_variables is an array
    if (!Array.isArray(message_variables)) {
      console.error("message_variables is not an array");
      return [];
    }

    let results = [];

    // Fetch all column names from EndCustomer table
    const endCustomerColumnsQuery = `SHOW COLUMNS FROM EndCustomer`;
    let endCustomerColumns = await db.excuteQuery(endCustomerColumnsQuery);
    endCustomerColumns = endCustomerColumns.map(column => column.Field);

    // Fetch all column names from SPIDCustomContactFields table
    const spidCustomColumnsQuery = `SELECT ColumnName, CustomColumn, Type FROM SPIDCustomContactFields WHERE SP_ID=? AND isDeleted != 1`;
    let spidCustomColumns = await db.excuteQuery(spidCustomColumnsQuery, [spid]);
    let spidCustomColumnsMap = new Map();
    spidCustomColumns.forEach(column => {
      spidCustomColumnsMap.set(column.ColumnName, column.CustomColumn);
    });

    // Iterate over each message variable
    for (let i = 0; i < message_variables.length; i++) {
      const message_variable = message_variables[i];
      // console.log(`Processing message variable ${i}:`, message_variable);

      let result = {};

      // Check if the message_variable exists in EndCustomer columns
      if (endCustomerColumns.includes(message_variable)) {
        const endCustomerQuery = `SELECT ${message_variable} FROM EndCustomer WHERE customerId=? AND isDeleted != 1 AND SP_ID=?`;
        let endCustomerResult = await db.excuteQuery(endCustomerQuery, [customerId, spid]);
        // console.log(endCustomerResult);
        if (endCustomerResult.length > 0 && endCustomerResult[0][message_variable]) {
          result[message_variable] = endCustomerResult[0][message_variable];
        }
      }
      // Check if the message_variable exists in SPIDCustomContactFields columns
      else if (spidCustomColumnsMap.has(message_variable)) {
        const customColumn = spidCustomColumnsMap.get(message_variable);
        const endCustomerQuery = `SELECT ${customColumn} FROM EndCustomer WHERE customerId=? AND isDeleted != 1 AND SP_ID=?`;
        let endCustomerResult = await db.excuteQuery(endCustomerQuery, [customerId, spid]);

        if (endCustomerResult.length > 0 && endCustomerResult[0][customColumn]) {
          let TypeFound = spidCustomColumns.find(item => item.ColumnName === message_variable);
          if (TypeFound) {
            let columnValue = endCustomerResult[0][customColumn];
            if (TypeFound.Type === 'Multi Select' || TypeFound.Type === 'Select') {
              let processedValues = columnValue.split(',').map(part => {
                return part.split(':')[1];
              });
              endCustomerResult[0][customColumn] = processedValues.join(', ');
            }
          }
          result[message_variable] = endCustomerResult[0][customColumn];
        }
      }
      results.push(result);
    }

    return results;
  } catch (err) {
    console.log("Error:", err);
    return [];
  }
}

function determineMediaFromLink(link) {
  try {
    const fileExtension = link.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
      return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(fileExtension)) {
      return 'video';
    } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(fileExtension)) {
      return 'document';
    } else {
      return 'unknown';
    }
  } catch (error) {
    console.error('Error while extracting media type from link:', error.message);
    return 'unknown';
  }
}

async function isWorkingTime(sid) {
  //console.log(data)
  const currentTime = new Date();
  let workingHourQuery = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`;
  var workingData = await db.excuteQuery(workingHourQuery, [sid]);
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  let datetime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
  // console.log(currentDay)
  const time = new Date()

  for (const item of workingData) {
    const workingDays = item.working_days.split(',');
    const date = new Date(datetime).getHours();
    const getMin = new Date(datetime).getMinutes();
    // console.log(date + " :::::::" + getMin)
    const start_time = (item.start_time).replace(/\s*(AM|PM)/, "");
    const end_time = (item.end_time).replace(/\s*(AM|PM)/, "");
    const startTime = start_time.split(':');
    const endTime = end_time.split(':');
    console.log(startTime + " " + endTime + workingDays.includes(currentDay))
    // console.log(endTime[0] + " " + date + endTime[1] + "| " + getMin)
    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      console.log("data===========")
      return true;
    }



  }

  return false;
}

async function isHolidays(spid) {
  // Execute the query to get holidays for the given SP_ID
  let getHolidays = await db.excuteQuery('SELECT id, SP_ID, month, DATE_FORMAT(holiday_date,"%Y-%m-%d") as holiday_date FROM holidays WHERE SP_ID = ? AND isDeleted != 1', [spid]);


  // Check if today is a holiday
  const isTodayHoliday = (getHolidays) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
    return getHolidays.some(holiday => {
      const holidayDate = holiday.holiday_date//.toISOString().split('T')[0]; // Extract 'YYYY-MM-DD' from the returned holiday date
      return holidayDate === today;
    });
  };

  if (isTodayHoliday(getHolidays)) {
    console.log("Today is a holiday!");
    return true;
  } else {
    console.log("Today is not a holiday.");
    return false;
  }
}

async function resetContactFields(phoneNumber, spid) {
  try {
    const resetQuery = `
      UPDATE EndCustomer
    SET column1 = NULL,
    column2 = NULL,
    column3 = NULL,
    column4 = NULL,
    column5 = NULL,
    column6 = NULL,
    column7 = NULL,
    column8 = NULL,
    column9 = NULL,
    column10 = NULL,
    column11 = NULL,
    column12 = NULL,
    column13 = NULL,
    column14 = NULL,
    column15 = NULL,
    column16 = NULL,
    column17 = NULL,
    column18 = NULL,
    column19 = NULL,
    column20 = NULL,
    column21 = NULL,
    column22 = NULL,
    column23 = NULL,
    column24 = NULL,
    column25 = NULL,
    ContactOwner = NULL,
    defaultAction_PauseTime =NULL
WHERE Phone_number = ? 
AND SP_ID = ?;`;

    let resetData = await db.excuteQuery(resetQuery, [phoneNumber, spid]);
  } catch (err) {
    console.log("ERR updateContactData", err)
  }
}
async function notifiactionsToBeSent(UID, ID) {
  const usersUID = UID;
  const notificationId = ID;
  let query = `SELECT * FROM TeamboxNotificationSettings WHERE UID = ? AND notificationId= ? AND isDeleted != 1`;
  try {
    const result = await db.excuteQuery(query, [usersUID, notificationId]);
    if (result.length == 0) {
      return false;
    }
    const data = result[0];
    let check;
    if (notificationId == 1) {
      check = data?.PushNotificationValue
    }
    if (notificationId == 2) {
      check = data?.PushNotificationValue
    }
    if (notificationId == 3) {
      check = data?.PushNotificationValue
    }
    if (notificationId == 4) {
      check = data?.PushNotificationValue
    }
    if (check == 1) {
      return true;
    }
    else return false;

  } catch (err) {
    console.error("Error fetching notification settings:", err);
    return false;
  }
}
async function currentlyAssigned(interactionId) {
  const query = `SELECT user.uid 
                   FROM InteractionMapping 
                   JOIN user ON user.uid = InteractionMapping.AgentId 
                   WHERE is_active = 1 
                   AND InteractionMapping.InteractionId = ? 
                   ORDER BY InteractionMapping.MappingId DESC 
                   LIMIT 1`;

  try {
    let result = await db.excuteQuery(query, [interactionId]);
    return result.length > 0 ? result[0].uid : null;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
async function updateHealthStatus(phone_number_id, quality_rating, entered_by, fb_verification, spid) {
  const query = 'UPDATE businessHealth SET quality_rating = ?, entered_by = ?, fb_verification = ? WHERE phone_number_id = ? and SP_ID = ?';
  try {
    let result = await db.excuteQuery(query, [quality_rating, entered_by, fb_verification, phone_number_id, spid]);
    if (!result || result?.affectedRows === 0) {
      console.error('No record updated. Check if phone_number_id exists.');
    } else {
      console.log('Record updated successfully.');
    }
  } catch (error) {
    console.error('Error updating quality rating:', error);
  }
}

async function updateCurrentLimit(phone_number_id, currentLimit, entered_by) {
  const query = 'UPDATE businessHealth SET balance_limit_today = ?, entered_by = ? WHERE phone_number_id = ?';
  try {
    let result = await db.excuteQuery(query, [currentLimit, entered_by, phone_number_id]);
    if (!result || result?.affectedRows === 0) {
      console.error('No record updated. Check if phone_number_id exists.');
    } else {
      console.log('Record updated successfully.');
    }
  } catch (error) {
    console.error('Error updating quality rating:', error);
  }
}


function convertMessagingLimitTier(tier) {
  switch (tier) {
    case 'TIER_50':
      return MessagingLimitTiers.TIER_50;
    case 'TIER_250':
      return MessagingLimitTiers.TIER_250;
    case 'TIER_1K':
      return MessagingLimitTiers.TIER_1K;
    case 'TIER_10K':
      return MessagingLimitTiers.TIER_10K;
    case 'TIER_100K':
      return MessagingLimitTiers.TIER_100K;
    case 'TIER_UNLIMITED':
      return MessagingLimitTiers.TIER_UNLIMITED;
    default:
      return 'Unknown Tier';
  }
}

// Common Function to parse the message template and retrieve {{}} placeholders
function parseMessageTemplate(template) {
  const placeholderRegex = /{{(.*?)}}/g;
  const placeholders = [];
  let match;
  while ((match = placeholderRegex.exec(template))) {
    placeholders.push(match[1]);
  }
  return placeholders;
}

async function getTemplateVariables(msgVar, testMessage, sid, custid) {
  try {
   
    const placeholders = parseMessageTemplate(testMessage);
    if (!placeholders.length) return []; 

   
    const results = msgVar
      ? await removeTags.getDefaultAttribue(msgVar, sid, custid)
      : await removeTags.getDefaultAttribueWithoutFallback(placeholders, sid, custid);

   
    if (!results?.length) return [];

    //  A map of key-value pairs from the results 
    const resultsMap = results.reduce((map, item) => {
      const key = Object.keys(item)[0];
      map[key] = Object.values(item)[0];
      return map;
    }, {});

    // Extract values corresponding to placeholders in the message
    let returnRes = placeholders
      .filter(variable => testMessage.includes(variable)) // Include only variables present in testMessage
      .map(variable => {
        const cleanVariable = variable.replace(/{{|}}/g, ''); 
        return resultsMap[cleanVariable] || null; 
      });
     return replaceEmptyValuesInArray(returnRes)
  } catch (error) {
    console.error("Error in getTemplateVariables:", error);
    return [];
  }
}


let  filterListLanguage = [
  { label: 'Afrikaans', code: 'af', checked: false },
  { label: 'Albanian', code: 'sq', checked: false },
  { label: 'Arabic', code: 'ar', checked: false },
  { label: 'Azerbaijani', code: 'az', checked: false },
  { label: 'Bengali', code: 'bn', checked: false },
  { label: 'Bulgarian', code: 'bg', checked: false },
  { label: 'Catalan', code: 'ca', checked: false },
  { label: 'Chinese (CHN)', code: 'zh_CN', checked: false },
  { label: 'Chinese (HKG)', code: 'zh_HK', checked: false },
  { label: 'Chinese (TAI)', code: 'zh_TW', checked: false },
  { label: 'Croatian', code: 'hr', checked: false },
  { label: 'Czech', code: 'cs', checked: false },
  { label: 'Danish', code: 'da', checked: false },
  { label: 'Dutch', code: 'nl', checked: false },
  { label: 'English', code: 'en', checked: false },
  { label: 'English (UK)', code: 'en_GB', checked: false },
  { label: 'English (US)', code: 'en_US', checked: false },
  { label: 'Estonian', code: 'et', checked: false },
  { label: 'Filipino', code: 'fil', checked: false },
  { label: 'Finnish', code: 'fi', checked: false },
  { label: 'French', code: 'fr', checked: false },
  { label: 'Georgian', code: 'ka', checked: false },
  { label: 'German', code: 'de', checked: false },
  { label: 'Greek', code: 'el', checked: false },
  { label: 'Gujarati', code: 'gu', checked: false },
  { label: 'Hausa', code: 'ha', checked: false },
  { label: 'Hebrew', code: 'he', checked: false },
  { label: 'Hindi', code: 'hi', checked: false },
  { label: 'Hungarian', code: 'hu', checked: false },
  { label: 'Indonesian', code: 'id', checked: false },
  { label: 'Irish', code: 'ga', checked: false },
  { label: 'Italian', code: 'it', checked: false },
  { label: 'Japanese', code: 'ja', checked: false },
  { label: 'Kannada', code: 'kn', checked: false },
  { label: 'Kazakh', code: 'kk', checked: false },
  { label: 'Kinyarwanda', code: 'rw_RW', checked: false },
  { label: 'Korean', code: 'ko', checked: false },
  { label: 'Kyrgyz (Kyrgyzstan)', code: 'ky_KG', checked: false },
  { label: 'Lao', code: 'lo', checked: false },
  { label: 'Latvian', code: 'lv', checked: false },
  { label: 'Lithuanian', code: 'lt', checked: false },
  { label: 'Macedonian', code: 'mk', checked: false },
  { label: 'Malay', code: 'ms', checked: false },
  { label: 'Malayalam', code: 'ml', checked: false },
  { label: 'Marathi', code: 'mr', checked: false },
  { label: 'Norwegian', code: 'nb', checked: false },
  { label: 'Persian', code: 'fa', checked: false },
  { label: 'Polish', code: 'pl', checked: false },
  { label: 'Portuguese (BR)', code: 'pt_BR', checked: false },
  { label: 'Portuguese (POR)', code: 'pt_PT', checked: false },
  { label: 'Punjabi', code: 'pa', checked: false },
  { label: 'Romanian', code: 'ro', checked: false },
  { label: 'Russian', code: 'ru', checked: false },
  { label: 'Serbian', code: 'sr', checked: false },
  { label: 'Slovak', code: 'sk', checked: false },
  { label: 'Slovenian', code: 'sl', checked: false },
  { label: 'Spanish', code: 'es', checked: false },
  { label: 'Spanish (ARG)', code: 'es_AR', checked: false },
  { label: 'Spanish (SPA)', code: 'es_ES', checked: false },
  { label: 'Spanish (MEX)', code: 'es_MX', checked: false },
  { label: 'Swahili', code: 'sw', checked: false },
  { label: 'Swedish', code: 'sv', checked: false },
  { label: 'Tamil', code: 'ta', checked: false },
  { label: 'Telugu', code: 'te', checked: false },
  { label: 'Thai', code: 'th', checked: false },
  { label: 'Turkish', code: 'tr', checked: false },
  { label: 'Ukrainian', code: 'uk', checked: false },
  { label: 'Urdu', code: 'ur', checked: false },
  { label: 'Uzbek', code: 'uz', checked: false },
  { label: 'Vietnamese', code: 'vi', checked: false },
  { label: 'Zulu', code: 'zu', checked: false }
]

const isInvalidParam = (value) => value === null || value === undefined || value === 0 || value === '0' || value === 'undefined';
const getCodeByLabel = (label) => {
  const language = filterListLanguage.find(lang => lang.label === label);
  return language ? language.code : label; // Return the code if found, otherwise return null
};

function replaceEmptyValuesInArray(array) {
   //This helper function will replace values empty and null to "null"
  return array.map((item) => {
    if (Array.isArray(item)) {
      return item.map((subItem) => {
        return (subItem === undefined || subItem === null || subItem === '') ? "null" : subItem;
      });
    } else if (typeof item === 'object' && item !== null) {
      const newItem = { ...item };
      for (const key in newItem) {
        if (newItem[key] === undefined || newItem[key] === null || newItem[key] === '') {
          newItem[key] = "null";
        }
      }
      return newItem;
    }
    return (item === undefined || item === null || item === '') ? "null" : item;
  });
}

module.exports = { isStatusEmpty,getCodeByLabel, getDefaultAttribue, isHolidays, isWorkingTime, resetContactFields, determineMediaFromLink, notifiactionsToBeSent, currentlyAssigned, updateHealthStatus, convertMessagingLimitTier, updateCurrentLimit, getTemplateVariables, isInvalidParam }