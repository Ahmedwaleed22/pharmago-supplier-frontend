import { formatPrice } from "@/helpers/products";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Product({ product }: { product: Product.Medicine }) {
  const tag = JSON.parse(product.tag || "{}");

  return (
    <a
      href={`/dashboard/products/edit/${product.id}`}
      className="block h-full w-full min-w-[180px] max-w-[220px]"
    >
      <div
        key={product.id}
        className="h-full w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-2 relative cursor-pointer"
      >
        <div className="absolute left-2 top-2 z-10">
          {tag && tag.title && tag.color && (
          <span
            className="text-xs font-bold text-white bg-primary px-2 py-1 rounded-tl-md rounded-br-md"
            style={{
              backgroundColor: tag.color,
              boxShadow: `1px 1px 5px ${tag.color}`,
            }}
            >
              {tag.title}
            </span>
          )}
        </div>
        <div className="w-full h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 mb-2 flex items-center justify-center overflow-hidden rounded-md bg-gray-50">
          {product.image.startsWith("http") && (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-full object-contain"
            />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-semibold text-blue-gray mb-1 line-clamp-2">
            {product.name}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-sm font-bold text-primary">
              {formatPrice(Number(product.price) - (Number(product.price) * Number(product.discount_percentage) / 100), product.currency as Product.Currency)}
            </span>
            <span className="text-[.7rem] font-bold text-gray-500 line-through">
              {formatPrice(Number(product.price), product.currency as Product.Currency)}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default Product;
