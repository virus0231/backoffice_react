import { useState } from 'react';
import './PaymentMethodsDashboard.css';

const PaymentMethodsDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data
  const paymentMethodsData = [
    { date: '2024-01-01', cc: 2800, applepay: 800, gpay: 600, paypal: 1200, stripe: 900, paypalipn: 400 },
    { date: '2024-01-02', cc: 3200, applepay: 950, gpay: 720, paypal: 1400, stripe: 1100, paypalipn: 500 },
    { date: '2024-01-03', cc: 2400, applepay: 680, gpay: 540, paypal: 980, stripe: 750, paypalipn: 350 },
    { date: '2024-01-04', cc: 3600, applepay: 1100, gpay: 850, paypal: 1600, stripe: 1250, paypalipn: 580 },
    { date: '2024-01-05', cc: 4200, applepay: 1300, gpay: 980, paypal: 1850, stripe: 1450, paypalipn: 680 }
  ];

  const paymentMethods = [
    { label: 'Credit Card', color: '#3b82f6', key: 'cc', total: 16200 },
    { label: 'Apple Pay', color: '#10b981', key: 'applepay', total: 4830 },
    { label: 'Google Pay', color: '#f59e0b', key: 'gpay', total: 3690 },
    { label: 'PayPal', color: '#8b5cf6', key: 'paypal', total: 7030 },
    { label: 'Stripe', color: '#ec4899', key: 'stripe', total: 5450 },
    { label: 'PayPal IPN', color: '#14b8a6', key: 'paypalipn', total: 2510 }
  ];

  const maxValue = Math.max(...paymentMethodsData.flatMap(d => Object.values(d).filter(v => typeof v === 'number')));

  const totalPages = Math.ceil(paymentMethods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMethods = paymentMethods.slice(startIndex, endIndex);

  return (
    <div className="payment-methods-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Payment methods</h2>
      </div>

      <div className="payment-chart">
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

          {/* Line for each payment method */}
          {paymentMethods.map((method, methodIndex) => (
            <g key={methodIndex}>
              <path
                d={`
                  M 0 ${256 - (paymentMethodsData[0][method.key] / maxValue) * 200}
                  ${paymentMethodsData.map((d, i) => `L ${(i / (paymentMethodsData.length - 1)) * 700} ${256 - (d[method.key] / maxValue) * 200}`).join(' ')}
                `}
                fill="none"
                stroke={method.color}
                strokeWidth="2"
              />
              {paymentMethodsData.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (paymentMethodsData.length - 1)) * 700}
                  cy={256 - (d[method.key] / maxValue) * 200}
                  r="3"
                  fill={method.color}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <div className="payment-legend">
        <div className="legend-grid">
          {currentMethods.map((method, index) => (
            <div key={index} className="legend-item">
              <div className="legend-indicator" style={{ backgroundColor: method.color }} />
              <div className="legend-content">
                <div className="legend-label">{method.label}</div>
                <div className="legend-value">${method.total.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsDashboard;
