import Product from "./product";

interface ProductsGridProps {
  products: Product.Medicine[];
}

function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-3 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductsGrid;
