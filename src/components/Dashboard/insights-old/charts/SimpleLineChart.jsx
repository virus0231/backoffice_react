import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const SimpleLineChart = ({ data, color = '#3b82f6', height = 120, showAxes = false }) => {
  // Check if comparison data exists
  const hasComparison = data.some(point => point.comparisonValue !== undefined);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Format the date
      const formatDate = (dateStr) => {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            return dateStr;
          }
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return dateStr;
        }
      };

      // Calculate percentage change if comparison exists
      let percentageChange = null;
      if (data.comparisonValue !== undefined && data.comparisonValue > 0) {
        const change = ((data.value - data.comparisonValue) / data.comparisonValue) * 100;
        percentageChange = change.toFixed(1);
      }

      return (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '1rem',
          minWidth: '200px'
        }}>
          {/* Current Period */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Current Period</div>
            <div style={{ fontSize: '0.75rem', color: '#374151', marginBottom: '0.25rem' }}>{formatDate(data.date)}</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#2563eb' }}>{data.value.toLocaleString()}</div>
          </div>

          {/* Comparison Period */}
          {data.comparisonValue !== undefined && (
            <>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Comparison Period</div>
                <div style={{ fontSize: '0.75rem', color: '#374151', marginBottom: '0.25rem' }}>
                  {data.comparisonDate ? formatDate(data.comparisonDate) : formatDate(data.date)}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#6b7280' }}>{data.comparisonValue.toLocaleString()}</div>
              </div>

              {/* Change Percentage */}
              {percentageChange !== null && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Change:</div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: parseFloat(percentageChange) >= 0 ? '#16a34a' : '#dc2626'
                  }}>
                    {parseFloat(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradient-comparison" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {showAxes && (
          <>
            <XAxis
              dataKey="date"
              hide={!showAxes}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(value) => {
                try {
                  const date = new Date(value);
                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                } catch {
                  return value;
                }
              }}
            />
            <YAxis hide />
          </>
        )}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        {hasComparison && (
          <Area
            type="monotone"
            dataKey="comparisonValue"
            stroke="#9ca3af"
            strokeWidth={1.5}
            strokeOpacity={0.5}
            fill="url(#gradient-comparison)"
            dot={false}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SimpleLineChart;
