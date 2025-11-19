import './PopularProductList.css';

const PopularProductList = () => {
  const products = [
    {
      id: 1,
      name: 'Quick Donate',
      value: 1487.0,
      sales: '19 sold',
      bgColor: '#e3f2fd'
    },
    {
      id: 2,
      name: 'Emergency',
      value: 30.0,
      sales: '2668',
      bgColor: '#fff3e0'
    }
  ];

  return (
    <div className="popular-product-list">
      {products.map((product) => (
        <div key={product.id} className="product-item">
          <div className="product-image" style={{ backgroundColor: product.bgColor }}>
            <span className="product-placeholder">{product.name.slice(0, 1)}</span>
          </div>
          <div className="product-info">
            <div className="product-sales">
              <span className="sales-badge">{product.sales}</span>
            </div>
            <div className="product-name">{product.name}</div>
          </div>
          <div className="product-value">{product.value.toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
};

export default PopularProductList;
