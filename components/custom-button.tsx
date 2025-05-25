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
  type?: "button" | "submit" | "reset";
}

function CustomButton({ href, children, className, onClick, disabled, type }: CustomButtonProps) {
  const router = useRouter();

  return (
    <Button 
      onClick={onClick ? onClick : href ? () => router?.push(href as string) : undefined} 
      className={cn("gap-1 cursor-pointer", className)}
      disabled={disabled}
      type={type}
    >
      {children}
    </Button>
  );
}

export default CustomButton;
