import './WeeklyTransactionChart.css';

const WeeklyTransactionChart = () => {
  const data = [
    { date: '04-Nov', value: 0, color: '#ff9f43' },
    { date: '07-Nov', value: 0, color: '#4fd1c5' },
    { date: '11-Nov', value: 212500, color: '#7e57c2' },
    { date: '15-Nov', value: 0, color: '#ec4899' },
    { date: '18-Nov', value: 0, color: '#10b981' },
    { date: '22-Nov', value: 0, color: '#f59e0b' },
    { date: '26-Nov', value: 0, color: '#3b82f6' },
    { date: '30-Nov', value: 0, color: '#ef4444' },
    { date: '12-Nov', value: 213088, color: '#ff9f43' }
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="weekly-transaction-chart">
      <div className="chart-header">
        <h4 className="chart-subtitle">Weekly Transaction Revenue</h4>
        <button className="chart-menu-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      <div className="y-axis-labels">
        <span>$500000</span>
        <span>$400000</span>
        <span>$300000</span>
        <span>$200000</span>
        <span>$100000</span>
        <span>$0</span>
      </div>

      <div className="chart-container">
        {data.map((item, index) => (
          <div key={index} className="chart-bar-wrapper">
            <div className="chart-bar-column">
              <div
                className="chart-bar-fill"
                style={{
                  height: item.value > 0 ? `${(item.value / 500000) * 100}%` : '0%',
                  backgroundColor: item.color
                }}
              >
                {item.value > 0 && (
                  <span className="bar-value-label">${(item.value / 1000).toFixed(0)}k</span>
                )}
              </div>
            </div>
            <div className="chart-bar-label">{item.date}</div>
          </div>
        ))}
      </div>

      <div className="chart-x-label">Date</div>

      <div className="chart-legend-horizontal">
        {['04-Nov', '11-Nov', '18-Nov', '25-Nov', '12-Nov'].map((date, index) => (
          <div key={index} className="legend-item-horizontal">
            <div className="legend-dot" style={{ backgroundColor: data[index]?.color }}></div>
            <span>{date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyTransactionChart;
