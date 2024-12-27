import nodemailer from "nodemailer";

export const sendMail = (body, res, message) => {
  const mailTransporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  mailTransporter.sendMail(body, (err) => {
    if (err) {
      console.log("It has an error:-", err);
    } else {
     return console.log("Emails is send");
    }
  });
};
