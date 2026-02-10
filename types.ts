// Added React import to resolve missing namespace errors for React.ReactNode
import React from 'react';

export interface StatData {
  title: string;
  value: string;
  currency: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}