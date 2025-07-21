import React from 'react';

const MetricCard = ({ icon: Icon, value, label, className = '' }) => {
  return (
    <div className={`bg-slate-700 text-white p-6 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon size={24} />
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-slate-200 font-medium">{label}</div>
    </div>
  );
};

export default MetricCard;