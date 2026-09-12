import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { message } from "antd";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import IMAGES from "../img/image";
import "./Contact.css";

const Contact = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    type: "",
    msg: [],
  });
  const [error, setError] = useState(false);
  const [mapLoader, setMapLoader] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMapLoader(false);
    }, 1500);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "msg") {
      setForm((prevForm) => ({
        ...prevForm,
        msg: [
          {
            msg: value,
            person: "user",
          },
        ],
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      form?.name === "" ||
      form?.email === "" ||
      form?.mobile === "" ||
      form?.msg.length === 0
    ) {
      setError(true);
      return;
    }
    try {
      const res = await axios.post("/api/contact/add-contact-form", form);
      if (res.data.success) {
        message.success(res.data.message);
        setForm({ name: "", email: "", mobile: "", msg: "" });
        setError(false);
      } else {
        message.error(res.data.message);
        setError(false);
      }
    } catch (error) {
      setError(false);
      console.log(error);
    }
  };

  const getUserData = async () => {
    axios
      .post(
        "/api/user/getUserData",
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        dispatch(setUser(res.data.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <div className="contact-page-container pb-4">
        <div className="contact-row">
          <div className="contact-image text-center">
            <img src={IMAGES.support} alt="Support" />
          </div>
          <div className="contact-form">
            <p>Our Support</p>
            <h2>Zelan Store Support</h2>
            <span>
              Our knowledgeable team is eager to assist you with any inquiries
              you have!
            </span>
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <input
                  onChange={handleChange}
                  name="name"
                  className="form-control"
                  type="text"
                  value={form.name}
                  placeholder="Enter your name"
                />
                {error && form?.name === "" && (
                  <small className="error-text">Please enter your name</small>
                )}
              </div>
              <div className="form-fields">
                <input
                  onChange={handleChange}
                  name="email"
                  className="form-control"
                  type="email"
                  value={form.email}
                  placeholder="Enter your email"
                />
                {error && form?.email === "" && (
                  <small className="error-text">Please enter your email</small>
                )}
              </div>
              <div className="form-fields">
                <input
                  onChange={handleChange}
                  name="mobile"
                  className="form-control"
                  type="text"
                  value={form.mobile}
                  placeholder="Enter your phone number"
                />
                {error && form?.mobile === "" && (
                  <small className="error-text">Please enter your mobile</small>
                )}
              </div>
              <div className="form-fields">
                <select
                  className="form-select"
                  name="type"
                  onChange={handleChange}
                  value={form?.type}
                >
                  <option value="">Select Query Type</option>
                  <option value="Payment Related Query">Payment Related Queries</option>
                  <option value="In-Game Recharge Query">In-Game Recharge Query</option>
                  <option value="Wanted to be a Reseller">Wanted to be a Reseller</option>
                  <option value="others">Other Query</option>
                </select>
                {error && form?.type === "" && (
                  <small className="error-text">Select Query Type</small>
                )}
              </div>
              <div className="form-fields">
                <textarea
                  onChange={handleChange}
                  className="form-control"
                  value={
                    form.msg.length > 0
                      ? form.msg[form.msg.length - 1].msg
                      : ""
                  }
                  name="msg"
                  rows="3"
                  placeholder="How can we help you?"
                ></textarea>
                {error && form?.msg.length === 0 && (
                  <small className="error-text">Please enter your message</small>
                )}
              </div>
              <button type="submit" className="theme-btn w-100">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
