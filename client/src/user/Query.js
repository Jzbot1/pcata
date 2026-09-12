import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { setQuery } from "../redux/features/querySlice";
import Layout from "../components/Layout/Layout";
import DashboardLayout from "./components/DashboardLayout";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./Query.css";

const Query = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [tab, setTab] = useState(0);
  const [queries, setQueries] = useState(null);
  const [singleQuery, setSingleQuery] = useState(null);
  const [msg, setMsg] = useState("");

  async function handleSubtmit(id) {
    try {
      const res = await axios.post("/api/contact/update-query", {
        id: id,
        msg: msg,
        person: "user",
      }, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        message.success(res.data.message);
        getUserQuery();
        setTab(0);
        setMsg("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getUserQuery() {
    try {
      const res = await axios.post("/api/contact/get-user-query", {
        email: user?.email,
      }, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setQueries(res.data.data.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user !== null) {
      getUserQuery();
    }
  }, [user]);

  async function handleQuerySeen(id) {
    try {
      const res = await axios.post("/api/contact/update-query", {
        id: id,
        seen: true,
      }, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        dispatch(setQuery(true));
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Layout>
      <DashboardLayout>
        <div className="title">
          {tab === 0 && (
            <table className="table table-bordered table-warning">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {queries?.map((item, index) => {
                  return (
                    <tr>
                      <td>
                        <small>{index + 1}</small>
                      </td>
                      <td>
                        <small>{item?.email}</small>
                      </td>
                      <td>
                        <small>{item?.mobile}</small>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setTab(1);
                            setSingleQuery(item);
                            handleQuerySeen(item._id);
                          }}
                          className="p-1 view-btn"
                        >
                          {item?.status === "seen" ? "Closed" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {tab === 1 && (
            <div className="view-query-container">
              <div className="back-btnn" onClick={() => setTab(0)}>
                <ArrowBackIcon className="icon" />
                Back
              </div>
              <hr className="text-dark" />
              <div className="query-reply-container">
                {singleQuery?.msg?.map((item, index) => {
                  return (
                    <div
                      className={`query-msg ${
                        item?.person === "user" && "active"
                      }`}
                    >
                      {item?.msg}
                    </div>
                  );
                })}
              </div>
              {singleQuery.status === "pending" && (
                <textarea
                  onChange={(e) => setMsg(e.target.value)}
                  className="my-3 form-control"
                  name="msg"
                  rows="4"
                ></textarea>
              )}

              {singleQuery.status === "seen" ? (
                <span className="text-danger">
                  Admin Has Closed this ticket
                </span>
              ) : (
                <button
                  onClick={() => handleSubtmit(singleQuery?._id)}
                  className="register-btn mt-3"
                >
                  Submit
                </button>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default Query;
