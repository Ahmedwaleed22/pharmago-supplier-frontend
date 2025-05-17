import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type Step = {
  id: number;
  title: string;
  time?: string;
  status: 'completed' | 'current' | 'upcoming';
};

interface SteppersProps {
  steps: Step[];
  className?: string;
}

const Steppers = ({ steps, className }: SteppersProps) => {
  return (
    <div className={cn('flex w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        const isUpcoming = step.status === 'upcoming';
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={step.id}>
            {/* Step Circle and Content */}
            <div className="flex flex-col items-center min-w-[100px]">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isCompleted ? "bg-[#006FEE] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,112,243,0.4)]" : 
                  isCurrent ? "bg-white border-2 border-[#006FEE]" : 
                  "bg-white border-2 border-[#71717A] opacity-50"
                )}
              >
                {isCompleted ? (
                  <Image 
                    src="/images/check-icon.svg" 
                    alt="Completed" 
                    width={16} 
                    height={16} 
                    className="text-white"
                  />
                ) : (
                  <span 
                    className={cn(
                      "font-semibold text-lg",
                      isCurrent ? "text-[#006FEE]" : "text-[#71717A]"
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              
              {/* Text content */}
              <div className="flex flex-col items-center gap-2 mt-4">
                <span className={cn(
                  "text-[#71717A] font-medium text-base text-center",
                  isUpcoming && "opacity-50"
                )}>
                  {step.title}
                </span>
                {step.time && (
                  <span className="text-[#71717A] font-medium text-sm">
                    {step.time}
                  </span>
                )}
              </div>
            </div>
            
            {/* Connecting Line */}
            {!isLast && (
              <div className="grow h-[2px] flex items-center">
                <div 
                  className={cn(
                    "w-full h-[2px] mt-10",
                    isCompleted ? "bg-[#006FEE]" : "bg-[#D4D4D8]"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Steppers;