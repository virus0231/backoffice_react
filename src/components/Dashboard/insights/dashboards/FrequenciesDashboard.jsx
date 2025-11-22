import './FrequenciesDashboard.css';

const FrequenciesDashboard = () => {
  // Sample data
  const frequencyData = [
    { date: '2024-01-01', oneTime: 3200, recurring: 2800, recurringFirst: 1200, recurringNext: 1600 },
    { date: '2024-01-02', oneTime: 4100, recurring: 3200, recurringFirst: 1400, recurringNext: 1800 },
    { date: '2024-01-03', oneTime: 2800, recurring: 2400, recurringFirst: 1000, recurringNext: 1400 },
    { date: '2024-01-04', oneTime: 5200, recurring: 3600, recurringFirst: 1600, recurringNext: 2000 },
    { date: '2024-01-05', oneTime: 6100, recurring: 4200, recurringFirst: 1800, recurringNext: 2400 }
  ];

  const maxValue = Math.max(...frequencyData.flatMap(d => [d.oneTime, d.recurring, d.recurringFirst, d.recurringNext]));

  const frequencies = [
    { label: 'One-time', color: '#3b82f6', key: 'oneTime', total: 21400 },
    { label: 'Recurring', color: '#10b981', key: 'recurring', total: 16200 },
    { label: 'Recurring-first', color: '#f59e0b', key: 'recurringFirst', total: 7000 },
    { label: 'Recurring-next', color: '#8b5cf6', key: 'recurringNext', total: 9200 }
  ];

  return (
    <div className="frequencies-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Frequencies</h2>
      </div>

      <div className="frequencies-chart">
        <svg viewBox="0 0 700 256" className="multi-line-chart">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 64}
              x2="700"
              y2={i * 64}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Line for each frequency */}
          {frequencies.map((freq, freqIndex) => (
            <g key={freqIndex}>
              <path
                d={`
                  M 0 ${256 - (frequencyData[0][freq.key] / maxValue) * 200}
                  ${frequencyData.map((d, i) => `L ${(i / (frequencyData.length - 1)) * 700} ${256 - (d[freq.key] / maxValue) * 200}`).join(' ')}
                `}
                fill="none"
                stroke={freq.color}
                strokeWidth="2"
              />
              {frequencyData.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (frequencyData.length - 1)) * 700}
                  cy={256 - (d[freq.key] / maxValue) * 200}
                  r="3"
                  fill={freq.color}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="frequencies-legend">
        {frequencies.map((freq, index) => (
          <div key={index} className="legend-item">
            <div className="legend-indicator" style={{ backgroundColor: freq.color }} />
            <div className="legend-content">
              <div className="legend-label">{freq.label}</div>
              <div className="legend-value">${freq.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrequenciesDashboard;
