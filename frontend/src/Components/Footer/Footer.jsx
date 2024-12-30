import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from "react-icons/fa";
import logo_crown from '../Assets/logo-crown-white.png'
const Footer = () => {
  return (
    <div className="footer">
      <div className="newsletter-section">
        <h1>STAY UP TO DATE ABOUT OUR LATEST OFFERS</h1>
        <p>Enter your email address below to subscribe to Eleganza</p>
        <div className="input-section">
          <input type="email" placeholder="Enter your email address" />
          <button>Subscribe</button>
        </div>
      </div>

      <div className="footer-links">
        <div className="footer-left">
            <img src={logo_crown} alt="Eleganza Logo" className="footer-logo" />
          <div className="social-icons">
            <FaFacebookF />
            <FaInstagram />
            <FaTwitter />
            <FaPinterestP />
          </div>
        </div>

        <div className="footer-center">
          <h3>COMPANY</h3>
          <ul>
            <li>About</li>
            <li>Features</li>
            <li>Works</li>
            <li>Careers</li>
          </ul>
        </div>

        <div className="footer-center">
          <h3>HELP</h3>
          <ul>
            <li>Customer Support</li>
            <li>Delivery Details</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-right">
          <h3>FAQ</h3>
          <ul>
            <li>Account</li>
            <li>Manage Deliveries</li>
            <li>Orders</li>
            <li>Payments</li>
          </ul>
        </div>

        <div className="footer-right">
          <h3>RESOURCES</h3>
          <ul>
            <li>Free eBooks</li>
            <li>Development Tutorial</li>
            <li>How-to Blog</li>
            <li>YouTube Playlist</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
