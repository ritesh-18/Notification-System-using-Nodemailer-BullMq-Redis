// expose a routes through which another services can send the req regarding notifications
const { notificationQueues } = require("../queues/mail.notification.queues")
const addNotificationInQueue = async (req, res) => {
    try {
        const {email , subject , message}=req.body;
        await notificationQueues.add("notificationQueues", {
            email,
            subject,
            message
        });
        res.status(200).json({
            msg:"notification added in a queue"
        })


    } catch (error) {
          res.status(500).json({
            success:false,
            msg:"somethings went wrong ",
            error:error.message
          })

    }


}

module.exports={addNotificationInQueue}