const db = require('../dbhelper');
async function isStatusEmpty(InteractionId, spid,cusid) {
    try {
      let isUpdateTime ;
      let isNewContact = await db.excuteQuery('select * from Interaction where interaction_status =? and customerId = ? and SP_ID=? and IsTemporary !=1 and is_deleted !=1', ['empty', cusid, spid]);
      let getInteractionStatus = await db.excuteQuery('select * from Interaction where interaction_status =? and InteractionId = ? and SP_ID=? and IsTemporary !=1 and is_deleted !=1', ['empty', InteractionId, spid]);
      if(isNewContact?.length ==1 && getInteractionStatus.length >0){
        isUpdateTime = 1;
      }else if(getInteractionStatus.length >0){
        isUpdateTime =0;
      }
     console.log("isUpdateTime",isUpdateTime)
  
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
    try{
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
    } catch(error){
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

  async function resetContactFields(phoneNumber,spid) {
    try{
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

      let resetData = await db.excuteQuery(resetQuery,[phoneNumber,spid]);
    }catch(err){
      console.log("ERR updateContactData",err)
    }
  }


  module.exports  ={isStatusEmpty,getDefaultAttribue,isHolidays,isWorkingTime,resetContactFields,determineMediaFromLink}