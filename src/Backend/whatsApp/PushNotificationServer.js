/*const express = require('express');
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
        // Check if the client already exists and close the existing WebSocket connection if it does
        if (clients[msgjson["UniqueSPPhonenumber"]]) {
            clients[msgjson["UniqueSPPhonenumber"]].close();
            delete clients[msgjson["UniqueSPPhonenumber"]];
        }
    
        // Assign the new WebSocket instance to the client
        clients[msgjson["UniqueSPPhonenumber"]] = ws;
    
        if (spAgentMapping[msgjson["spPhoneNumber"]] === undefined) {
            spAgentMapping[msgjson["spPhoneNumber"]] = [];
        }
    
        if (!spAgentMapping[msgjson["spPhoneNumber"]].includes(msgjson["UniqueSPPhonenumber"])) {
            spAgentMapping[msgjson["spPhoneNumber"]].push(msgjson["UniqueSPPhonenumber"]);
        }
    
        console.log('Active clients : ' + Object.keys(clients).length);
    } else if (msgjson["displayPhoneNumber"]) {
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
  }); already commented ------ */

/*
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
}); */











const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('../common/logger.log');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let clients = {};
let spAgentMapping = {};
function parseJSONObject(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}


const pingInterval = 30000; // 30 seconds
const pingMessage = JSON.stringify({
  Ping: { message: "Ping alive from Notify server Backend" }
});

function sendPing() {
  io.emit('ping', pingMessage);
}
setInterval(sendPing, pingInterval);


io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);


  socket.emit('message', {
    message: "Connected to WebSocket server",
    timestamp: Date.now()
  });


  socket.on('message', (msg) => {
    try {
      const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
      const msgjson = parseJSONObject(message);
  
      if (!msgjson) return;
  
      if (msgjson.UniqueSPPhonenumber) {
        for (let key in clients) {
          if (clients.hasOwnProperty(key)) {
            if (clients[key]== msgjson["UniqueSPPhonenumber"]) {
              //clients[key].close();
              delete clients[key];
          }
          }
        }
        
        const uniquePhone = msgjson.UniqueSPPhonenumber;
        clients[socket.id] = uniquePhone;
  
        if (!spAgentMapping[msgjson.spPhoneNumber]) {
          spAgentMapping[msgjson.spPhoneNumber] = [];
        }
  
        // Avoid duplicates in `spAgentMapping`
        if (!spAgentMapping[msgjson.spPhoneNumber].includes(uniquePhone)) {
          spAgentMapping[msgjson.spPhoneNumber].push(uniquePhone);
        }
  
        console.log(`Client connected with phone: ${uniquePhone}`);
        console.log('Active clients after connection:', JSON.stringify(clients, null, 2));
      } else if (msgjson.displayPhoneNumber) {
        // Handle messages for a specific `displayPhoneNumber`
        const targetPhone = msgjson.displayPhoneNumber;
  
        if (spAgentMapping[targetPhone]) {
          // Create a set to ensure unique socket IDs
          const uniqueSocketIds = new Set();
  
          spAgentMapping[targetPhone].forEach((uniqueSPPhone) => {
            const targetSocketId = Object.keys(clients).find(
              id => clients[id] === uniqueSPPhone
            );
  
            if (targetSocketId) {
              uniqueSocketIds.add(targetSocketId);
            } else {
              console.log(`Socket for ${uniqueSPPhone} is undefined`);
            }
          });
  
          // Emit message only once to each unique socket ID
          uniqueSocketIds.forEach((socketId) => {
            io.sockets.sockets.get(socketId)?.emit('message', msgjson);
          });
        }
      } else {
        console.log("Received unrecognized message:", message);
      }
    } catch (error) {
      console.log("Error processing message:", error);
    }
  });
  


  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);

    //  if the client exists in the `clients` object
    if (clients[socket.id]) {
      const disconnectedUniquePhone = clients[socket.id];
      delete clients[socket.id]; // Remove the client from the active clients list

      // Use the `spPhoneNumber` stored in the socket
      if (socket.spPhoneNumber && spAgentMapping[socket.spPhoneNumber]) {
        spAgentMapping[socket.spPhoneNumber] = spAgentMapping[socket.spPhoneNumber].filter(
          phone => phone !== disconnectedUniquePhone
        );
      }
      console.log(`Client ${disconnectedUniquePhone} disconnected`);
    }


    console.log('Active clients after disconnection:', JSON.stringify(clients, null, 2));
  });
});


async function sendDataToWebSocket(webSocketUrl, data) {
  try {
      const socket = io(webSocketUrl, {
          transports: ['websocket'], 
          reconnectionAttempts: 3,  
      });

      socket.on('connect', () => {
          console.log('Connected to WebSocket:', webSocketUrl);

          socket.emit('message', data);
          console.log('Data sent:', data);

          setTimeout(() => {
              socket.disconnect();
              console.log('Disconnected from WebSocket');
          }, 1000); 
      });

      socket.on('connect_error', (err) => {
          console.error('Connection error:', err.message);
      });

      socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
      });
  } catch (error) {
      console.error('Error sending data to WebSocket:', error.message);
  }
}

const port = 3010;
server.listen(port, () => {
  console.log(`Socket.IO server started on port ${port}`);
});

