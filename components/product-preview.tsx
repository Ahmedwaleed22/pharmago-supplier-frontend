import React from "react";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

function ProductPreview() {
  const productData = useSelector((state: any) => state.productCreation);
  const router = useRouter();

  // Get the primary image URL, either from the images array or the legacy image field
  const getPrimaryImageUrl = () => {
    if (productData.images && productData.images.length > 0) {
      const primaryImage = productData.images.find((img: any) => img.isPrimary);
      if (primaryImage) {
        return primaryImage.url;
      }
      // If no primary image is found, use the first image
      return productData.images[0].url;
    }
    // Fall back to the legacy image field
    return productData.image || "";
  };

  const imageUrl = getPrimaryImageUrl();

  return (
    <div className="w-1/2 max-w-[407px]">
      <h2 className="mb-2 text-xl font-semibold text-[#414651]">Preview</h2>
      <p className="mb-6 text-[#717171]">
        This is how your product will appear.
      </p>

      <div className="rounded-lg bg-white p-6 max-w-[407px] shadow-sm">
        <div onClick={() => router.push("/dashboard/product/add/step-3")} className={`mb-6 flex items-center justify-center rounded-lg bg-white min-h-[250px] ${!imageUrl ? "p-8 border border-dashed border-[#afafaf] cursor-pointer" : ""}`}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={productData.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#afafaf]">
                  <Plus className="h-5 w-5 text-[#717171]" />
                </div>
              </div>
              <div className="text-sm text-[#717171]">
                Product Image
                <br />
                800×800
              </div>
            </div>
          )}
        </div>

        <div className="mb-2 flex items-center">
          <div className="text-sm text-[#717171]">
            {productData.category || "Main Category"} · {productData.subCategory || "Sub-Category"}
          </div>
          <div className="ml-auto flex items-center">
            <span className="mr-2 text-xs text-[#717171]">Logo</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ebebeb] text-xs">
              +
            </div>
          </div>
        </div>

        <div className="mb-1 text-lg font-medium text-[#414651]">
          {productData.name || "Product Name will show here"}
        </div>
        <div className="mb-4 text-sm text-[#717171]">
          {productData.subName || "Sub-Name will show here"}
        </div>

        <div className="mb-4 flex items-baseline">
          <div className="text-2xl font-bold text-[#2970ff]">
            {productData.price ? `${productData.price} L.E` : "0.00 L.E"}
          </div>
          {productData.discount > 0 && (
            <>
              <div className="ml-2 text-sm text-[#a0a0a0]">
                {(productData.price - (productData.price * productData.discount / 100)).toFixed(2)} L.E
              </div>
              <div className="ml-2 rounded bg-[#f4f4f5] px-2 py-0.5 text-xs text-[#717171]">
                -{productData.discount}%
              </div>
            </>
          )}
        </div>

        <div>
          <div className="mb-1 text-sm font-medium text-[#414651]">
            Product Details
          </div>
          <div className="text-sm text-[#717171]">
            {productData.productDetails || "Your Description will show here"}
          </div>
          {productData.tags && productData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {productData.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-md bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPreview;
