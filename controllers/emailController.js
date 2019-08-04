const fs = require('fs');
const Handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const User = require('../models/usersModel');

exports.sendEmail = async () => {
  try {
    const users = await User.find();
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVICE_HOST,
      port: process.env.MAIL_SERVICE_PORT,
      secure: process.env.MAIL_SERVICE_SECURE,
      auth: {
        user: process.env.MAIL_USER_NAME, // mail user
        pass: process.env.MAIL_USER_PASSWORD, // mail password
      },
    });
    // Send mail with defined transport object for each user
    users.forEach(async (user) => {
      try {
        // Select the links that were not sent yet
        const availableLinks = user.links.filter(link => !link.sent);
        // If the user has any links to send
        if (availableLinks.length > 0) {
          // Choose random link to send by email
          const randomIndex = Math.floor(Math.random() * availableLinks.length);
          const linkToSend = availableLinks[randomIndex];
          // Update database link setting sent to true;
          const stringTest = `links.${randomIndex}.sent`;
          await User.findByIdAndUpdate(
            user._id, // eslint-disable-line
            { $set: { [stringTest]: true } },
            { new: true },
          );
          // Send the email
          const view = fs.readFileSync(__dirname + '/../templates/email-template.html', 'utf8'); // eslint-disable-line
          const template = Handlebars.compile(view);
          transporter.sendMail({
            from: '"Pin-It!" <pin.it.testmail@gmail.com>',
            to: user.email,
            subject: 'Pin-It: Your Daily Thought...',
            attachments: [{
              filename: 'pin-it.png',
              path: __dirname +'/../templates/assets/pin-it.png', // eslint-disable-line
              cid: 'logo',
            }],
            html: template({
              title: linkToSend.title,
              description: linkToSend.description,
              favicon: linkToSend.favicon,
              url: linkToSend.url,
            }),
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
