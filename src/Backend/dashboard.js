var express = require("express");
var app = express();

app.get('/', function(req, res){
  var data = 

    {
  "Subscribers":
    [
      { "id": 1, "title": "Total Subscribers", "count": 0 },
      { "id": 2, "title": "Active Subscribers", "count": 0 },
      { "id": 3, "title": "Inactive Subscribers", "count": 0 }
    ],
  "Interactions":
  [
      { "id": 1, "title": "Open Interactions", "count": 0 },
      { "id": 2, "title": "Closed Interactions", "count": 0 },
      { "id": 3, "title": "Total Interactions", "count": 0 }
  ],
  "Campaigns":
  [
      { "id": 1, "title": "Scheduled Campaigns", "count": 0 },
      { "id": 2, "title": "Delivered Campaigns", "count": 0 },
      { "id": 3, "title": "Pending Campaigns", "count": 0 },
      { "id": 4, "title": "Failed Campaigns", "count": 0 }
  ], 
  "Agents":
   [
      { "id": 1, "title": "Total Agents", "count": 0 },
      { "id": 2, "title": "Active Agents", "count": 0 },
      { "id": 3, "title": "Inactive Agents", "count": 0 }
   ]
  }
  

//];
   res.send(data);
});

app.listen(3001);
