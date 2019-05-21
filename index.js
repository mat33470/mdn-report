const generateCoupon = (nbBefore, nbAfter) => {
    Math.random().toString(10).substring(2, nbBefore + 2) + "." + Math.random().toString(36).substring(2,nbAfter + 2);
}

const addrRegex = /(^[^<>]+$)|<([^<>]+)>/;

const mdnReport = (originalMessage, options) => {
    const boundary = generateCoupon(15,10);
    const messageId = generateCoupon(12,5) + "@" + options.ndd;

    const matches = originalMessage.recipient.match(reg);
				  
    let recipientAddress = '';

    if (matches[1]) {
        recipientAddress = matches[1];
    } else if (matches[2]) {
        recipientAddress = matches[2];
    } else {
        console.error("Unable to find mail address in mail_object.from : ", mail_object.from);
        return;
    }

    let result = "";
    result += "Date: " + new Date().toUTCString() + "\r\n";
    result += "From: " + originalMessage.recipient + "\r\n";
    result += "Message-Id: <" + messageId + ">\r\n";
    result += "Subject: " + options.subject + "\r\n";
    result += "To: " + originalMessage.sender + "\r\n";
    result += "MIME-Version: 1.0\r\n";
    result += "\r\n";
    result += "Content-Type: multipart/report; report-type=disposition-notification; boundary=\"" + boundary + "\"\r\n";
    result += "\r\n";
    result += "--" + boundary + "\r\n";
    result += "\r\n";
    result += options.readableMessage;
    result += "\r\n\r\n";
    result += "--" + boundary + "\r\n";
    result += "content-type: message/disposition-notification\r\n";
    result += "\r\n";
    result += "Final-Recipient: rfc822;" + recipientAddress + "\r\n";
    result += "Original-Message-ID: <" + originalMessage.messageId + ">\r\n";
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

export default mdnReport;