import Product from "./product";

interface ProductsGridProps {
  products: Product.Medicine[];
}

function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {products.map((product) => (
        <div key={product.id} className="w-[220px] flex-shrink-0">
          <Product product={product} />
        </div>
      ))}
    </div>
  );
}

export default ProductsGrid;
