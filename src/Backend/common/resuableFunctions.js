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
        console.log("string", message_variables);
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
        console.log(`Processing message variable ${i}:`, message_variable);
  
        let result = {};
  
        // Check if the message_variable exists in EndCustomer columns
        if (endCustomerColumns.includes(message_variable)) {
          const endCustomerQuery = `SELECT ${message_variable} FROM EndCustomer WHERE customerId=? AND isDeleted != 1 AND SP_ID=?`;
          let endCustomerResult = await db.excuteQuery(endCustomerQuery, [customerId, spid]);
          console.log(endCustomerResult);
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
  

  module.exports  ={isStatusEmpty,getDefaultAttribue}