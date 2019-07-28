const nodemailer = require('nodemailer');
const User = require('../models/usersModel');

exports.sendEmail = async () => {
  try {
    const users = await User.find();

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SERVICE_HOST,
      port: process.env.GMAIL_SERVICE_PORT,
      secure: process.env.GMAIL_SERVICE_SECURE,
      auth: {
        user: process.env.GMAIL_USER_NAME, // mail user
        pass: process.env.GMAIL_USER_PASSWORD, // mail password
      },
    });
    // send mail with defined transport object for each user
    // TODO: Check only the links that were not sent yet
    users.forEach(async (user) => {
      try {
        if (user.links.length > 0) {
          // Choose random link to send by email
          const randomIndex = Math.floor(Math.random() * user.links.length);
          const linkToSend = user.links[randomIndex];
          // Update database link setting sent to true;
          const stringTest = `links.${randomIndex}.sent`;
          const test = await User.findByIdAndUpdate(
            user._id, // eslint-disable-line
            { $set: { [stringTest]: true } },
            { new: true },
          );
          console.log(test); // eslint-disable-line
          // Send Email
          const info = await transporter.sendMail({
            from: '"Pin-It!" <pin.it.testmail@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: 'Hello Test', // Subject line
            text: 'Hello world?', // plain text body
            html: `<b>${linkToSend.url}</b>`, // html body
          });
          console.log('Message sent: %s', info.messageId);
          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        }
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};
