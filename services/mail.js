const nodemailer = require('nodemailer');

function sendMail(to, subject, message) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
    port: 465,
    secure: true,
  });

  const mailOption = {
    from: 'vincentalfarieco@gmail.com',
    to: to,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOption, (err, info) => {
    if (err) {
      console.log(err);
    }

    console.log(info);
  });
}

module.exports = { sendMail };
