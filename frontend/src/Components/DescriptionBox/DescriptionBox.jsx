import React from 'react';
import './DescriptionBox.css';

const DescriptionBox = ({ description }) => {
  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box active">Description</div>
        <div className="descriptionbox-nav-box fade">Review (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>{description || 'No description available for this product.'}</p>
      </div>
    </div>
  );
};

export default DescriptionBox;
