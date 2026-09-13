const express = require("express");
const axios = require("axios");
const paymentModel = require("../models/paymentModel");
const md5 = require("md5");
const querystring = require("querystring");
const authMiddleware = require("../middlewares/authMiddleware");
const generalRateLimiter = require("../middlewares/generalRateLimiter");
const router = express.Router();

router.get("/get-all-payments", authMiddleware, async (req, res) => {
  try {
    const payments = await paymentModel.find({});
    if (payments.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Payment Found" });
    }
    return res.status(201).send({
      success: true,
      message: "All Payments Fetched",
      data: payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});
router.post("/get-user-payments", authMiddleware, async (req, res) => {
  try {
    const payments = await paymentModel.find({ email: req.body.email });
    if (payments.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No payments found" });
    }
    return res.status(201).send({
      success: true,
      message: "Payments Fetched Success",
      data: payments,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Get Barcode Payment Ctrl ${error.message}`,
    });
  }
});
// get role
router.post("/get-role", generalRateLimiter, async (req, res) => {
  try {
    const { userid, zoneid, region, apiName } = req.body;

    if (!userid) {
      return res.status(200).send({
        success: false,
        message: "User ID is required",
      });
    }

    const cleanUserId = String(userid).trim();
    const cleanZoneId = zoneid ? String(zoneid).trim() : "";

    const uid = process.env.UID;
    const email = process.env.EMAIL;
    const product = "mobilelegends";
    const time = Math.floor(Date.now() / 1000);
    const mKey = process.env.KEY;

    // Smile.one endpoints to try (Brazil & Global endpoints with productid 13 are reliable and bypass Cloudflare blocks)
    const endpointsToTry = [
      { url: "https://www.smile.one/br/smilecoin/api/getrole", productid: "13" },
      { url: "https://www.smile.one/smilecoin/api/getrole", productid: "13" },
      { url: "https://www.smile.one/br/smilecoin/api/getrole", productid: "212" },
    ];

    // If region explicitly provided as philliphines, add PH endpoint as well
    if (region === "philliphines" || region === "ph") {
      endpointsToTry.push({
        url: "https://www.smile.one/ph/smilecoin/api/getrole",
        productid: "212",
      });
    }

    for (const ep of endpointsToTry) {
      try {
        const signArr = {
          uid,
          email,
          product,
          time,
          userid: cleanUserId,
          zoneid: cleanZoneId,
          productid: ep.productid,
        };

        const sortedSignArr = Object.fromEntries(
          Object.entries(signArr).sort()
        );
        const str =
          Object.keys(sortedSignArr)
            .map((key) => `${key}=${sortedSignArr[key]}`)
            .join("&") +
          "&" +
          mKey;
        const sign = md5(md5(str));

        const formData = querystring.stringify({
          email,
          uid,
          userid: cleanUserId,
          zoneid: cleanZoneId,
          product,
          productid: ep.productid,
          time,
          sign,
        });

        const response = await axios.post(ep.url, formData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json, text/plain, */*",
          },
          timeout: 8000,
        });

        const data = response.data;
        if (data && typeof data === "object") {
          if (data.status === 200) {
            let username = data.username || "";
            try {
              username = decodeURIComponent(username);
            } catch (_) {}

            return res.status(200).send({
              success: true,
              username: username,
              zone: data.zone,
              message: data.message || "Username verified",
            });
          } else if (
            data.status === 20004 ||
            data.status === 20002 ||
            (data.message && data.message.toLowerCase().includes("não existe"))
          ) {
            return res.status(200).send({
              success: false,
              message: "Invalid User ID or Zone ID. Please check and try again.",
            });
          } else if (data.status !== 207) {
            // If it's not a "Product does not exist" config error, return provider message
            return res.status(200).send({
              success: false,
              message: data.message || "Could not verify username",
            });
          }
        }
      } catch (endpointErr) {
        console.warn(`[GET_ROLE] Endpoint ${ep.url} failed:`, endpointErr.message);
      }
    }

    return res.status(200).send({
      success: false,
      message: "Unable to verify username at this moment. Please check your IDs or try again.",
    });
  } catch (error) {
    console.error("Get role controller error:", error);
    return res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
