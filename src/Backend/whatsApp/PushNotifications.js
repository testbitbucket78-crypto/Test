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

async function NotifyServer(display_phone_number, updatemessage, message, status, msg_status, msg_id) {
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
      let spid = await db.excuteQuery('select SPID from Message where Message_id =?', msg_id);
      let websocketurl = await db.excuteQuery('select webhook_url from UserAPIKeys where spid =?', spid);
      //select SPID from Message where Message_id = 34911
      sendDataToWebSocket(websocketurl,notificationMsg)
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

module.exports = { NotifyServer };
