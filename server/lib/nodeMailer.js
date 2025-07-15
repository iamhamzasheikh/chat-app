// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//     host: 'smtp-relay.brevo.com',
//     port: '587',
//     auth: {
//         user: process.env.SMPT_USER,
//         pass: process.env.SMPT_PASSWORD,
//     }
// })


// export default transporter;

// lib/nodeMailer.js
import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // use STARTTLS
    auth: {
        user: process.env.SMPT_USER, // Your Brevo email
        pass: process.env.SMPT_PASS,  // Your Brevo API key (not account password)
    },
    // Add these additional options for better reliability
    tls: {
        rejectUnauthorized: false
    }
});

// Test the connection
transporter.verify((error, success) => {
    if (error) {
        console.log('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to take our messages');
    }
});

export default transporter;