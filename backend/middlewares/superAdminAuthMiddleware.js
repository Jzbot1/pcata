const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "zomuansangajacob523@gmail.com";

module.exports = async (req, res, next) => {
  try {
    const token =
      req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "Auth Failed: Token missing" });
    }

    JWT.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        return res
          .status(401)
          .send({ success: false, message: "Auth Failed: Invalid token" });
      } else {
        const user = await userModel.findById(decode.id);

        if (!user) {
          return res
            .status(404)
            .send({ success: false, message: "User not found" });
        }

        // Check if the user is an admin AND matches the Super Admin email
        const isSuperAdmin =
          user.isAdmin &&
          user.email &&
          user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

        if (isSuperAdmin) {
          req.body.userId = user._id;
          req.user = user;
          next();
        } else {
          return res.status(403).send({
            success: false,
            message: "Access Denied: Only Super Admin can access Payment Settings",
          });
        }
      }
    });
  } catch (error) {
    console.error("Super Admin Auth Error:", error);
    res.status(401).send({ success: false, message: "Auth Failed" });
  }
};
