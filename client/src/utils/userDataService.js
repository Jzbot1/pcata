import axios from "axios";
import CryptoJS from "crypto-js";
import { useDispatch } from "react-redux";

const getUserData = async (dispatch = () => {}, setUser = () => {}, setbalance = () => {}) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Getuser token data:", token);

    if (!token) {
      throw new Error("Token not found in localStorage.");
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

    if (res.data?.success) {
      try {
        const { user, id, key: encryptedKey, iv: encryptedIv } = res.data.data;

        if (!user || !id || !encryptedKey || !encryptedIv) {
          throw new Error("Incomplete encrypted response from server.");
        }

        const key = CryptoJS.enc.Hex.parse(encryptedKey);
        const iv = CryptoJS.enc.Hex.parse(encryptedIv);
        const decryptedBalance = CryptoJS.AES.decrypt(
          { ciphertext: CryptoJS.enc.Hex.parse(id) },
          key,
          { iv: iv }
        ).toString(CryptoJS.enc.Utf8);

        if (!decryptedBalance) {
          throw new Error("Failed to decrypt balance.");
        }

        setbalance(decryptedBalance);
        if (typeof dispatch === "function") dispatch(setUser(user));
        return true;
      } catch (innerError) {
        console.error("Decryption or state update failed:", innerError);
        localStorage.removeItem("token");
        dispatch(setUser(null));
        return false;
      }
    } else {
      localStorage.removeItem("token");
      dispatch(setUser(null));
      return false;
    }
  } catch (error) {
    console.error("getUserData error:", error);
    localStorage.removeItem("token");
    dispatch(setUser(null));
    return false;
  }
};

export default getUserData;
