const db = require('./dbhelper');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// fixes by saurabh sir
async function removeTagsFromMessages(message_content) {
    // Replace <p> and <br> tags with newline characters
    let result = message_content.replace(/<p>/g, '\n').replace(/<br>/g, '\n');
    //console.log(result);
    // Replace <strong> tags with asterisks
    result = result.replace(/<em>\s+(.*?)/g, ' <em>$1');
    result = result.replace(/(.*?)\s+<\/em>/g, '$1</em> ');
    result = result.replace(/<strong>\s+(.*?)/g, ' <strong>$1');
    result = result.replace(/(.*?)\s+<\/strong>/g, '$1</stmessage_variblerong> ');

    // console.log(result);
    result = result.replace(/<strong>(.*?)<\/strong>/g, '*$1*');
    //console.log(result);

    // Replace <em> tags with underscores

    result = result.replace(/<em>(.*?)<\/em>/g, '_$1_');
    // Replace <span> tags with strikethrough
    //result = result.replace(/<span.*?>\s*(.*?)\s*<\/span>/g, '~$1~ ');
    result = result.replace(/<span\s+[^>]*style="[^"]*\btext-decoration:\s*line-through;[^"]*"[^>]*>(.*?)<\/span>/g, '~$1~'); // Add this because span is also attribute tag
    // Remove any remaining HTML tags
    result = result.replace(/<[^>]*>/g, '');

    result = result.replace(/&nbsp;/g, ' ');

    return result;
}



   
 let message_varible = "[{\"label\":\"{{Name}}\",\"value\":\"Name\"},{\"label\":\"{{Phone_number}}\",\"value\":\"CountryCode\"}]"

 async function getDefaultAttribue(message_variables, spid ,customerId) {
    try {
        let results = [];

        // Fetch all column names from EndCustomer table
        const endCustomerColumnsQuery = `SHOW COLUMNS FROM EndCustomer`;
        let endCustomerColumns = await db.excuteQuery(endCustomerColumnsQuery);
        endCustomerColumns = endCustomerColumns.map(column => column.Field);
        
        // Fetch all column names from SPIDCustomContactFields table
        const spidCustomColumnsQuery = `SELECT ColumnName, CustomColumn FROM SPIDCustomContactFields WHERE SP_ID=? AND isDeleted != 1`;
        let spidCustomColumns = await db.excuteQuery(spidCustomColumnsQuery, [spid]);
        let spidCustomColumnsMap = new Map();
        spidCustomColumns.forEach(column => {
            spidCustomColumnsMap.set(column.ColumnName, column.CustomColumn);
        });
        
        for (let i = 0; i < message_variables.length; i++) {
            const message_variable = message_variables[i];
            let result = {};
            
            // Check if message_variable exists in EndCustomer columns
            if (endCustomerColumns.includes(message_variable)) {
                const endCustomerQuery = `SELECT ${message_variable} FROM EndCustomer WHERE customerId=? and isDeleted !=1 and SP_ID=?`;
                let endCustomerResult = await db.excuteQuery(endCustomerQuery, [customerId, spid]);
                
                if (endCustomerResult.length > 0 && endCustomerResult[0][message_variable]) {
                    result[message_variable] = endCustomerResult[0][message_variable];
                }
            } else if (spidCustomColumnsMap.has(message_variable)) {
                const customColumn = spidCustomColumnsMap.get(message_variable);
                const endCustomerQuery = `SELECT ${customColumn} FROM EndCustomer WHERE customerId=? and isDeleted !=1 and SP_ID=?`;
                let endCustomerResult = await db.excuteQuery(endCustomerQuery, [customerId, spid]);
                
                if (endCustomerResult.length > 0 && endCustomerResult[0][customColumn]) {
                    result[message_variable] = endCustomerResult[0][customColumn];
                }
            } else {
                console.log(`[${message_variable}] not found in EndCustomer table or SPIDCustomContactFields.`);
            }

            results.push(result);
        }

        return results;
    } catch (err) {
        console.log("Error:", err);
        return [];
    }
}

// const value = setTimeout(async () => {
//     const results = await getDefaultAttribue(['Name','CountryCode','displayPhoneNumber'], 35,4931);
//     console.log(results);
// }, 10000);




module.exports = { removeTagsFromMessages,getDefaultAttribue }