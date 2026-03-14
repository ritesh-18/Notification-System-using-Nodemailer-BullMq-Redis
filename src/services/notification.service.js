//import the nodemail transporter obj
const {getTransporter} = require('../config/nodemail.config')
const nodemailer = require('nodemailer')

const sendMail=async(body)=>{
    try {
        const transporter= getTransporter()
        const info = await transporter.sendMail({
                from: '"Test Sender" <test@example.com>',
                to: `${body.email}`,
                subject: `${body.subject}`,
                text: `${body.message}`,
                html: "<p>This is a <b>test email</b> sent via Ethereal!</p>",
            });

        console.log("Message sent: %s", info.messageId);

        // Get the Ethereal URL to preview this email
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", previewUrl);
        return previewUrl;
        // Output: https://ethereal.email/message/...
    } catch (error) {
        console.log(`Error while sending mail  ${error.message}`)
        throw Error(error.message)
    }
}

module.exports={sendMail};