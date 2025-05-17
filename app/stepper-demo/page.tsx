'use client';

import React from 'react';
import Steppers, { Step } from '@/components/steppers';

export default function StepperDemo() {
  const steps: Step[] = [
    {
      id: 1,
      title: 'Ordered',
      time: '06:59 PM',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Ready',
      time: '06:59 PM',
      status: 'current'
    },
    {
      id: 3,
      title: 'Shipped',
      time: '06:59 PM',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Estimated\nDelivery',
      time: '06:59 PM',
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Delivered',
      time: '06:59 PM',
      status: 'upcoming'
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Stepper Component Demo</h1>
      <div className="border p-6 rounded-lg">
        <Steppers steps={steps} />
      </div>
    </div>
  );
} 