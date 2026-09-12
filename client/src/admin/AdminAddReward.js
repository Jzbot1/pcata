import React, { useEffect, useState } from "react";
import { message } from "antd";
import AdminLayout from "./components/AdminLayout";
import axios from "axios";
import "./AdminAddReward.css";

const AdminAddReward = () => {
  const [form, setForm] = useState({ reward: "", position: "", desc: "" });
  const [list, setList] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function getRewardList() {
    try {
      const res = await axios.get("/api/leaderboard/get-rewards", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setList(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function addRewardList() {
    try {
      const res = await axios.post("/api/leaderboard/add-reward", form, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setForm({ position: "", reward: "", desc: "" });
        message.success(res.data.message);
        getRewardList();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteReward(id) {
    try {
      const confirm = window.confirm("Are you sure to delete?");
      if (!confirm) return;
      const res = await axios.post(
        "/api/leaderboard/delete-reward",
        { id: id },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getRewardList();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getRewardList();
  }, []);

  return (
    <AdminLayout className="admin-reward-container">
      <div>
        <div className="page-title">
          <h3 className="m-0 text-light">Reward List</h3>
        </div>
        <hr />
        <div className="reward-container-list">
          <div className="form-fields">
            <input
              type="text"
              placeholder="Enter reward"
              className="form-control py-2"
              name="reward"
              onChange={handleChange}
              value={form?.reward}
            />
          </div>
          <div className="form-fields">
            <input
              type="text"
              placeholder="Enter position"
              className="form-control py-2"
              name="position"
              onChange={handleChange}
              value={form?.position}
            />
          </div>

          <button onClick={addRewardList} className="btn btn-success">
            Submit
          </button>
        </div>
        <div className="rlist">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Reward</th>
                <th>Position</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list?.map((item, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{item?.reward}₹</td>
                    <td>{item?.position}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteReward(item?._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAddReward;
