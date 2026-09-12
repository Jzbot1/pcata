import React, { useState, useEffect } from "react";
import { message, Modal, Pagination } from "antd";
import axios from "axios";
import "./AdminWalletHistor.css";
import AdminLayout from "./AdminLayout";

const AdminWalletHistory = () => {
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState(null);
  const [filteredHistories, setFilteredHistories] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(50);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({
    email: "",
    userId: "",
    orderId: "",
    startDate: "",
    endDate: "",
  });

  const totalHistories = filteredHistories?.length || histories?.length;

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentHistories = filteredHistories
    ? filteredHistories.slice(indexOfFirstUser, indexOfLastUser)
    : histories?.slice(indexOfFirstUser, indexOfLastUser);

  // Fetch wallet histories (default or with filters)
  const fetchHistories = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/wallet/gethistories",
        filters, // Directly pass filters
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setHistories(res.data.data.reverse());
        setFilteredHistories(null); // Reset filtered histories
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error.message);
    }
  };
  

  // Handle search with filters
  const handleSearch = async () => {
    setIsFilterModalVisible(false)
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/wallet/gethistories",
        searchParams,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setFilteredHistories(res.data.data.reverse());
        setLoading(false);
        setCurrentPage(1);
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error.message);
    }
  };

  // View all histories without filters
  const handleViewAllHistories = () => {
    setIsFilterModalVisible(false)
    setSearchParams({
      email: "",
      userId: "",
      orderId: "",
      startDate: "",
      endDate: "",
    });
    fetchHistories({});
    setCurrentPage(1); // Reset to first page
  };

  // Clear filters and reset to default (current date)
  const handleClearFilters = () => {
    setIsFilterModalVisible(false)
    const currentDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];
    setSearchParams({
      email: "",
      userId: "",
      orderId: "",
      startDate: "",
      endDate: "",
    });
    fetchHistories({ startDate: currentDate, endDate: currentDate });
    setCurrentPage(1); // Reset to first page
  };

  useEffect(() => {
    const currentDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];
    setSearchParams({
      email: "",
      userId: "",
      orderId: "",
      startDate: currentDate,
      endDate: currentDate,
    });
    fetchHistories({ startDate: '', endDate: '' });
  }, []);
  

  

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Wallet Histories</h5>
          <h6 className="mb-0">Total - {totalHistories}</h6>
        </div>
        {/* <hr /> */}
        {/* <div className="tools d-none d-md-block d-lg-block">
          <div className="form-fields center gap-2 mb-2">
            <input
              className="form-control"
              type="text"
              placeholder="Search by email"
              value={searchParams.email}
              onChange={(e) =>
                setSearchParams({ ...searchParams, email: e.target.value })
              }
            />
            <input
              className="form-control"
              type="text"
              placeholder="Search by order ID"
              value={searchParams.orderId}
              onChange={(e) =>
                setSearchParams({ ...searchParams, orderId: e.target.value })
              }
            />
            <input
              className="form-control"
              type="date"
              placeholder="Start Date"
              value={searchParams.startDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, startDate: e.target.value })
              }
            />
            <input
              className="form-control"
              type="date"
              placeholder="End Date"
              value={searchParams.endDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, endDate: e.target.value })
              }
            />
            <button className="btn btn-primary h-100 search-button" onClick={handleSearch}>
              Search
            </button>
            <button className="btn btn-primary h-100 clear-button" onClick={handleClearFilters}>
              Clear
            </button>
            <button
              className="btn btn-primary no-wrap h-100 view-all-button"
              onClick={handleViewAllHistories}
            >
              View All
            </button>
          </div>
        </div> */}
        {/* <button className="btn btn-primary h-100 w-100 mb-2 clear-button d-block d-lg-none d-md-none" onClick={()=>{setIsFilterModalVisible(true)}}>
            Open Filter
        </button> */}
        {/* <Modal
          title="Filters"
          visible={isFilterModalVisible}
          onCancel={() => setIsFilterModalVisible(false)}
          footer={null}
          width={300}
          centered
        >
          <div className="form-field d-flex flex-column gap-2">
            <input
              className="form-control"
              type="text"
              placeholder="Search by email"
              value={searchParams.email}
              onChange={(e) =>
                setSearchParams({ ...searchParams, email: e.target.value })
              }
            />
            <input
              className="form-control"
              type="text"
              placeholder="Search by order ID"
              value={searchParams.orderId}
              onChange={(e) =>
                setSearchParams({ ...searchParams, orderId: e.target.value })
              }
            />
            <input
              className="form-control"
              type="date"
              placeholder="Start Date"
              value={searchParams.startDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, startDate: e.target.value })
              }
            />
            <input
              className="form-control"
              type="date"
              placeholder="End Date"
              value={searchParams.endDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, endDate: e.target.value })
              }
            />
            <button className="btn btn-primary h-100 search-button" onClick={handleSearch}>
              Search
            </button>
            <button className="btn btn-primary h-100 clear-button" onClick={handleClearFilters}>
              Clear
            </button>
            <button
              className="btn btn-primary no-wrap h-100 view-all-button"
              onClick={handleViewAllHistories}
            >
              View All
            </button>
          </div>
        </Modal> */}
        <div className="table-container">
          {loading?
          <div className="loader">
              <span className="loader-text">loading</span>
              <span className="load"></span>
            </div>
            :
            <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Email</th>
                <th>Before</th>
                <th>Amount</th>
                <th>After</th>
                <th>Info</th>
                <th>Type</th>
                <th>Action</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentHistories?.length === 0 ? (
                <tr className="text-center">
                  <td colSpan="10">No Records Found</td>
                </tr>
              ) : (
                currentHistories?.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1 + indexOfFirstUser}</td>
                    <td>{item.orderId}</td>
                    <td>{item.email}</td>
                    <td className={`fw-bold`}>{item.balanceBefore}₹</td>
                    <td className={`fw-bold d-flex align-items-center gap-2  ${(item?.type === "order" || item?.type === "withdrawalmoney") ? "text-danger" : "text-success"}`}>
                      <div>
                        {item.price}₹ 
                      </div>
                      {item.bonus && <div className="text-dark fw-none no-wrap"><small>{`(${item?.bonus} bonus)`}</small></div>}
                    </td>
                    <td className="fw-bold">{item.balanceAfter}₹</td>
                    <td className="no-wrap">{item.p_info}</td>
                    <td className={`${(item?.type === "order" || item?.type === "withdrawalmoney") ? "text-danger" : "text-success"}`}>{item.type}</td>
                    <td className="no-wrap">{item.admin ? "By Admin" : "By User"}</td>
                    <td className="no-wrap">
                      <small>
                        {new Date(item?.created).toLocaleString("default", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                        })}
                      </small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          }
          <div className="pagination-container">
            <Pagination
              current={currentPage}
              total={totalHistories}
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

export default AdminWalletHistory;
