const fs = require("fs");
const nodemailer = require("nodemailer");

const sendOrderEmail = async (orderDetails, customerEmail) => {
  try {
    const { orderId, amount, price, pname, userid, zoneid } = orderDetails;
    const dynamicData = { orderId, amount, price, p_info: pname, userId: userid, zoneId: zoneid };

    let htmlContent = fs.readFileSync("order.html", "utf8");
    Object.keys(dynamicData).forEach((key) => {
      const placeholder = new RegExp(`{${key}}`, "g");
      htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
    });

    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL, pass: process.env.APP_PASSWORD },
    });

    let mailDetails = {
      from: process.env.MAIL,
      to: customerEmail,
      subject: "Order Successful!",
      html: htmlContent,
    };

    await mailTransporter.sendMail(mailDetails);
    console.log("Order email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendOrderEmail;
