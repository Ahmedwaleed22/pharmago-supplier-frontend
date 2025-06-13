import Product from "./product";

interface ProductsGridProps {
  products: Product.Medicine[];
}

function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductsGrid;
