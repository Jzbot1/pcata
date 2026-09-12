import React from "react";
import Layout from "../components/Layout/Layout";
import "./Terms.css";

const RefundPolicy = () => {
  return (
    <Layout>
      <section className="bg-heading">
        <h4>
          <b>Refund Policy</b>
        </h4>
      </section>
      <section className="terms-container">
        <h5>Refund Eligibility</h5>
        <p>
          - Refunds will not be processed if incorrect details are provided.
        </p>

        <h5 className="mt-5">Valid Reasons for Refunds</h5>
        <p>
          - Refunds will be considered for unauthorized transactions, technical
          issues causing non-delivery of in-game items, or other verifiable
          errors.
        </p>

        <h5 className="mt-5">Refund Process</h5>
        <p>
          - Users should submit refund requests via our customer support email
          at <b>zelanstoreofficial@gmail.com</b>.
        </p>
        <p>
          - Provide the transaction details, including the order number, date of
          purchase, and a detailed explanation of the issue.
        </p>

        <h5 className="mt-5">Refund Approval</h5>
        <p>- Refunds are subject to approval and may require investigation.</p>
        <p>
          - We reserve the right to refuse a refund if the request is beyond the
          specified refund period or if we determine the purchase was not made
          in good faith.
        </p>

        <h5 className="mt-5">Refund Methods</h5>
        <p>
          - Approved refunds will be processed using the original payment
          method.
        </p>
        <p>- In certain cases, alternative refund methods may be considered.</p>

        <h5 className="mt-5">Non-Refundable Items</h5>
        <p>
          - Certain in-game items or services may be non-refundable. Users are
          advised to check product descriptions before making a purchase.
        </p>

        <h5 className="mt-5">Chargebacks</h5>
        <p>
          - Users are encouraged to contact us for resolution before initiating
          any chargebacks. Chargebacks may result in the suspension of accounts.
        </p>

        <h5 className="mt-5">Policy Changes</h5>
        <p>
          - We reserve the right to update or modify the refund policy at any
          time. Users will be notified of any changes.
        </p>

        <p>
          <i>
            By using our website and making in-game purchases, users acknowledge
            and agree to abide by this refund policy.
          </i>
        </p>
      </section>
    </Layout>
  );
};

export default RefundPolicy;
