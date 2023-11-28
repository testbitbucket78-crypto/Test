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
       
        spAgentMapping[msgjson["spPhoneNumber"]].push(msgjson["UniqueSPPhonenumber"]);
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
  ws.on('close', () => {
    let tempClients = {};
    Object.keys(clients).forEach(key => {
      if (clients[key] == ws) {
        console.log('Client disconnected : ' + key);
      }
      else {
        tempClients[key] = clients[key];
      }
    })
    clients = tempClients;
    console.log('Client disconnected. Now active clients : ' + Object.keys(clients).length);
  });
});

// Start the server
const port = 3010;
server.listen(port, () => {
  console.log(`WebSocket server started on port ${port}`);
});
