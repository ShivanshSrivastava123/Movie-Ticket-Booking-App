import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async({ to, subject, body })=> {
    try {
        const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL, // sender address
            to,
            subject,
            html: body
        });

        return info
    } catch (err) {
    console.error("Error while sending mail:", err);
    }
}

export default sendMail;