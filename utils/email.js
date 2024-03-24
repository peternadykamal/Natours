const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) create a transporter
  const transport = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) define the email options
  const mailOptions = {
    from: "Peter Nady <hello@peter.io",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
