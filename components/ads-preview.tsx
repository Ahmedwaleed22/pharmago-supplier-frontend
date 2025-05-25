import { useTranslation } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { ImageFile } from "@/app/dashboard/advertisements/add/page";
import Image from "next/image";

const RenderHashTagAndLink = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-bold text-blue-gray">
        #{t("advertisements.specialForYou")}
      </h2>
      <Link
        href="/dashboard/advertisements"
        className="text-sm font-medium text-primary-blue"
      >
        See All
      </Link>
    </div>
  );
};

function ADsPreview({
  className,
  images,
}: {
  className?: string;
  images: ImageFile[];
}) {
  const { t } = useTranslation();

  return (
    <div className={cn("w-1/2 max-w-[407px]", className)}>
      <h2 className="mb-2 text-xl font-semibold text-[#414651]">
        {t("products.preview")}
      </h2>
      <p className="mb-6 text-[#717171]">
        {t("products.thisIsHowProductWillAppear")}
      </p>

      <div className="rounded-lg bg-white p-6 max-w-[407px] shadow-sm">
        <RenderHashTagAndLink />

        <div
          onClick={() => {}}
          className={`mb-6 flex items-center justify-center rounded-lg bg-white h-[150px] ${"p-8 border border-dashed border-[#afafaf] cursor-pointer"}`}
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#afafaf]">
                <Plus className="h-5 w-5 text-[#717171]" />
              </div>
            </div>
            <div className="text-sm text-[#717171]">
              {t("products.productImage")}
              <br />
              800×800
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {images?.map((image) => (
            <div key={image.id} className="w-full h-full">
              <RenderHashTagAndLink />
              <Image
                src={image.url}
                alt={image.name}
                width={375}
                height={150}
                className="w-[375px] h-[150px] object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ADsPreview;
