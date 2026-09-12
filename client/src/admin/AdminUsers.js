import React, { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { message, Pagination, Select } from "antd";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
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

  // Pagination logic
  const totalUsers = allUser?.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const handlePagination = (page) => {
    setCurrentPage(page);
  };

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
        return user?.email.toLowerCase().includes(searchQuery.toLowerCase());
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
        setAllUser(res.data.data);
        setOriginalAllUser(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
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
          <h6>Total Users - {allUser?.length}</h6>
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
                placeholder="Search by email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              defaultValue="50"
              style={{ width: 120 }}
              onChange={(value) => setUsersPerPage(value)}
            >
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
            </Select>
          </div>
          <table className="table user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Reseller</th>
                <th>Block</th>
                <th>Balance</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers &&
                currentUsers.reverse()?.map((user, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <small>{user?.fname}</small>
                      </td>
                      <td>
                        <small>{user?.email}</small>
                      </td>
                      <td>
                        <small>{user?.mobile}</small>
                      </td>
                      <td>
                        <small>{user?.reseller}</small>
                      </td>
                      <td>
                        <small>{user?.block}</small>
                      </td>
                      <td>
                        <small>{user?.balance}</small>
                      </td>
                      <td>
                        <small>
                          {user?.created
                            ? new Date(user?.created).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : ""}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <EditIcon
                            onClick={() =>
                              navigate(`/admin-edit-user/${user?._id}`)
                            }
                            className="me-2 text-muted"
                          />
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
