import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { message } from "antd";
import axios from "axios";
import "./AdminBanners.css";

const AdminBanners = () => {
  const imageRef = useRef();
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [seq, setSeq] = useState("");
  const [heading, setHeading] = useState("");
  const [title, setTitle] = useState("");
  const [banners, setBanners] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null); // New state for editing

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link || !seq) {
      return message.error("Please enter all required fields");
    }
    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      }
      formData.append("link", link);
      formData.append("seq", seq);
      formData.append("heading", heading);
      formData.append("title", title);

      let res;
      if (editingBanner) {
        // Update existing banner
        formData.append("id", editingBanner._id);
        res = await axios.post("/api/banner/edit-banner", formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
      } else {
        // Add new banner
        res = await axios.post("/api/banner/add-banner", formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
      }

      if (res.data.success) {
        message.success(res.data.message);
        getBanners();
        resetForm();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to submit banner");
    }
  };

  const resetForm = () => {
    setFile(null);
    setLink("");
    setSeq("");
    setHeading("");
    setTitle("");
    setEditingBanner(null);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setLink(banner.link);
    setSeq(banner.seq);
    setHeading(banner?.heading);
    setTitle(banner?.title);
  };

  async function getBanners() {
    try {
      const res = await axios.get("/api/banner/get-banners", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setBanners(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getBanners();
  }, []);

  
  async function handleDeleteBanner(id) {
    try {
      const res = await axios.post(
        "/api/banner/delete-banner",
        { id: id },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getBanners();
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-users">
        <div className="noti-container rounded">
          <h5 className="text-dark mb-4">
            {editingBanner ? "Edit Banner" : "Add Banner"} (1000 x 435)
          </h5>
          <div className="form-fields">
            <input
              type="file"
              name="image"
              className="form-control mb-3"
              onChange={(e) => setFile(e.target.files[0])}
              ref={imageRef}
            />
            <input
              type="text"
              name="link"
              className="form-control mb-3"
              placeholder="Enter link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <input
              type="text"
              name="seq"
              className="form-control mb-3"
              placeholder="Enter Seq"
              value={seq}
              onChange={(e) => setSeq(e.target.value)}
            />
            <input
              type="text"
              name="heading"
              className="form-control mb-3"
              placeholder="Enter Heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
            <input
              type="text"
              name="title"
              className="form-control mb-3"
              placeholder="Enter Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="login-btn bg-danger text-light" onClick={handleSubmit}>
              {editingBanner ? "Update" : "Submit"}
            </button>
          </div>
          <div className="mt-4 rounded border overflow-scroll">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Seq</th>
                  <th>Banner</th>
                  <th>Heading</th>
                  <th>Title</th>
                  <th>Link</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {banners?.map((item, index) => {
                  return (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item?.seq}</td>
                      <td>
                        <img
                          width="80px"
                          src={`https://zelanstore.com/${item?.image}`}
                          alt=""
                          loading="lazy"
                        />
                      </td>
                      <td className="no-wrap">{item?.heading}</td>
                      <td className="no-wrap">{item?.title}</td>
                      <td>{item?.link}</td>
                      <td className="d-flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(item?._id)}
                          className="btn btn-danger"
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
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
