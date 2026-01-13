
const nodemailer = require("nodemailer");

const sendAMail = async(to, resetlink) => {
    const transporter =  nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });


    await transporter.sendMail({
        from: process.env.EMAIL,
        to:to,
        subject:"CCC Redemption Password Reset Link",
        text: ` Your password reset link ${resetlink} expires in 1 hour:`

    });
    
};

module.exports = sendAMail;