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
    result = result.replace(/(.*?)\s+<\/strong>/g, '$1</strong> ');

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



   
// let message_varible = "[{\"label\":\"{{Name}}\",\"value\":\"Name\"},{\"label\":\"{{Phone_number}}\",\"value\":\"CountryCode\"}]"

// async function getDefaultAttribue(message_varible, spid) {
//     try {
//         let query = `SELECT * FROM SPIDCustomContactFields WHERE SP_ID=? AND ColumnName=? AND isDeleted != 1`;
//         try{
//             let result = await db.excuteQuery(query, [spid, message_varible]);
//         }catch(err){
//             console.log(err)
//         }
     
//         console.log("getColumn", result);
//     } catch (err) {
//         console.log(err);
//     }
// }

// getDefaultAttribue('CountryCode', 35);

module.exports = { removeTagsFromMessages }