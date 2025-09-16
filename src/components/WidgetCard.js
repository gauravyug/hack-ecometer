// src/components/WidgetCard.js
import React from 'react';
import './WidgetCard.css'; // optional for styling

function WidgetCard({ title, value, unit, icon }) {
  return (
    <div className="widget-card">
      {icon && <div className="icon">{icon}</div>}
      <h3>{title}</h3>
      <p className="value">{value} {unit}</p>
    </div>
  );
}

export default WidgetCard;
