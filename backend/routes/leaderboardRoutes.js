const express = require("express");
const nodeCron = require("node-cron");
const rewardModel = require("../models/rewardModel");
const orderModel = require("../models/orderModel");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const leaderboardModel = require("../models/leaderboardModel");
const router = express.Router();

// 🗓️ Save monthly leaderboard data
// 🗓️ Save monthly leaderboard data
const saveMonthlyLeaderboard = async () => {
  try {
    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    const todayStr = now.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

     // 🗑️ Remove all previous leaderboard records
     await leaderboardModel.deleteMany({});

    // 🏆 Get reward definitions
    const rewards = await rewardModel.find({});

    // 📊 Get top 20 users for this month
    const topUsers = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "success"
        }
      },
      {
        $group: {
          _id: "$customer_email",
          totalSpent: { $sum: { $toDouble: "$price" } }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "email",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          fname: "$userInfo.fname",
          email: "$userInfo.email",
          mobile: "$userInfo.mobile",
          totalSpent: 1
        }
      }
    ]);

    // 🎁 Assign rewards
    const winners = topUsers.map((user, index) => {
      const reward = rewards.find(r => r.position === (index + 1).toString());
      return {
        fname: user.fname.replace("@gmail.com", ""),
        email: user.email,
        mobile: user.mobile,
        score: user.totalSpent,
        prize: reward?.reward || "No Prize"
      };
    });

    // 💾 Save new leaderboard entry
    const leaderboardEntry = new leaderboardModel({
      winners,
      fromDate: startDate,
      toDate: endDate
    });

    await leaderboardEntry.save();
    console.log("✅ Monthly leaderboard saved successfully.");
  } catch (err) {
    console.error("❌ Error saving leaderboard:", err.message);
  }
};

// Schedule the function to run at 23:55 on the last day of every month
nodeCron.schedule("57 23 * * *", async () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (now.getDate() === lastDay) {
    console.log("Running monthly leaderboard task...");
    await saveMonthlyLeaderboard();
  } else {
    console.log("Today is not last day for monthly leaderboard task, skipping...");
  }
});


// ⏰ Schedule leaderboard generation at 23:57 on last day of month
nodeCron.schedule("57 23 * * *", async () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (now.getDate() === lastDay) {
    console.log("Running monthly leaderboard task...");
    await saveMonthlyLeaderboard();
  } else {
    console.log("Today is not last day for monthly leaderboard task, skipping...");
  }
});

// 📈 Get current month leaderboard (live)
router.get("/leaderboard", async (req, res) => {
    try {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
        // Calculate reset time: 1st of next month at 00:00
        const resetTime = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  
        const topUsers = await orderModel.aggregate([
            {
            $match: {
                createdAt: {
                $gte: from,
                $lte: to,
                },
                status: "success" // ✅ Only include successful orders
            },
            },
            {
            $group: {
                _id: "$customer_email",
                totalSpent: { $sum: { $toDouble: "$price" } },
            },
            },
            {
                $sort: { totalSpent: -1 },
            },
            {
                $limit: 20,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "email",
                    as: "userInfo",
                },
            },
            {
                $unwind: "$userInfo",
            },
            {
                $project: {
                    totalSpent: 1,
                    fname: "$userInfo.fname",
                    _id: 0,
                },
            },
        ]);
  
        res.status(200).json({
            success: true,
            data: topUsers,
            resetTime, // Send to frontend for countdown
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});
  

router.get("/get-leaderboard-rewards", async (req, res) => {
  try {
    const rewardList = await leaderboardModel.find({});
    if (!rewardList || rewardList.length === 0) {
      return res
        .status(201)
        .send({ success: false, error: "No reward list found" });
    }

    // Remove email from each winner
    const sanitizedList = rewardList.map((entry) => {
      const updatedWinners = entry.winners.map((winner) => {
        const { email, ...rest } = winner; // remove email
        return rest;
      });
      return {
        ...entry.toObject(), // convert mongoose doc to plain object
        winners: updatedWinners,
      };
    });

    return res.status(200).send({
      success: true,
      error: "Reward list fetched success",
      data: sanitizedList,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ error: error.message });
  }
});

// 🏆 Get all reward positions
router.get("/get-rewards", async (req, res) => {
  try {
    const rewards = await rewardModel.find({});
    if (!rewards.length) {
      return res.status(404).json({ success: false, message: "No rewards found" });
    }
    res.status(200).json({ success: true, data: rewards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ➕ Add reward (admin only)
router.post("/add-reward", adminAuthMiddleware, async (req, res) => {
  try {
    const reward = new rewardModel(req.body);
    await reward.save();
    res.status(200).json({ success: true, message: "Reward added successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ❌ Delete reward (admin only)
router.post("/delete-reward", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Reward ID is required" });
    }

    const deleted = await rewardModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Reward not found" });
    }

    res.status(200).json({ success: true, message: "Reward deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
