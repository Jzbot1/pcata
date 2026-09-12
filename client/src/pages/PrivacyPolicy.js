import React from "react";
import Layout from "../components/Layout/Layout";
import "./Terms.css";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="bg-heading">
        <h4>
          <b>Privacy Policy</b>
        </h4>
      </div>
      <div className="terms-container">
        <p>Last updated: 24 July 2024</p>
        <h5 className="mt-5">Information Collection:</h5>
        <p>
          - We gather personal data such as names, email addresses, and payment
          information exclusively to process in-game purchases and provide a
          tailored gaming experience.
        </p>

        <h5 className="mt-5">Usage of Information:</h5>
        <p>
          - The collected personal data is utilized to facilitate transactions,
          deliver purchased in-game items, and improve the overall user
          experience within the game.
        </p>

        <h5 className="mt-5">Data Security:</h5>
        <p>
          - We use industry-standard security protocols to safeguard user
          information from unauthorized access, disclosure, alteration, or
          destruction.
        </p>

        <h5 className="mt-5">Third-Party Services:</h5>
        <p>
          - We may engage third-party services for payment processing and
          analytics. Users are encouraged to review the privacy policies of
          these services to understand their data handling practices.
        </p>

        <h5 className="mt-5">Cookies:</h5>
        <p>
          -Our website employs cookies to enhance the user experience. Users
          have the option to manage their cookie preferences through their
          browser settings.
        </p>

        <h5 className="mt-5">User Consent:</h5>
        <p>
          - By using our website and making in-game purchases, users agree to
          the collection, processing, and storage of their personal information
          as described in this privacy policy.
        </p>

        <h5 className="mt-5">Children's Privacy:</h5>
        <p>
          - Our services are not intended for children under the age of 13. We
          do not knowingly collect personal information from children. Parents
          or guardians should ensure minors do not provide personal information.
        </p>

        <h5 className="mt-5">Data Retention:</h5>
        <p>
          - We retain user data for as long as necessary to meet the purposes
          outlined in this privacy policy, unless a longer retention period is
          mandated or permitted by law.
        </p>

        <h5 className="mt-5">Communication:</h5>
        <p>
          - Users may receive periodic emails related to their in-game
          purchases, updates, and promotional offers. They have the option to
          opt out of promotional communications.
        </p>

        <h5 className="mt-5">Policy Changes:</h5>
        <p>
          - We reserve the right to update or modify this privacy policy at any
          time. Users will be notified of any significant changes.
        </p>

        <h5 className="mt-5">Contact Information:</h5>
        <p>
          - For any privacy-related concerns or inquiries, users can reach out
          to us. <Link to="/support">Click Here</Link>
        </p>
        <p>
          <i>
            By using our website and services, users agree to the terms outlined
            in this privacy policy.
          </i>
        </p>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
