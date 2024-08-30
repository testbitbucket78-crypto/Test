const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var clients = {};
var spAgentMapping = {};
function parseJSONObject(jsonString) {
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  }
  catch (e) { }
  return false;
}

// Periodically send ping messages to all clients
const pingInterval = 30000; // Interval in milliseconds (30 seconds)

  // Assuming connection is an object with a send method
  const dataToSend = {
    "Ping": {
      message : "Ping alive from Noify server Backend"
    }
  };
  const jsonData = JSON.stringify(dataToSend);
// Function to send a ping message to all connected clients
function sendPing() {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  });
}
//const pingIntervalId = setInterval(sendPing, pingInterval);

// Handle WebSocket connections
wss.on('connection', (ws) => {
  const data = {
    message: "The message is from websocket at - updated at : " + Date.now(),
    timestamp: Date.now()
  };
  ws.send(JSON.stringify(data));
  // Handle incoming messages from the client
  ws.on('message', (msg, isBinary) => {
    try {
      var message = isBinary ? msg : msg.toString();
      let msgjson = parseJSONObject(message);
      if (msgjson === false) { msgjson = parseJSONObject(JSON.parse(message)); }
      if (msgjson["UniqueSPPhonenumber"]) {
        clients[msgjson["UniqueSPPhonenumber"]] = ws;
        if( spAgentMapping[msgjson["spPhoneNumber"]] == undefined){
          spAgentMapping[msgjson["spPhoneNumber"]] = [];
        }
        
       if(!(spAgentMapping[msgjson["spPhoneNumber"]].includes(msgjson["UniqueSPPhonenumber"]))){
        spAgentMapping[msgjson["spPhoneNumber"]].push(msgjson["UniqueSPPhonenumber"]);
       }
        // console.log("UniqueSPPhonenumber 1", clients)
        console.log('Active clients : ' + Object.keys(clients).length);

      }
      else if (msgjson["displayPhoneNumber"]) {
        Object.keys(spAgentMapping).forEach(function (k) {
          if (k == msgjson["displayPhoneNumber"]) {
            spAgentMapping[k].forEach((item) => {
              console.log("found message for number : " + msgjson["displayPhoneNumber"]);
              console.log("found item for spid : " + item);
              // console.log(clients)
              let wsclient = clients[item];
              // console.log("wsclient", "---", wsclient)
              // console.log(clients)
              if (wsclient != undefined) {
                wsclient.send(JSON.stringify(message));
              }
              else {
                console.log("wsClient is undefined");
                var keys = Object.keys(clients);
                console.log('obj contains ' + keys.length + ' keys: ' + keys);
              }
            })

          }
        });


      }
      else if (message.trim() == "ping alive switch") {
       // console.log("ping alive switch");//TODO: remove console.log when you move to production;
      }
      else {
        console.log(message);
        // console.log("seems like the client to forward this message is not available");
      }
    }
    catch (e) {
      console.log("the given message is not in JSON format");
      console.log(e);
    }
  });

  // Handle WebSocket connection close
 /* ws.on('close', () => {
    let tempClients = {};
    Object.keys(clients).forEach(key => {
      if (clients[key] == ws) {
        console.log('Client disconnected : ' + key);
        //spAgentMapping[[key][inside]]
      }
      else {
        tempClients[key] = clients[key];
      }
    })
    clients = tempClients;
    console.log('Client disconnected. Now active clients : ' + Object.keys(clients).length);
  });*/


  ws.on('close', () => {
    let tempClients = {};
    let keysToRemove = []; // To keep track of keys to remove from spAgentMapping
  
    // Iterate over all clients
    Object.keys(clients).forEach(key => {              //clients = {  "12345": wsA,  "54321": wsB };
      if (clients[key] === ws) {
        console.log('Client disconnected : ' + key);                 
  
        // Find and remove the client from spAgentMapping
        Object.keys(spAgentMapping).forEach(spKey => {       // spAgentMapping object  ex  spAgentMapping = { "67890": ["12345", "54321"] };
        
          const index = spAgentMapping[spKey].indexOf(key);
          if (index > -1) {
            // Remove the key (phone number) from the spAgentMapping array
            spAgentMapping[spKey].splice(index, 1);
  
            // If the spAgentMapping array is empty after removal, mark it for deletion
            if (spAgentMapping[spKey].length === 0) {
              keysToRemove.push(spKey);
            }
          }
        });
      } else {
        // Retain the clients that are not disconnected
        tempClients[key] = clients[key];
      }
    });
  
    // Delete empty mappings from spAgentMapping
    keysToRemove.forEach(key => {
      delete spAgentMapping[key];
    });
  
    // Update the clients object with the remaining active connections
    clients = tempClients;
    console.log('Client disconnected. Now active clients : ' + Object.keys(clients).length);
  });
  

});

// Start the server
const port = 3010;
server.listen(port, () => {
  console.log(`WebSocket server started on port ${port}`);
});
