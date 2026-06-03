"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  wiData: any[];
}

export default function DashboardCharts({ wiData }: Props) {
  const barData = wiData.map(wi => ({
    name: wi.name.split(' ')[0],
    "Total JP": wi.jpCurrentMonth
  }));

  const totalBreakdown = wiData.reduce((acc, wi) => {
    acc.apbd += wi.breakdown.apbd;
    acc.kontribusi += wi.breakdown.kontribusi;
    acc.kemitraan += wi.breakdown.kemitraan;
    return acc;
  }, { apbd: 0, kontribusi: 0, kemitraan: 0 });

  const pieData = [
    { name: 'APBD', value: totalBreakdown.apbd, color: '#3b82f6' },
    { name: 'Kontribusi', value: totalBreakdown.kontribusi, color: '#10b981' },
    { name: 'Kemitraan', value: totalBreakdown.kemitraan, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Widyaswara Load Balancing</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="Total JP" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Funding Mix</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
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
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}