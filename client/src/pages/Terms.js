import React from "react";
import Layout from "../components/Layout/Layout";
import "./Terms.css";

const TermsAndConditions = () => {
  return (
    <Layout>
      <div className="bg-heading">
        <h4>
          <b>Terms & Conditions</b>
        </h4>
      </div>
      <div className="terms-container">
        <p>
          Please read the following terms and conditions carefully before using
          our website and services:
        </p>

        <h5 className="mt-5">Acceptance of Terms:</h5>
        <p>
          - By accessing or using our website and services, you agree to comply
          with and be bound by these terms and conditions.
        </p>

        <h5 className="mt-5">User Eligibility:</h5>
        <p>
          - Users must be at least 13 years old to use our services. By using
          our services, you confirm that you meet this age requirement.
        </p>

        <h5 className="mt-5">Account Information:</h5>
        <p>
          - Users are responsible for maintaining the confidentiality of their
          account information, including login credentials. Any activity
          conducted under your account is your responsibility.
        </p>

        <h5 className="mt-5">In-Game Purchases:</h5>
        <p>
          - In-game purchases are subject to our refund policy. Users are solely
          responsible for all transactions made through their accounts.
        </p>

        <h5 className="mt-5">Intellectual Property:</h5>
        <p>
          - All content on our website, including but not limited to text,
          graphics, logos, and images, is the property of ZELAN STORE and is
          protected by intellectual property laws.
        </p>

        <h5 className="mt-5">Prohibited Activities:</h5>
        <p>
          - Users must not engage in any unlawful or prohibited activities,
          including but not limited to hacking, data mining, or any actions that
          could disrupt the integrity of our services.
        </p>

        <h5 className="mt-5">Third-Party Links:</h5>
        <p>
          - Our website may contain links to third-party websites. We are not
          responsible for the content or practices of these websites and
          encourage users to review their terms and conditions.
        </p>

        <h5 className="mt-5">Disclaimer of Warranties:</h5>
        <p>
          - Our services are provided "as is" without any warranty. We do not
          guarantee the accuracy, completeness, or reliability of our services.
        </p>

        <h5 className="mt-5">Limitation of Liability:</h5>
        <p>
          - ZELAN STORE and its affiliates are not liable for any direct,
          indirect, incidental, or consequential damages resulting from the use
          of our services.
        </p>

        <h5 className="mt-5">Modification of Terms:</h5>
        <p>
          - We reserve the right to modify these terms and conditions at any
          time. Users will be notified of significant changes.
        </p>

        <h5 className="mt-5">Governing Law:</h5>
        <p>
          - These terms and conditions are governed by the laws of Jurisdiction.
          Any disputes shall be resolved in the courts of Jurisdiction.
        </p>

        <h5 className="mt-5">Contact Information:</h5>
        <p>
          - For inquiries related to these terms and conditions, please contact
          us at{" "}
          <span>
            <b>zelanstoreofficial@gmail.com</b>
          </span>
          .
        </p>

        <p>
          <i>
            By using our website and services, you agree to abide by these terms
            and conditions. If you do not agree with any part of these terms,
            please refrain from using our services.
          </i>
        </p>
      </div>
    </Layout>
  );
};

export default TermsAndConditions;
