"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@heroui/react";
import { Button } from "./ui/button";

interface CustomButtonProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

function CustomButton({ href, children, className, onClick, disabled }: CustomButtonProps) {
  const router = useRouter();

  return (
    <Button 
      onClick={onClick || (() => router.push(href as string))} 
      className={cn("gap-1 cursor-pointer", className)}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

export default CustomButton;
