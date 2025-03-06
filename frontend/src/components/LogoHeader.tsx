import React from "react";
import "../styles/LogoHeader.css"; 

const LogoHeader: React.FC = () => {
  return (
    <div className="logo-header">
      <img src="/icon.svg" alt="HostIQ Logo" className="logo-image" />
      <div className="vertical-separator"></div>
      <h1 className="app-name">HostIQ</h1>
    </div>
  );
};

export default LogoHeader;
