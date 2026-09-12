import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { message, Table, Pagination, Select } from "antd";
import "./AdminQueries.css";

const { Option } = Select;

const AdminQueries = () => {
  const [queries, setQueries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [singleQuery, setSingleQuery] = useState(null);
  const [view, setView] = useState(0);
  const [msg, setMsg] = useState(null);

  const getAllQueries = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/get-all-queries", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setQueries(res.data.data.reverse());
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  async function handleSubtmit(id) {
    try {
      const res = await axios.post("/api/contact/update-query", {
        id: id,
        msg: msg,
        person: "admin",
      });
      if (res.data.success) {
        message.success(res.data.message);
        getAllQueries();
        setView(0);
        setMsg("");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSeen = async (id) => {
    try {
      const res = await axios.post(
        "/api/admin/query-seen",
        { id: id },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAllQueries();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllQueries();
  }, []);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
  };

  const filteredQueries =
    queries &&
    queries.filter((item) => {
      if (statusFilter && typeFilter) {
        return item.status === statusFilter && item.type === typeFilter;
      } else if (statusFilter) {
        return item.status === statusFilter;
      } else if (typeFilter) {
        return item.type === typeFilter;
      } else {
        return true;
      }
    });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text, record) => (
        <button
          onClick={() => {
            setSingleQuery(record);
            setView(1);
          }}
          className="add-to-cart-btn w-100"
        >
          View
        </button>
      ),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (text, record) => {
        if (record.status === "seen") {
          return <span className="text-danger">Closed</span>;
        } else {
          return (
            <button
              onClick={() => handleSeen(record._id)}
              className="add-to-cart-btn w-100"
            >
              Close
            </button>
          );
        }
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="page-title">
        <h3 className="m-0">Queries</h3>
        <h6>Total Queries - {queries?.length}</h6>
      </div>
      <hr />
      {view === 0 && (
        <div className="table-container">
          <div className="tools">
            <Select
              className="mr-2"
              style={{ width: 200 }}
              placeholder="Filter by Status"
              onChange={handleStatusFilterChange}
            >
              <Option value="">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="seen">Seen</Option>
            </Select>
            <Select
              style={{ width: 200 }}
              placeholder="Filter by Type"
              onChange={handleTypeFilterChange}
            >
              <Option value="">All Types</Option>
              <Option value="Payment Related Query">
                Payment Related Queries
              </Option>
              <Option value="In-Game Recharge Query">
                In-Game Recharge Query
              </Option>
              <Option value="Wanted to be a Reseller">
                Wanted to be a Reseller
              </Option>
              <Option value="others">Other Query</Option>
            </Select>
          </div>
          <Table
            dataSource={filteredQueries?.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            columns={columns}
            pagination={false}
            rowKey="_id"
          />
          <Pagination
            className="my-3"
            current={currentPage}
            pageSize={pageSize}
            total={queries?.length}
            onChange={handlePageChange}
            showSizeChanger
            onShowSizeChange={handlePageSizeChange}
          />
        </div>
      )}
      {view === 1 && (
        <>
          <div className="back-btnn text-white" onClick={() => setView(0)}>
            <ArrowBackIcon className="icon" />
            Back
          </div>
          <hr className="text-white" />
          <div className="admin-query-reply query-reply-container">
            {singleQuery?.msg?.map((item, index) => {
              return (
                <div
                  className={`query-msg ${
                    item?.person === "user" ? "user" : "admin"
                  }`}
                >
                  {item?.msg}
                </div>
              );
            })}
          </div>
          <textarea
            onChange={(e) => setMsg(e.target.value)}
            className="my-3 form-control"
            name="msg"
            rows="4"
          ></textarea>
          <button
            onClick={() => handleSubtmit(singleQuery?._id)}
            className="register-btn mt-3"
          >
            Submit
          </button>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminQueries;
