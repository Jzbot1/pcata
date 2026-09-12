import React from "react";
import "./CompleteProfileLayout.css";
import { Link } from "react-router-dom";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LockIcon from "@mui/icons-material/Lock";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const CompleteProfileLayout = ({ children }) => {
  return (
    <React.Fragment>
      <header className="complete-profile-header">
        <div className="mslogo caveat">Muslimsaathi</div>
      </header>
      <div>{children}</div>
      <footer>
        <div className="container pt-5 text-center">
          <div className="row">
            <h4>Why register on Muslimmsaathi.in?</h4>
            <div className="text-center">
              <div className="green-line my-4"></div>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3 my-4">
              <div className="c-profile-icon">
                <LocalPoliceIcon className="icon" />
              </div>
              <h6>No. 1 Rated Site of India</h6>
              <p>
                Most Recommened <br /> Matchmaking Service
              </p>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3 my-4">
              <div className="c-profile-icon">
                <PeopleAltIcon className="icon" />
              </div>
              <h6>History of Success</h6>
              <p>
                6 Million Matches <br />
                and counting!
              </p>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3 my-4">
              <div className="c-profile-icon">
                <LockIcon className="icon" />
              </div>
              <h6>100% Privacy</h6>
              <p>
                100% Control on your <br />
                Photos and info
              </p>
            </div>
            <div className="col-12 col-sm-12 col-md-3 col-lg-3 my-4">
              <div className="c-profile-icon">
                <DoneAllIcon className="icon" />
              </div>
              <h6>Fully Secure</h6>
              <p>
                Patent pending technology <br /> for your safety
              </p>
            </div>
          </div>
        </div>
        <hr />
        <div className="copyright container pb-4 text-center">
          <span>All Rights Reserved © 2024 | ZELAN STORE</span>
        </div>
      </footer>
    </React.Fragment>
  );
};

export default CompleteProfileLayout;
