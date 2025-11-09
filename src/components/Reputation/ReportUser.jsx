import React from 'react';
import './ReportUser.css';

class ReportUser extends React.Component {
  reportUser = () => {
    // User reported
    alert("User reported. Thank you for helping keep our community safe.");
  };

  render() {
    return (
      <button onClick={this.handleReport} className="report-user-button">
        Report User
      </button>
    );
  }
  }


export default ReportUser;