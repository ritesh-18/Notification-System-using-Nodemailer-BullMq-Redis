const nodemailer = require('nodemailer')
/**
 * @production code 
 * 
            const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true",

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },

            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            });
 * 
 * 
 */


// Create a test account automatically
let transporter;
async function intiTransport() {
    try {
        const testAccountVal=await nodemailer.createTestAccount();
        console.log(testAccountVal)
        
        const transport =  nodemailer.createTransport({
            host: testAccountVal?.smtp?.host,
            port: testAccountVal?.smtp?.port,
            secure: testAccountVal?.smtp?.secure,
            auth: {
                user: testAccountVal?.user,
                pass: testAccountVal?.pass,
            },
        })
        console.log("mail transport initiated")
       transporter = transport

    } catch (error) {

       throw new Error(`Error while init mail transporter ${error.message}`)
        

    }


}

function getTransporter(){
    return transporter
}

 module.exports={intiTransport , getTransporter}