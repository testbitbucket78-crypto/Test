
const express=require('express')
const router=require('./router.js')
const bodyParser = require('body-parser');
const db = require("../dbhelper");
const userController=require('./user.js');
const indexController=require('./index.js');
const val = require('./constant');
const cors=require('cors')
const app=express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',router);
process.on('beforeExit', code => {
  // Can make asynchronous calls
  setTimeout(async () => {
    const consoleOutput = `Auth :: Process will exit with code: ${code}`;
    console.log(consoleOutput);
   
    try {
      var result= await db.excuteQuery(val.crachlogQuery, [consoleOutput])
      console.log(result)
    } catch (err) {
      console.error(err);
    
    }
    process.exit(code);
  }, 100);
});

process.on('exit', async code => {
  // Only synchronous calls
  const consoleOutput = `Auth :: Process exited with code: ${code}`;
  console.log(consoleOutput);
  try {
    var result= await db.excuteQuery(val.crachlogQuery, [consoleOutput])
    console.log(result)
  } catch (err) {
    console.error(err);
  
  }
});

process.on('SIGTERM', async signal => {
  const consoleOutput = `Auth :: Process ${process.pid} received a SIGTERM signal`;
  console.log(consoleOutput);
  try {
    var result= await db.excuteQuery(val.crachlogQuery, [consoleOutput])
    console.log(result)
  } catch (err) {
    console.error(err);
  
  }
  process.exit(0);
});

process.on('SIGINT', async signal => {
  const consoleOutput = `Auth :: Process ${process.pid} has been interrupted`;
  console.log(consoleOutput);
  try {
    var result= await db.excuteQuery(val.crachlogQuery, [consoleOutput])
    console.log(result)
  } catch (err) {
    console.error(err);
  
  }
  process.exit(0);
});

process.on('uncaughtException', async err => {
  const consoleOutput = `Auth :: Uncaught Exception: ${err.message}`;
  console.log(consoleOutput);
  try {
    var result= await db.excuteQuery(val.crachlogQuery, [consoleOutput])
    console.log(result)
  } catch (err) {
    console.error(err);
  
  }
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  const consoleOutput = `Auth :: Unhandled rejection at ${promise}, reason: ${reason.message}`;
  console.log(consoleOutput);
  try {
    var result= await db.excuteQuery(val.crachlogQuery, [consoleOutput])
    console.log(result)
  } catch (err) {
    console.error(err);
  
  }
  process.exit(1);
});

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});

