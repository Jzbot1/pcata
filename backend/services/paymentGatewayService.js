const axios = require("axios");
const qs = require("qs");
const paymentConfigModel = require("../models/paymentConfigModel");

class PaymentGatewayService {
  /**
   * Fetch active payment gateway configuration
   */
  static async getConfig() {
    try {
      // Look for ACTIVE_GATEWAY or fallback UPIGATEWAY
      let config = await paymentConfigModel.findOne({
        $or: [{ gatewayName: "ACTIVE_GATEWAY" }, { gatewayName: "UPIGATEWAY" }],
      });

      if (!config) {
        config = {
          gatewayType: "JZSTORE",
          apiUrl: "https://checkout.pages.jzstore.in",
          apiKey: process.env.JZSTORE_USER_TOKEN || "509ffd178aff24dc09640796da90fc22",
          isActive: true,
        };
      }

      const gatewayType =
        config.gatewayType ||
        (config.apiUrl && config.apiUrl.includes("jzstore")
          ? "JZSTORE"
          : "UPIGATEWAY");

      const apiUrl = (config.apiUrl || (gatewayType === "JZSTORE" ? "https://checkout.pages.jzstore.in" : "https://api.ekqr.in")).replace(/\/+$/, "");
      const apiKey = config.apiKey || (gatewayType === "JZSTORE" ? "509ffd178aff24dc09640796da90fc22" : process.env.UPIGATEWAY_API_KEY);

      return {
        gatewayType,
        apiUrl,
        apiKey,
        isActive: config.isActive !== false,
      };
    } catch (error) {
      console.error("Error loading payment config:", error);
      return {
        gatewayType: "JZSTORE",
        apiUrl: "https://checkout.pages.jzstore.in",
        apiKey: "509ffd178aff24dc09640796da90fc22",
        isActive: true,
      };
    }
  }

  /**
   * 1. CREATE PAYMENT ORDER
   */
  static async createOrder({
    orderId,
    amount,
    customerName,
    customerEmail,
    customerMobile,
    redirectUrl,
    note,
    remark1,
    remark2,
  }) {
    const config = await this.getConfig();
    const cleanMobile = (customerMobile || "9999999999").toString().replace(/\D/g, "").slice(-10);

    if (config.gatewayType === "JZSTORE") {
      // JZSTORE / ALL-IN-ONE GATEWAY
      const endpoint = `${config.apiUrl}/api/create-order`;
      const postData = {
        user_token: config.apiKey,
        amount: parseFloat(amount),
        order_id: orderId.toString(),
        customer_mobile: cleanMobile,
        redirect_url: redirectUrl || "",
        remark1: (remark1 || note || "Order Payment").toString(),
        remark2: (remark2 || customerEmail || "").toString(),
      };

      console.log("[JZSTORE] Creating order:", endpoint, postData);

      const response = await axios.post(endpoint, qs.stringify(postData), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      });

      console.log("[JZSTORE] Create order response:", response.data);

      const resData = response.data;
      const paymentUrl =
        resData.payment_url ||
        resData.url ||
        resData.data?.payment_url ||
        resData.data?.url ||
        resData.result?.payment_url ||
        resData.result?.url;

      const isSuccess =
        resData.status === true ||
        resData.status === "success" ||
        resData.status === 200 ||
        resData.status === "SUCCESS" ||
        resData.status === "OK" ||
        !!paymentUrl;

      return {
        success: isSuccess && !!paymentUrl,
        payment_url: paymentUrl,
        data: resData.data || resData.result || resData,
        message: resData.message || resData.msg || (paymentUrl ? "Order created" : "Error initiating payment"),
      };
    } else {
      // EKQR / UPIGATEWAY
      const endpoint = `${config.apiUrl}/api/create_order`;
      const postData = {
        key: config.apiKey,
        client_txn_id: orderId.toString(),
        amount: amount.toString(),
        p_info: note || "Order Payment",
        customer_name: customerName || "Customer",
        customer_email: customerEmail || "customer@zelanstore.com",
        customer_mobile: cleanMobile,
        redirect_url: redirectUrl,
        udf1: (remark1 || note || "").toString(),
        udf2: (remark2 || "").toString(),
        udf3: "",
      };

      console.log("[UPIGATEWAY] Creating order:", endpoint, postData);

      const response = await axios.post(endpoint, postData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      console.log("[UPIGATEWAY] Create order response:", response.data);

      const resData = response.data;
      const paymentUrl = resData.data?.payment_url;
      const isSuccess = resData.status === true;

      return {
        success: isSuccess && !!paymentUrl,
        payment_url: paymentUrl,
        data: resData.data || resData,
        message: resData.message || (paymentUrl ? "Order created" : "Error in initiating payment"),
      };
    }
  }

  /**
   * 2. CHECK ORDER STATUS
   */
  static async checkOrderStatus({ orderId, client_txn_id, txnDate }) {
    const config = await this.getConfig();
    const effectiveOrderId = (orderId || client_txn_id).toString();

    if (config.gatewayType === "JZSTORE") {
      // JZSTORE / ALL-IN-ONE GATEWAY
      const endpoint = `${config.apiUrl}/api/check-order-status`;
      const postData = {
        user_token: config.apiKey,
        order_id: effectiveOrderId,
      };

      console.log("[JZSTORE] Checking order status:", endpoint, postData);

      const response = await axios.post(endpoint, qs.stringify(postData), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      });

      console.log("[JZSTORE] Status check response:", response.data);

      const resData = response.data;
      const resultObj = resData.result || resData.data || resData;

      const rawStatus = (
        resultObj.status ||
        resData.status ||
        resultObj.txnStatus ||
        ""
      ).toString().toUpperCase();

      const isSuccess = ["SUCCESS", "COMPLETED", "PAID", "TRUE"].includes(rawStatus);

      return {
        isSuccess,
        status: rawStatus,
        orderId: resultObj.order_id || resultObj.orderId || effectiveOrderId,
        amount: parseFloat(resultObj.amount || resultObj.txn_amount || 0),
        utr: resultObj.utr || resultObj.upi_txn_id || resultObj.utr_number || "",
        data: resultObj,
        raw: resData,
      };
    } else {
      // EKQR / UPIGATEWAY
      const endpoint = `${config.apiUrl}/api/check_order_status`;
      const date = new Date();
      const formattedDate =
        txnDate ||
        date.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" }).split("/").join("-");

      const postData = {
        key: config.apiKey,
        client_txn_id: effectiveOrderId,
        txn_date: formattedDate,
      };

      console.log("[UPIGATEWAY] Checking order status:", endpoint, postData);

      const response = await axios.post(endpoint, postData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      console.log("[UPIGATEWAY] Status check response:", response.data);

      const resData = response.data;
      const dataObj = resData.data || {};
      const rawStatus = (dataObj.status || dataObj.txnStatus || "").toString().toUpperCase();
      const isSuccess = resData.status === true && (rawStatus === "SUCCESS" || rawStatus === "COMPLETED");

      return {
        isSuccess,
        status: rawStatus,
        orderId: dataObj.client_txn_id || effectiveOrderId,
        amount: parseFloat(dataObj.amount || 0),
        utr: dataObj.upi_txn_id || dataObj.utr || "",
        data: dataObj,
        raw: resData,
      };
    }
  }
}

module.exports = PaymentGatewayService;
