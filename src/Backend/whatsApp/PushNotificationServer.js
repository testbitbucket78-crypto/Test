const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var clients = {};
// Handle WebSocket connections
wss.on('connection', (ws) => {
  const data = {
    message: "The message is from websocket at - updated at : " + Date.now(),
    timestamp: Date.now()
  };
  ws.send(JSON.stringify(data));
  // Handle incoming messages from the client
  ws.on('message', (message) => {
    try {
      let msgjson = JSON.parse(JSON.parse(message));
      if (msgjson["UniqueSPPhonenumber"]) {
        console.log("UniqueSPPhonenumber", UniqueSPPhonenumber)
        clients[msgjson["UniqueSPPhonenumber"]] = ws;
        console.log("UniqueSPPhonenumber 1", clients)
        console.log('Active clients : ' + Object.keys(clients).length);
      }
      else if (msgjson["displayPhoneNumber"]) {

        //console.log("displayPhoneNumber", displayPhoneNumber)
        console.log("found message for number : " + msgjson["displayPhoneNumber"]);
        console.log(clients)
        let wsclient = clients[msgjson["displayPhoneNumber"]];
        console.log("wsclient", "---", wsclient)
        console.log(clients)
        if (wsclient != undefined) {
          console("wsclient != undefined")
          wsclient.send(message);
        }

      }
      else {
        console.log("seems like the client to forward this message is not available");
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
