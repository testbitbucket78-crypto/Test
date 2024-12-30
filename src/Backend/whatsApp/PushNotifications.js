/*const { fromEvent } = require("rxjs");
var WebSocketClient = require('websocket').client;
  var client = new WebSocketClient();


  // Assuming connection is an object with a send method
const dataToSend = {
  "Ping": {
    message : "Ping alive from Backend"
  }
};

const jsonData = JSON.stringify(dataToSend);

var conn;
client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
  conn = connection;
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
      if (message.type === 'utf8') {
          console.log("Received: '" + message.utf8Data + "'");
      }
  });
  setInterval(() => {      
    connection.send(jsonData)
     }, 30000);
});

//client.connect('ws://localhost:3010/', 'echo-protocol');
client.connect('ws://52.66.172.213:3010/', 'echo-protocol');
function NotifyServer(display_phone_number,updatemessage,message,status,msg_status,msg_id)
{
  try{
    var notificationMsg ={};
    if(updatemessage == true){           //For webhhok teambox msg update
    notificationMsg= {"displayPhoneNumber":display_phone_number, "updateMessage":true};
    }else if(message != undefined){    // notify message
      notificationMsg= {"displayPhoneNumber":display_phone_number,"message":message,"status" : status ,"msg_status":msg_status,"msg_id":msg_id}; //msg_status means IN and Out Types
    }


    if(conn == undefined)
    {
      console.log("client is undefined");
    }
    // console.log("client.connection",notificationMsg,"updatemessage,message",updatemessage,message);
    conn.send(JSON.stringify(notificationMsg));
  }catch(err){
    console.log("Notify Err" ,err)
  }
}


module.exports = { NotifyServer }; */





const { io } = require("socket.io-client");

const socket = io('ws://52.66.172.213:3010/'); 

const dataToSend = {
  "Ping": {
    message: "Ping alive from Backend"
  }
};


socket.on("connect", () => {
  console.log('Socket.IO Client Connected');
});


socket.on('connect_error', (error) => {
  console.error('Connection Error:', error);
});


setInterval(() => {
  socket.emit('ping', dataToSend);
}, 30000);


socket.on('message', (message) => {
  console.log("Received:", message);
});

function NotifyServer(display_phone_number, updatemessage, message, status, msg_status, msg_id) {
  try {
    let notificationMsg = {};
    if (updatemessage) {
      notificationMsg = { displayPhoneNumber: display_phone_number, updateMessage: true };
    } else if (message) {
      notificationMsg = {
        displayPhoneNumber: display_phone_number,
        message: message,
        status: status,
        msg_status: msg_status,
        msg_id: msg_id
      };
    }

    if (!socket.connected) {
      console.error("Socket is not connected");
      return;
    }

    socket.emit('message', notificationMsg);
  } catch (err) {
    console.error("Notify Error:", err);
  }
}
class WebSocketManager {
  constructor(url, interval = 30000) {
      if (!url) {
          throw new Error("WebSocket URL is required");
      }
      this.url = url;
      this.interval = interval;
      this.socket = null;
      this.isConnected = false;
      this.pingInterval = null;
  }

  connect() {
      return new Promise((resolve, reject) => {
          this.socket = io(this.url, {
              reconnection: true,
              timeout: 5000,
          });

          this.socket.on("connect", () => {
              console.log("WebSocket connected to:", this.url);
              this.isConnected = true;
              resolve("WebSocket connected successfully!");
          });

          this.socket.on("connect_error", (error) => {
              console.error("Connection Error:", error.message);
              this.isConnected = false;
              reject(new Error("WebSocket connection failed"));
          });

          this.socket.on("disconnect", (reason) => {
              console.warn("WebSocket disconnected:", reason);
              this.isConnected = false;
              this.stopPing();
          });
      });
  }

  emit(event, data) {
      if (this.isConnected) {
          console.log(`Emitting event: ${event}`, data);
          this.socket.emit(event, data);
      } else {
          console.warn("Cannot emit, WebSocket is not connected");
      }
  }

  startPing() {
      if (!this.pingInterval) {
          this.pingInterval = setInterval(() => {
              const dataToSend = {
                  "Ping": {
                      message: "Ping alive from Backend",
                  },
              };
              this.emit("ping", dataToSend);
          }, this.interval);
      }
  }

  stopPing() {
      if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
      }
  }

  disconnect() {
      if (this.socket) {
          this.stopPing();
          this.socket.disconnect();
          console.log("WebSocket disconnected");
      }
  }
}



module.exports = { NotifyServer, WebSocketManager };
