import './AppealRevenueChart.css';

const AppealRevenueChart = () => {
  const data = [
    { name: 'Quick Donate', value: 51487, color: '#ff6b6b', maxValue: 51500 },
    { name: 'Emergency', value: 30, color: '#51cf66', maxValue: 51500 }
  ];

  return (
    <div className="appeal-revenue-chart">
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="bar-container">
            <div className="bar-label">{item.name}</div>
            <div className="bar-wrapper">
              <div
                className="bar-fill"
                style={{
                  width: `${(item.value / item.maxValue) * 100}%`,
                  backgroundColor: item.color
                }}
              >
                <span className="bar-value">${item.value.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-axis">
        <span>$0</span>
        <span>$500</span>
        <span>$1000</span>
        <span>$1500</span>
      </div>

      <div className="chart-legend-bottom">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppealRevenueChart;
