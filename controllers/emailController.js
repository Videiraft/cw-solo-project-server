const nodemailer = require('nodemailer');
const User = require('../models/usersModel');

exports.sendEmail = async () => {
  try {
    const users = await User.find();

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SERVICE_HOST,
      port: process.env.GMAIL_SERVICE_PORT,
      secure: process.env.GMAIL_SERVICE_SECURE,
      auth: {
        user: process.env.GMAIL_USER_NAME, // mail user
        pass: process.env.GMAIL_USER_PASSWORD, // mail password
      },
    });
    // Send mail with defined transport object for each user
    users.forEach(async (user) => {
      try {
        if (user.links.length > 0) {
          // Select the links that were not sent yet
          const availableLinks = user.links.filter(link => !link.sent);
          // Choose random link to send by email
          const randomIndex = Math.floor(Math.random() * availableLinks.length);
          const linkToSend = availableLinks[randomIndex];
          // Update database link setting sent to true;
          const stringTest = `links.${randomIndex}.sent`;
          const test = await User.findByIdAndUpdate(
            user._id, // eslint-disable-line
            { $set: { [stringTest]: true } },
            { new: true },
          );
          console.log(test); // eslint-disable-line
          // Send the email
          await transporter.sendMail({
            from: '"Pin-It!" <pin.it.testmail@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: 'Hello Test', // Subject line
            text: 'Hello world?', // plain text body
            html: `<b>${linkToSend.url}</b>`, // html body
          });
        }
      } catch (err) {
        console.log(err); // eslint-disable-line
      }
    });
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
};
