const { fromEvent } = require("rxjs");
var WebSocketClient = require('websocket').client;
  var client = new WebSocketClient();

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
});

client.connect('ws://localhost:3010/', 'echo-protocol');

function NotifyServer(display_phone_number)
{
    var notificationMsg = {"displayPhoneNumber":display_phone_number, "updateMessage":true};
    if(conn == undefined)
    {
      console.log("client is undefined");
    }
    // console.log(client.connection);
    conn.send(JSON.stringify(JSON.stringify(notificationMsg)));
}


module.exports = { NotifyServer };