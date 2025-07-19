import React from "react";

const ReportHeader = ({ title }) => {
  return (
    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
      {title}
    </h2>
  );
};

export default ReportHeader;