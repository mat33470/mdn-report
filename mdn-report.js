const addrRegex = /(^[^<>]+$)|<([^<>]+)>/;

const generateCoupon = (nbBefore, nbAfter) => 
    Math.random().toString(10).substring(2, nbBefore + 2) + "." + Math.random().toString(36).substring(2,nbAfter + 2);

const extractRelevantData = (data) => {
    const lines = data.split(/\r?\n/);

    let result = {
        data: data
    };

    const data_to_find = [
        {
            name: 'recipient',
            match: 'To: '
        },
        {
            name: 'sender',
            match: 'From: '
        },
        {
            name: 'subject',
            match: 'Subject: '
        },
        {
            name: 'date',
            match: 'Date: '
        },
        {
            name: 'messageId',
            match: 'Message-ID: '
        },
        {
            name: 'notifTo',
            match: 'Disposition-Notification-To: '
        }
    ]

    lines.forEach(line => {
        data_to_find.forEach(element => {
            if (line.startsWith(element.match)) {
                result[element.name] = line.substring(element.match.length, line.length);
            }
        });
    });

    data_to_find.forEach(element => {
        if (!result[element.name]) {
            throw new Error("Couldn't find " + element.name + " in original message.");
        }
    });

    return result;
}

const _mdnReport = (originalMessage, subject="Default", readableMessage="Default") => {

    // Get data from the original message
    originalMessage = extractRelevantData(originalMessage);

    if (subject === "Default") {
        subject = "Acknowledgement of receipt (read) - " + originalMessage.subject;
    }
    if (readableMessage === "Default") {
        readableMessage = "The mail sent the " + originalMessage.date + " to " + originalMessage.recipient + " has been opened.";
        readableMessage += " This message does not implies that the mail has been read nor understood.";
    }

    const matches = originalMessage.recipient.match(addrRegex);
				  
    let recipientAddress = '';

    if (matches[1]) {
        recipientAddress = matches[1];
    } else if (matches[2]) {
        recipientAddress = matches[2];
    } else {
        throw new Error("Unable to extract address from recipient. Recipient : ", originalMessage.recipient);
    }

    let ndd = originalMessage.recipient.substring(originalMessage.recipient.indexOf("@") + 1, originalMessage.recipient.length);
    if (ndd[ndd.length - 1] === ">") ndd = ndd.substring(0, ndd.length - 1);
    const boundary = generateCoupon(15,10) + "/" + ndd;
    const messageId = "<" + generateCoupon(12,5) + "@" + ndd + ">";

    let result = "";
    result += "Date: " + new Date().toUTCString() + "\r\n";
    result += "From: " + originalMessage.recipient + "\r\n";
    result += "Message-Id: " + messageId + "\r\n";
    result += "Subject: " + subject + "\r\n";
    result += "To: " + originalMessage.notifTo + "\r\n";
    result += "MIME-Version: 1.0\r\n";
    result += "\r\n";
    result += "Content-Type: multipart/report; report-type=disposition-notification; boundary=\"" + boundary + "\"\r\n";
    result += "\r\n";
    result += "--" + boundary + "\r\n";
    result += "\r\n";
    result += readableMessage;
    result += "\r\n\r\n";
    result += "--" + boundary + "\r\n";
    result += "content-type: message/disposition-notification\r\n";
    result += "\r\n";
    result += "Final-Recipient: rfc822;" + recipientAddress + "\r\n";
    result += "Original-Message-ID: " + originalMessage.messageId + "\r\n";
    result += "Disposition: manual-action/MDN-sent-manually; displayed\r\n";
    result += "\r\n";
    result += "--" + boundary + "\r\n";
    result += "content-type: message/rfc822\r\n";
    result += "\r\n";
    result += originalMessage.data + "\r\n";
    result += "\r\n";
    result += "--" + boundary + "--\r\n";

    return result;
}

module.exports.createMDNReport = _mdnReport;