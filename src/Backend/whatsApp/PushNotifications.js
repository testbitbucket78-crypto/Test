const { fromEvent } = require("rxjs");
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
      notificationMsg= {"displayPhoneNumber":display_phone_number,"message":message,"status" : status ,"msg_status":msg_status,"msg_id":msg_id};
    }


    if(conn == undefined)
    {
      console.log("client is undefined");
    }
     console.log("client.connection",notificationMsg,"updatemessage,message",updatemessage,message);
    conn.send(JSON.stringify(notificationMsg));
  }catch(err){
    console.log("Notify Err" ,err)
  }
}


module.exports = { NotifyServer };