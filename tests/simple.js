const mdnReport = require('../mdn-report');
const fs = require('fs');
const SMTPConnection = require("nodemailer/lib/smtp-connection");

let connection = new SMTPConnection({
	host: "intramail.loginline.com",
	port: 587,
	secure: false
});

const simple = () => {
    let originalMessage;
    try {
        originalMessage = 
          fs
            .readFileSync("./tests/simple_mail.eml")
            .toString('UTF8');
    } catch(err) {
        console.error("Unable to open file. Does it exist ?");
        console.error("Error: ", err);
        return;
    }

    let generatedMail;

    try {
        generatedMail = mdnReport.createMDNReport(originalMessage);
    } catch(err) {
        console.error("Test failed: ", err);
        return;
    }

    console.log(generatedMail);

    connection.connect((err) => {
        if (err) {
            console.error("Unable to connect to SMTP server.");
        } else {
            connection.login({
                credentials: {
                    user: 'all@intramail.loginline.com',
                    pass: 'tt7yub24'
                }
            }, () => connection.send({
                    from: 'all@intramail.loginline.com',
                    to: 'mathieu.deschamps@loginline.com'
                },
                generatedMail, (err, info) => {
                    if (err) {
                        console.error("An error occurred : ", err);
                    } else {
                        console.log("Email sent. Info : ", info);
                    }
                })
            );
        }
    });
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

simple();