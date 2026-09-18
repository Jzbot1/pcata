const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const sendOrderEmail = async (orderDetails, customerEmail) => {
  try {
    const { orderId, amount, price, pname, userid, zoneid } = orderDetails;
    const dynamicData = { orderId, amount, price, p_info: pname, userId: userid, zoneId: zoneid };

    const possiblePaths = [
      path.join(__dirname, "../order.html"),
      path.join(process.cwd(), "order.html"),
      path.join(process.cwd(), "backend/order.html"),
      path.join(__dirname, "order.html"),
    ];

    let htmlContent = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        htmlContent = fs.readFileSync(p, "utf8");
        break;
      }
    }

    if (!htmlContent) {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4CAF50;">Order Successful!</h2>
          <p>Thank you for purchasing with Zelan Store.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><strong>Order ID:</strong></td><td>{orderId}</td></tr>
            <tr><td><strong>Product:</strong></td><td>{p_info}</td></tr>
            <tr><td><strong>Amount:</strong></td><td>{amount}</td></tr>
            <tr><td><strong>Price:</strong></td><td>₹{price}</td></tr>
            <tr><td><strong>User ID:</strong></td><td>{userId}</td></tr>
            <tr><td><strong>Zone ID:</strong></td><td>{zoneId}</td></tr>
          </table>
        </div>
      `;
    }

    Object.keys(dynamicData).forEach((key) => {
      const placeholder = new RegExp(`{${key}}`, "g");
      htmlContent = htmlContent.replace(placeholder, dynamicData[key] || "");
    });

    if (!process.env.MAIL || !process.env.APP_PASSWORD) {
      console.warn("Mail credentials missing in environment. Skipping email sending.");
      return;
    }

    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL, pass: process.env.APP_PASSWORD },
    });

    let mailDetails = {
      from: `"Zelan Store" <${process.env.MAIL}>`,
      to: customerEmail,
      subject: `Order Successful! - #${orderId}`,
      html: htmlContent,
    };

    await mailTransporter.sendMail(mailDetails);
    console.log(`Order email sent successfully to ${customerEmail}!`);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

module.exports = sendOrderEmail;

