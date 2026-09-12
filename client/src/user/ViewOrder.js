import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import DashboardLayout from "./components/DashboardLayout";
import axios from "axios";
import { useParams } from "react-router-dom";
import { message } from "antd";

const ViewOrder = () => {
  const params = useParams();
  const [singleOrder, setSingleOrder] = useState(null);

  const getOrderById = async () => {
    try {
      const res = await axios.post(
        "/api/order/get-order-by-id",
        {
          orderId: params?.orderId,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setSingleOrder(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOrderById();
  }, []);
  return (
    <Layout>
      <DashboardLayout>
        <div className="bg-warning p-3 rounded">
          <span>
            Order #{singleOrder?.orderId} was place on{" "}
            {singleOrder?.createdAt
              ? new Date(singleOrder.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}{" "}
            and is currently {singleOrder?.status}
          </span>
        </div>
        <div className="rounded overflow-hidden mt-2">
          <table className="table table-bordered table-striped table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Product</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ID</td>
                <td>{singleOrder?.orderId}</td>
              </tr>
              <tr>
                <td>Price</td>
                <td>Rs. {singleOrder?.price}</td>
              </tr>
              {singleOrder?.discount && <tr>
                <td>Discount</td>
                <td className={`${singleOrder?.status === "failed"? "bg-danger text-light" : "bg-success text-light"}`}>{singleOrder?.discount}</td>
              </tr>}
              <tr>
                <td>Status</td>
                <td>{singleOrder?.status}</td>
              </tr>
              <tr>
                <td>Amount (QTY) </td>
                <td>{singleOrder?.p_info}</td>
              </tr>
              <tr>
                <td>PlayerId/User ID</td>
                <td>{singleOrder?.userId || singleOrder?.playerId}</td>
              </tr>
              {singleOrder?.zoneId !== "" && singleOrder?.zoneId !== null && (
                <tr>
                  <td>Zone ID</td>
                  <td>{singleOrder?.zoneId}</td>
                </tr>
              )}
              <tr>
                <td>Date</td>
                <td>
                  {singleOrder?.createdAt
                    ? new Date(singleOrder.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : ""}
                </td>
              </tr>
              <tr>
                <td>Payment Mode</td>
                <td>{singleOrder?.paymentMode?.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    </Layout>
  );
};

export default ViewOrder;
