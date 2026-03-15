const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT);
    const smtpUser = process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        throw new Error('SMTP is not configured correctly. Please set SMTP_HOST, SMTP_PORT, SMTP_EMAIL and SMTP_PASSWORD.');
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || 'SSO System'} <${smtpUser}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);

    // Fail fast when SMTP accepted no recipients to avoid false positive responses.
    if (!info.accepted || info.accepted.length === 0) {
        const rejected = Array.isArray(info.rejected) && info.rejected.length > 0
            ? info.rejected.join(', ')
            : 'unknown recipient';
        throw new Error(`Email was not accepted by SMTP server (rejected: ${rejected}).`);
    }

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
