"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OverviewChartsProps {
  barChartData: Array<{ name: string; 'Total JP': number }>;
  pieChartData: Array<{ name: string; value: number; color: string }>;
}

export function OverviewCharts({ barChartData, pieChartData }: OverviewChartsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 shadow-sm border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-blue-900">Widyaiswara Load Balancing (Current Month JP)</CardTitle>
          <CardDescription>Easily spot underutilized or overloaded instructors.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Legend />
              <Bar dataKey="Total JP" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-blue-900">Funding Distribution (Pola)</CardTitle>
          <CardDescription>Ratio allocation of training hours.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col justify-between">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-semibold">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-blue-600"></span> APBD
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-600"></span> Kontribusi
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span> Kemitraan
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}