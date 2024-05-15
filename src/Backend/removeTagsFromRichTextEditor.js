const db = require('./dbhelper');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// fixes by saurabh sir
// async function removeTagsFromMessages(message_content) {
//     // Replace <p> and <br> tags with newline characters
//     let result = message_content.replace(/<p>/g, '\n').replace(/<br>/g, '\n');
//     //console.log(result);
//     // Replace <strong> tags with asterisks
//     result = result.replace(/<em>\s+(.*?)/g, ' <em>$1');
//     result = result.replace(/(.*?)\s+<\/em>/g, '$1</em> ');
//     result = result.replace(/<strong>\s+(.*?)/g, ' <strong>$1');
//     result = result.replace(/(.*?)\s+<\/strong>/g, '$1</stmessage_variblerong> ');

//     // console.log(result);
//     result = result.replace(/<strong>(.*?)<\/strong>/g, '*$1*');
//     //console.log(result);

//     // Replace <em> tags with underscores

//     result = result.replace(/<em>(.*?)<\/em>/g, '_$1_');
//     // Replace <span> tags with strikethrough
//     //result = result.replace(/<span.*?>\s*(.*?)\s*<\/span>/g, '~$1~ ');
//     result = result.replace(/<span\s+[^>]*style="[^"]*\btext-decoration:\s*line-through;[^"]*"[^>]*>(.*?)<\/span>/g, '~$1~'); // Add this because span is also attribute tag
//     // Remove any remaining HTML tags
//     result = result.replace(/<[^>]*>/g, '');

//     result = result.replace(/&nbsp;/g, ' ');

//     return result;
// }



   
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




function convertHTML(htmlString) {
    // Replace <p> and <br> tags with newline characters
  
    let result = htmlString.replace(/<p>/g, '\n').replace(/<br>/g, '\n');
    result = result.replace(/<strong>(.*?)<\/strong>/g, '*$1*');
    // Replace <em> tags with underscores
    result = result.replace(/<em>(.*?)<\/em>/g, '_$1_');
    //Replace attributes tag
    // result = result.replace(
    //   /<span style="color: rgb\(0, 0, 0\);">(.*?)<\/span>/g,
    //   ''
    // );
    // Replace <span> tags with strikethrough
    result = result.replace(/<span.*?>\s*(.*?)\s*<\/span>/g, '~$1~');
    // Remove any remaining HTML tags
    result = result.replace(/<[^>]*>/g, '');
  
    return result;
  }
  
  function encloseWordsInMatchingTags(sentence) {
    // Regular expression to find opening and closing tags (with nesting support)
    const tagRegex = /<([a-z]+)[^>]*>(.*?)<\/\1>/gi;
    sentence = sentence.replace(
      '<span style="text-decoration: line-through;">',
      '<tempMSpan>'
    );
  
    let taggedSentence = sentence;
    let match;
  
    // Loop through all tag matches
    while ((match = tagRegex.exec(sentence)) !== null) {
      const tag = match[1].toLowerCase(); // Extract and lowercase the tag name
      const innerText = match[2]; // Capture the content within the tags
  
      // Replace with wrapped words (preserve attributes)
      const fullTag = match[0]; // Capture the entire matched tag with attributes
      taggedSentence = taggedSentence.replace(
        fullTag,
        innerText
          .split(/\s+/)
          .map((word) => `<${tag}>${word}</${tag}>`)
          .join(' ')
      );
    }
    taggedSentence = taggedSentence.replace(
      '<tempMSpan>',
      '<span style="text-decoration: line-through;">'
    );
    return taggedSentence;
  }
  
  function modifyString(htmlString) {
    // Replace non-breaking space with a regular space
    const modifiedString = htmlString.replace(/&nbsp;/g, ' ');
  
    // Split strikethrough text in second paragraph (optional)
    const paragraphs = modifiedString.split(/<p>/);
    if (paragraphs.length > 1) {
      paragraphs[1] = paragraphs[1].replace(
        /<span style="text-decoration: line-through;">(.*?)<\/span>/,
        (match, content) => {
          return `<span style="text-decoration: line-through;">${content.split(
            ' '
          )}</span>`;
        }
      );
    }
  
    // Enclose words in all paragraphs
    for (let i = 0; i < paragraphs.length; i++) {
      paragraphs[i] = encloseWordsInMatchingTags(paragraphs[i]);
    }
  
    return paragraphs.join('<p>');
  }
  function removeEmptyTags(htmlString) {
    // Regular expression to find empty tags
    const emptyTagRegex = /<([a-z]+)[^>]*>(?:\s*|&nbsp;)*?<\/\1>/gi;
   
    return htmlString.replace(emptyTagRegex, '');
  }
  
  // Example usage
  const originalString =`<p><strong>efred</strong></p><p><br></p><p><br></p><p><span style="color: rgb(0, 0, 0);">Z&nbsp; &nbsp;&nbsp;<span style="color: rgb(0, 0, 0);">a&nbsp;&nbsp;<span style="color: rgb(0, 0, 0);">a</span></span></span></p><p><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><strong>bold bold bold bold&nbsp; &nbsp;</strong><br><em>itallic itallic itallic&nbsp;</em><br></span></span></span></p><p><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><span style="text-decoration: line-through;">strick THROUGH&nbsp;</span><br><br><br>Lasht thanlsadjxweos</span></span></span></p><p><br></p><p><br></p><p><br></p>`

   // '<p><strong>bold</strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <em>italic&nbsp; &nbsp;<span style="text-decoration: line-through;">strickthrough&nbsp;</span>&nbsp; &nbsp; </em>,</p><p><strong>Hi This is testing of bold itallic strickthrough&nbsp;</strong><br><em>italic itallic dhsfjdjfvb wisdjisd dkiiehfnjikdhn</em><br><span style="text-decoration: line-through;">strickfjd wskdjxiswkhcndi hswjd</span></p><p></p>';
  const modifiedString = modifyString(originalString);
  
  // console.log(modifiedString);
  
  // console.log(convertHTML(removeEmptyTags(modifiedString)));

  async function removeTagsFromMessages(originalString){
    const modifiedString = modifyString(originalString);
  
   // console.log(modifiedString);
    let  convertedMessageText = convertHTML(removeEmptyTags(modifiedString))
   // console.log(convertHTML(removeEmptyTags(modifiedString)));
    return convertedMessageText
  }

module.exports = { removeTagsFromMessages,getDefaultAttribue }