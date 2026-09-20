import axios from "axios";
import CryptoJS from "crypto-js";

const getUserData = async (dispatch = () => {}, setUser = () => {}, setbalance = () => {}) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return false;
    }

    const res = await axios.post(
      "/api/user/getUserData",
      {},
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (res.data?.success && res.data?.data) {
      const { user, id, key: encryptedKey, iv: encryptedIv } = res.data.data;

      let decryptedBalance = "0";
      if (id && encryptedKey && encryptedIv) {
        try {
          const key = CryptoJS.enc.Hex.parse(encryptedKey);
          const iv = CryptoJS.enc.Hex.parse(encryptedIv);
          const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.enc.Hex.parse(id) },
            key,
            { iv: iv }
          ).toString(CryptoJS.enc.Utf8);

          if (decrypted !== undefined && decrypted !== null && decrypted !== "") {
            decryptedBalance = decrypted;
          }
        } catch (decryptErr) {
          console.warn("Balance decryption warning (using fallback 0):", decryptErr);
          decryptedBalance = user?.balance?.toString() || "0";
        }
      } else if (user?.balance !== undefined) {
        decryptedBalance = user.balance.toString();
      }

      if (typeof setbalance === "function") {
        setbalance(decryptedBalance);
      }

      if (user && typeof dispatch === "function") {
        dispatch(setUser(user));
      }

      return true;
    } else {
      // If server explicitly returned success: false or invalid response
      if (res.data?.message?.toLowerCase().includes("session") || res.data?.message?.toLowerCase().includes("token")) {
        localStorage.removeItem("token");
        if (typeof dispatch === "function") dispatch(setUser(null));
      }
      return false;
    }
  } catch (error) {
    console.error("getUserData error:", error);
    // Only remove token if server explicitly responded with 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (typeof dispatch === "function") dispatch(setUser(null));
    }
    return false;
  }
};

export default getUserData;

