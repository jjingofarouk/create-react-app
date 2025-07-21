import React from "react";

const ReportHeader = ({ title }) => {
  return (
    <div className="flex items-center gap-4">
      <img src="./logo.jpg" alt="Logo" className="w-12 h-12" />
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        {title}
      </h2>
    </div>
  );
};

export default ReportHeader;