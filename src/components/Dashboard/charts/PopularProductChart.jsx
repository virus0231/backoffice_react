import './PopularProductChart.css';

const PopularProductChart = () => {
  // Data for the donut chart
  const data = [
    { name: 'Quick Donate', value: 98, color: '#4fd1c5' },
    { name: 'Emergency', value: 2, color: '#9f7aea' }
  ];

  // Calculate the circumference and stroke dash array for the donut chart
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const quickDonateLength = (data[0].value / 100) * circumference;
  const emergencyLength = (data[1].value / 100) * circumference;

  return (
    <div className="popular-product-chart">
      <div className="donut-chart-container">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={data[0].color}
            strokeWidth="40"
            strokeDasharray={`${quickDonateLength} ${circumference}`}
            transform="rotate(-90 110 110)"
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={data[1].color}
            strokeWidth="40"
            strokeDasharray={`${emergencyLength} ${circumference}`}
            strokeDashoffset={-quickDonateLength}
            transform="rotate(-90 110 110)"
          />
          <text
            x="110"
            y="110"
            textAnchor="middle"
            dy=".3em"
            fontSize="32"
            fontWeight="600"
            fill="#333"
          >
            {data[0].value}%
          </text>
        </svg>
      </div>

      <div className="chart-legend">
        {data.map((item) => (
          <div key={item.name} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <span className="legend-label">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularProductChart;
