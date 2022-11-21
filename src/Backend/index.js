var express = require('express');
var app = express();

const CampaignRoute = require("./campaign");
const DashboardRoute = require("./dashboard");
const AutomationRoute = require("./automation");
const ContactRoute = require("./contact");

app.use('/campaign',CampaignRoute);
app.use('/dashboard',DashboardRoute);
app.use('/automation',AutomationRoute);
app.use('/contact',ContactRoute);


app.listen(3000);