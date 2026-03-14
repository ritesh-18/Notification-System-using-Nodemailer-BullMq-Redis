const express=require('express');
const { sendMaiController } = require('../controllers/notification.controllers');
const { addNotificationInQueue } = require('../controllers/notification.client.controller');

const notificationrouter=express.Router();


notificationrouter.post('/send/mail' , sendMaiController)
notificationrouter.post('/add/notification' ,addNotificationInQueue )


module.exports={notificationrouter}