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

async function getDefaultAttribueWithoutFallback(message_variables, spid, customerId) {
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

// getDefaultAttribue with Fallback
async function getDefaultAttribue(message_variables, spid, customerId) {
  try {
    // Parse the input if it is a string
    if (typeof message_variables === 'string') {
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
    const spidCustomColumnsQuery = `SELECT ColumnName, CustomColumn FROM SPIDCustomContactFields WHERE SP_ID=? AND isDeleted != 1`;
    let spidCustomColumns = await db.excuteQuery(spidCustomColumnsQuery, [spid]);
    let spidCustomColumnsMap = new Map();
    spidCustomColumns.forEach(column => {
      spidCustomColumnsMap.set(column.ColumnName, column.CustomColumn);
    });


    // Iterate over each message variable
    for (let i = 0; i < message_variables.length; i++) {
      const message_variable = message_variables[i];
      console.log(`Processing message variable ${i}:`, message_variable);

      // Ensure message_variable is an object and has required keys
      if (typeof message_variable !== 'object' || !message_variable.label || !message_variable.value || !message_variable.fallback) {
        console.error(`Invalid message variable at index ${i}:`, message_variable);
        continue;
      }

      // Strip the curly braces from label and value
      let label = message_variable.label.replace(/{{|}}/g, '').trim();
      let value = message_variable.value.replace(/{{|}}/g, '').trim();
      const fallback = message_variable.fallback;

      

      let result = {};

      // Check if the value exists in EndCustomer columns
      if (endCustomerColumns.includes(value)) {
        const endCustomerQuery = `SELECT ${value} FROM EndCustomer WHERE customerId=? AND isDeleted != 1 AND SP_ID=?`;
        let endCustomerResult = await db.excuteQuery(endCustomerQuery, [customerId, spid]);

        if (endCustomerResult.length > 0 && endCustomerResult[0][value]) {
          result[value] = endCustomerResult[0][value];
        } else {
          result[value] = fallback;
        }
      } 
      // Check if the value exists in SPIDCustomContactFields columns
      else if (spidCustomColumnsMap.has(value)) {
        const customColumn = spidCustomColumnsMap.get(value);
        const endCustomerQuery = `SELECT ${customColumn} FROM EndCustomer WHERE customerId=? AND isDeleted != 1 AND SP_ID=?`;
        let endCustomerResult = await db.excuteQuery(endCustomerQuery, [customerId, spid]);

        if (endCustomerResult.length > 0 && endCustomerResult[0][customColumn]) {
          result[value] = endCustomerResult[0][customColumn];
        } else {
          result[value] = fallback;
        }
      } else {
        console.log(`[${value}] not found in EndCustomer table or SPIDCustomContactFields.`);
        result[value] = fallback;
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
  // result = result.replace(/<span.*?>\s*(.*?)\s*<\/span>/g, '~$1~');
   result = result.replace(/<span\s+[^>]*style="[^"]*\btext-decoration:\s*line-through;[^"]*"[^>]*>(.*?)<\/span>/g, '~$1~'); // Add this because span is also attribute tag
  // Remove any remaining HTML tags
  result = result.replace(/<[^>]*>/g, '');
// Remove specific attributes from <span> tags
//result = result.replace(/(<span\s+[^>]*)\scontenteditable="[^"]*"\sclass="[^"]*"([^>]*>)/g, '$1$2');
// Remove specific attributes from <a> tags
result = result.replace(/\s_ngcontent-[^"]*=""\s?href="mailto:"\s?title="">/g, '');

  return result;
}

function encloseWordsInMatchingTags(sentence) {
  // Regular expression to find opening and closing tags (with nesting support)
  const tagRegex = /<([a-z]+)[^>]*>(.*?)<\/\1>/gi;
  sentence = sentence.replace(
    '<span style="text-decoration: line-through;">',
    '<tempMSpan>'
  );
  sentence = sentence.replace(
    '<span style="color: rgb(0, 0, 0);">',
    '<tempAtSpan>'
  );
  sentence = sentence.replace(
    '<span contenteditable="false" class="e-mention-chip">',
    '<tempFallbackSpan>'
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
  taggedSentence = taggedSentence.replace(
    '<tempAtSpan>',
    '<span style="color: rgb(0, 0, 0);">'
  );
  taggedSentence = taggedSentence.replace(
    '<tempFallbackSpan>',
 '<span contenteditable="false" class="e-mention-chip">',
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
const originalString = `<p><strong>efred</strong></p><p><br></p><p><br></p><p><span style="color: rgb(0, 0, 0);">Z&nbsp; &nbsp;&nbsp;<span style="color: rgb(0, 0, 0);">a&nbsp;&nbsp;<span style="color: rgb(0, 0, 0);">a</span></span></span></p><p><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><strong>bold bold bold bold&nbsp; &nbsp;</strong><br><em>itallic itallic itallic&nbsp;</em><br></span></span></span></p><p><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0);"><span style="text-decoration: line-through;">strick THROUGH&nbsp;</span><br><br><br>Lasht thanlsadjxweos</span></span></span></p><p><br></p><p><br></p><p><br></p>`

// '<p><strong>bold</strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <em>italic&nbsp; &nbsp;<span style="text-decoration: line-through;">strickthrough&nbsp;</span>&nbsp; &nbsp; </em>,</p><p><strong>Hi This is testing of bold itallic strickthrough&nbsp;</strong><br><em>italic itallic dhsfjdjfvb wisdjisd dkiiehfnjikdhn</em><br><span style="text-decoration: line-through;">strickfjd wskdjxiswkhcndi hswjd</span></p><p></p>';
const modifiedString = modifyString(originalString);

//console.log(modifiedString);


async function removeTagsFromMessages(originalString) {
  const modifiedString = modifyString(originalString);

  // console.log("modifiedString",modifiedString);
  let convertedMessageText = convertHTML(removeEmptyTags(modifiedString))
  console.log("convertHTML(removeEmptyTags(modifiedString))",convertedMessageText);
  return convertedMessageText
}


















////////////////////// Date formate converter /////////////////////////

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(inputData) {
  const parsedDate = new Date(inputData);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date or format');
  }
  return parsedDate;
}

function formatDate(inputData, outputFormat) {
  const parsedDate = parseDate(inputData);

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();
  const shortYear = String(year).slice(-2);
  const monthName = monthNames[parsedDate.getMonth()];
  const shortMonthName = shortMonthNames[parsedDate.getMonth()];
  const dayWithoutPadding = parsedDate.getDate();
  const monthWithoutPadding = parsedDate.getMonth() + 1;

  const formatMap = {
    'YYYY': year,
    'YY': shortYear,
    'MONTH': monthName,
    'MTH': shortMonthName,
    'MM': month,
    'M': monthWithoutPadding,
    'DD': day,
    'D': dayWithoutPadding,
  };

  // Replace each format key with the corresponding value in the output format
  let formattedDate = outputFormat;
  for (const [key, value] of Object.entries(formatMap)) {
    formattedDate = formattedDate.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
  }

  return formattedDate;
}


// // Example usage:
// try {
//   const inputData = '2024-12-23'; // your input date
//   const outputFormat = 'MONTH D, YYYY'; // desired output format from the dateFormats list

//   const result = formatDate(inputData, outputFormat);
//   console.log(`Results -----------: ${result}`); // Output: December 23, 2024
// } catch (error) {
//   console.error(error.message);
// }





//***************************************************************** */



// Function to format time
function formatTime(timeString, outputFormat) {
  const [hourStr, minuteStr, secondStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const second = parseInt(secondStr, 10);

  let formattedTime;
  if (outputFormat === '12-hour') {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert hour to 12-hour format
    formattedTime = `${hour12}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} ${period}`;
  } else if (outputFormat === '24-hour') {
    formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  } else {
    throw new Error('Invalid output time format');
  }

  return formattedTime;
}






//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

function convertTimeByTimeZone(timeString, format, targetTimeZone) {
  const is12HourFormat = format.toLowerCase().includes('am') || format.toLowerCase().includes('pm');
  const now = new Date();
  
  // Parse input time string based on its format
  let date;
  if (is12HourFormat) {
    // 12-hour format with AM/PM
    const [timePart, period] = timeString.trim().split(/\s+/);
    const [hourStr, minuteStr, secondStr = '00'] = timePart.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const second = parseInt(secondStr, 10);

    if (/PM/i.test(period) && hour < 12) hour += 12;
    if (/AM/i.test(period) && hour === 12) hour = 0;

    date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
  } else {
    // 24-hour format
    const [hourStr, minuteStr, secondStr = '00'] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const second = parseInt(secondStr, 10);

    date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
  }

  // Convert to target time zone
  const options = {
    timeZone: targetTimeZone,
    hour12: is12HourFormat,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const parts = formatter.formatToParts(date);

  // Constructing the formatted time string
  const timeParts = {};
  parts.forEach(({ type, value }) => {
    timeParts[type] = value;
  });

  let formattedTime;
  if (is12HourFormat) {
    formattedTime = `${timeParts.hour}:${timeParts.minute}:${timeParts.second} ${timeParts.dayPeriod}`;
  } else {
    formattedTime = `${timeParts.hour}:${timeParts.minute}:${timeParts.second}`;
  }

  return formattedTime;
}

// // Example usage:
// try {
//   const timeString1 = '17:41:00'; // 24-hour format input time
//   const timeString2 = '05:54:00 PM'; // 12-hour format input time

//   const result1 = convertTimeByTimeZone(timeString1, '24-hour', 'US/Eastern');
//   const result2 = convertTimeByTimeZone(timeString2, '12-hour', 'US/Eastern');

//   console.log(`Converted time (24-hour): ${result1}`); // Output: Correct converted time in 24-hour format
//   console.log(`Converted time (12-hour): ${result2}`); // Output: Correct converted time in 12-hour format
// } catch (error) {
//   console.error(error.message);
// }



//##################################################################//






function formatDateTimeZone(dateTimeString, outputDateFormat, outputTimeFormat, targetTimeZone) {
  const [datePart, timePart] = dateTimeString.split(' ');
  const formattedDate = formatDate(datePart, outputDateFormat);
  const formattedTime = formatTime(timePart, outputTimeFormat);
  const convertedTime = convertTimeByTimeZone(timePart, outputTimeFormat, targetTimeZone);

  return `${formattedDate} ${formattedTime} ${targetTimeZone} (Converted time: ${convertedTime})`;
}




// Example usage:
try {
  const dateTimeString = '2024-05-22 13:44:23';
  const outputDateFormat = 'D-M-YY';
  const outputTimeFormat = '12-hour'; // or '24-hour'

  const targetTimeZone = 'Asia/Calcutta';

  const result = formatDateTimeZone(dateTimeString, outputDateFormat, outputTimeFormat, targetTimeZone);
  console.log(`jyhy                  Formatted DateTime: ${result}`);
} catch (error) {
  console.error(error.message);
}

module.exports = { removeTagsFromMessages, getDefaultAttribue,getDefaultAttribueWithoutFallback }