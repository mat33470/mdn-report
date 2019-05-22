const mdnReport = require('../mdn-report');
const fs = require('fs');

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
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

simple();