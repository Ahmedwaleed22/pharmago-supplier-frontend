import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";

function DeliveryCard() {
  return (
    <div className="flex items-center w-full max-w-[220px] gap-2">
      <Image
        src="/images/demo/man.png"
        alt="delivery-card"
        width={32}
        height={32}
        className="h-[50px] w-[50px]"
      />
      <div className="flex flex-col w-full">
        <p className="text-light-gray">Captin</p>
        <h3 className="text-blue-gray font-medium">Saad Samy</h3>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Icon icon="solar:phone-bold" width="24" height="24" className="text-primary-blue cursor-pointer" />
        <Icon icon="flowbite:messages-solid" width="24" height="24" className="text-primary-blue cursor-pointer" />
      </div>
    </div>
  );
}

export default DeliveryCard;
