const {sendMail}=require("../services/notification.service")




const sendMaiController=async(req, res)=>{
    try {
        
       const responseData = await sendMail();
       res.status(200).json({
        success:true,
        data : responseData
       })


    } catch (error) {
        return res.status(500).json({
            success:false,
            msg : error?.message
        })
    }
}

module.exports={sendMaiController}