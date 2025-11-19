import './MonthlyRevenueChart.css';

const MonthlyRevenueChart = () => {
  const data = [
    { month: 'Nov 2025', value: 213088, color: '#ff9f43' }
  ];

  return (
    <div className="monthly-revenue-chart">
      <div className="chart-header-monthly">
        <h4 className="chart-subtitle-monthly">Monthly Revenue</h4>
        <button className="chart-menu-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="19" cy="12" r="1" fill="currentColor" />
            <circle cx="5" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="monthly-chart-container">
        <div className="y-axis-monthly">
          <span>$6000</span>
          <span>$5000</span>
          <span>$4000</span>
          <span>$3000</span>
          <span>$2000</span>
          <span>$1000</span>
          <span>$0</span>
        </div>

        <div className="chart-area">
          <div className="horizontal-line"></div>
          <div className="horizontal-line"></div>
          <div className="horizontal-line"></div>
          <div className="horizontal-line"></div>
          <div className="horizontal-line"></div>
          <div className="horizontal-line"></div>

          <div className="revenue-bar-container">
            <div
              className="revenue-bar"
              style={{
                width: '80%',
                height: '200px',
                backgroundColor: data[0].color
              }}
            >
              <span className="revenue-value">${(data[0].value / 1000).toFixed(1)}k</span>
            </div>
            <div className="month-label">{data[0].month}</div>
          </div>
        </div>
      </div>

      <div className="chart-footer">
        <div className="x-axis-label">Months</div>
        <div className="chart-legend-monthly">
          <div className="legend-item-monthly">
            <div className="legend-circle" style={{ backgroundColor: data[0].color }}></div>
            <span>{data[0].month}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
