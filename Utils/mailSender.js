    const nodemailer = require("nodemailer");

    exports.sendEmail = async (email, title, body) => {
    try {

        let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        secure: true,
        port: 465,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
        debug: true,
        });
        let info = await transporter.sendMail(
        {
            from: "RbanCraze || Style Delivered. Craze Unleashed.",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        },
        function (error) {
            if (error) {
            } else {
            }
        }
        );
        return info;
    } catch (error) {}
    };

