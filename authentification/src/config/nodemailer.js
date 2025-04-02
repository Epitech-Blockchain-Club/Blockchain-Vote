const mailer = require('nodemailer');
const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_MAIL,
        pass: process.env.SENDER_PASS,
    }
});
