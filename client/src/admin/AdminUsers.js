import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { message, Pagination, Select, Popconfirm, Tag, Tooltip } from "antd";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.css";

const { Option } = Select;

const AdminUsers = () => {
  const navigate = useNavigate();
  const [allUser, setAllUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(50); // Default number of items per page
  const [originalAllUser, setOriginalAllUser] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Pagination logic
  const totalUsers = allUser?.length || 0;

  // Pagination change handler
  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  // Search
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(null);
    } else {
      const filtered = allUser?.filter((user) => {
        return (
          user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user?.fname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user?.mobile?.includes(searchQuery)
        );
      });
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  };

  const getAllUser = async () => {
    try {
      const res = await axios.get("/api/admin/get-all-users", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        // Sort newest first
        const sorted = (res.data.data || []).slice().reverse();
        setAllUser(sorted);
        setOriginalAllUser(sorted);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      setActionLoadingId(userId);
      const nextStatus = currentStatus === "yes" ? "no" : "yes";
      const res = await axios.post(
        "/api/admin/toggle-block-user",
        { userId, block: nextStatus },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setActionLoadingId(null);
      if (res.data.success) {
        message.success(res.data.message);
        setAllUser((prev) =>
          prev
            ? prev.map((u) =>
                u._id === userId ? { ...u, block: nextStatus } : u
              )
            : []
        );
        setOriginalAllUser((prev) =>
          prev
            ? prev.map((u) =>
                u._id === userId ? { ...u, block: nextStatus } : u
              )
            : []
        );
        if (filteredUsers) {
          setFilteredUsers((prev) =>
            prev
              ? prev.map((u) =>
                  u._id === userId ? { ...u, block: nextStatus } : u
                )
              : []
          );
        }
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      setActionLoadingId(null);
      console.error(error);
      message.error(
        error?.response?.data?.message || "Failed to update block status"
      );
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  useEffect(() => {
    getAllUser();
  }, []);

  const currentUsers =
    filteredUsers ?? allUser?.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="page-title">
          <h3 className="m-0">Customers</h3>
          <h6>Total Users - {allUser?.length || 0}</h6>
        </div>
        <hr />
        <div className="table-container">
          <div className="tools">
            <div className="form-fields">
              <SearchIcon className="text-dark me-2" />
              <input
                className="mb-4"
                type="search"
                name="search"
                placeholder="Search by email, name or mobile"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              defaultValue="50"
              style={{ width: 120 }}
              onChange={(value) => setUsersPerPage(Number(value))}
            >
              <Option value="10">10 / page</Option>
              <Option value="20">20 / page</Option>
              <Option value="50">50 / page</Option>
              <Option value="100">100 / page</Option>
            </Select>
          </div>
          <table className="table user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Created At</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers &&
                currentUsers.map((user, index) => {
                  const isBlocked = user?.block === "yes";
                  return (
                    <tr key={user?._id || index}>
                      <td>
                        <small className="fw-bold">{user?.fname || "N/A"}</small>
                      </td>
                      <td>
                        <small>{user?.email}</small>
                      </td>
                      <td>
                        <small>{user?.mobile || "N/A"}</small>
                      </td>
                      <td>
                        <Tag color={user?.reseller === "yes" ? "purple" : "blue"}>
                          {user?.reseller === "yes" ? "Reseller" : "Customer"}
                        </Tag>
                      </td>
                      <td>
                        {isBlocked ? (
                          <Tag color="error" style={{ fontWeight: 600 }}>
                            Blocked
                          </Tag>
                        ) : (
                          <Tag color="success" style={{ fontWeight: 600 }}>
                            Active
                          </Tag>
                        )}
                      </td>
                      <td>
                        <small className="fw-bold text-success">
                          ₹{parseFloat(user?.balance || 0).toFixed(2)}
                        </small>
                      </td>
                      <td>
                        <small>
                          {user?.created
                            ? new Date(user?.created).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <Tooltip title="Edit User">
                            <button
                              className="btn btn-sm btn-light border p-1"
                              onClick={() =>
                                navigate(`/admin-edit-user/${user?._id}`)
                              }
                              style={{ lineHeight: 1 }}
                            >
                              <EditIcon
                                style={{ fontSize: 18, color: "#2d5533" }}
                              />
                            </button>
                          </Tooltip>

                          <Popconfirm
                            title={
                              isBlocked
                                ? "Unblock this user?"
                                : "Block this user?"
                            }
                            description={
                              isBlocked
                                ? "This user will regain access to login and place orders."
                                : "This user will be logged out and prohibited from logging in or placing orders."
                            }
                            onConfirm={() =>
                              handleToggleBlock(user?._id, user?.block)
                            }
                            okText={isBlocked ? "Yes, Unblock" : "Yes, Block"}
                            cancelText="Cancel"
                            okButtonProps={{
                              danger: !isBlocked,
                              loading: actionLoadingId === user?._id,
                            }}
                          >
                            <Tooltip
                              title={
                                isBlocked ? "Unblock Customer" : "Block Customer"
                              }
                            >
                              <button
                                className={`btn btn-sm ${
                                  isBlocked
                                    ? "btn-success"
                                    : "btn-outline-danger"
                                } p-1`}
                                style={{
                                  lineHeight: 1,
                                  borderRadius: 8,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                                disabled={actionLoadingId === user?._id}
                              >
                                {isBlocked ? (
                                  <>
                                    <LockOpenIcon style={{ fontSize: 16 }} />
                                    <span>Unblock</span>
                                  </>
                                ) : (
                                  <>
                                    <BlockIcon style={{ fontSize: 16 }} />
                                    <span>Block</span>
                                  </>
                                )}
                              </button>
                            </Tooltip>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={totalUsers}
              pageSize={usersPerPage}
              onChange={onPageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
