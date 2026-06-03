"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewChartsProps {
  barData: any[];
  pieData: any[];
}

export function OverviewCharts({ barData, pieData }: OverviewChartsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold">Widyaswara Load Balancing (Current Month JP)</CardTitle>
          <CardDescription>Easily spot underutilized or overloaded instructors.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total JP" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold">Funding Distribution (Pola)</CardTitle>
          <CardDescription>Ratio allocation of training hours.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col justify-between">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500"></span> APBD</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500"></span> Kontribusi</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-500"></span> Kemitraan</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}