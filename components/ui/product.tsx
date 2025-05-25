import { formatPrice } from "@/helpers/products";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Product({ product }: { product: Product.Medicine }) {
  const tag = JSON.parse(product.tag || "{}");

  return (
    <Link
      href={`/dashboard/products/edit/${product.id}`}
      className="block h-full w-full"
    >
      <div
        key={product.id}
        className="h-full w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-3 relative cursor-pointer"
      >
        <div className="absolute left-3 top-2">
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
        <div className="h-[193.6px]">
          <Image
            src={product.image}
            alt={product.name}
            width={204}
            height={148}
            className="object-cover rounded-md"
          />
        </div>
        <div className="flex flex-col mt-2">
          <span className="text-md font-semibold text-blue-gray">
            {product.name}
          </span>
          <span className="text-md font-bold text-primary">
            {formatPrice(Number(product.price), product.currency as Product.Currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default Product;
