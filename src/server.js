const express = require('express');
const {notificationrouter}=require('./routers/notification.routers')
const {intiTransport}=require('./config/nodemail.config')
 const {serverAdapter} = require("./config/bullmq.config");

 const {redis}=require("./config/redis.config")
 const {initWorker}=require("./workers/bullmq.workers")
require('dotenv').config();
const app=express();
const PORT=process.env.PORT || 9999;

app.use(express.json())
app.use(''  , notificationrouter)

app.use("/admin/queues", serverAdapter.getRouter());
app.get('/ping' , (req, res)=>{
    res.json({
        msg:"server is running",
        date:new Date()
    })
})
async function startServer(){

    await intiTransport();
     initWorker()

    app.listen(PORT , ()=>{
        console.log("app is running at", `http://localhost:${PORT}/ping`)
    })

}

startServer();
