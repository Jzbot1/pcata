import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import axios from "axios";
import "./AdminRewards.css";

const AdminRewards = () => {
  const [list, setList] = useState(null);

  const getLeaderboardRewardList = async () => {
    try {
      const res = await axios.get(`/api/leaderboard/get-leaderboard-rewards`);
      if (res.data.success) {
        setList(res.data.data);
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getLeaderboardRewardList();
  }, []);

  return (
    <AdminLayout>
      <div className="winner-container">
        <h5 className="mb-3 text-dark">Winner List</h5>
        <div className="winnerlist">
          {list?.map((item, index) => {
            return (
              <div className="winnerbox">
                <div className="date">
                  {new Date(item?.fromDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(item?.toDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div className="winners">
                  <table className="">
                    <thead>
                      <tr>
                        <th>Srno</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Score</th>
                        <th>Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item?.winners?.map((winner, i) => {
                        return (
                          <tr>
                            <td>{i + 1}</td>
                            <td>{winner.fname}</td>
                            <td>{winner.email}</td>
                            <td>{winner.mobile}</td>
                            <td>{winner.score}</td>
                            <td>{winner.prize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRewards;
