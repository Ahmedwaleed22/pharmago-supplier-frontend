import { formatPrice } from "@/helpers/products";
import Image from "next/image";
import React from "react";

function Product({ product }: { product: Product.Medicine }) {
  return (
    <div
      key={product.id}
      className="h-full w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-3 relative cursor-pointer"
    >
      <div className="absolute left-3 top-2">
        {product.tag && (
        <span
          className="text-xs font-bold text-white bg-primary px-2 py-1 rounded-tl-md rounded-br-md"
          style={{
            backgroundColor: product.tag.color,
            boxShadow: `1px 1px 5px ${product.tag.color}`,
          }}
          >
            {product.tag.title}
          </span>
        )}
      </div>
      <Image
        src={product.image}
        alt={product.name}
        width={204}
        height={148}
        className="object-cover rounded-md"
      />
      <div className="flex flex-col mt-2">
        <span className="text-md font-semibold text-blue-gray">
          {product.name}
        </span>
        <span className="text-md font-bold text-primary">
          {formatPrice(Number(product.price), product.currency as Product.Currency)}
        </span>
      </div>
    </div>
  );
}

export default Product;
