"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';

interface OverviewChartsProps {
  barChartData: Array<{ name: string; 'Total JP': number }>;
  pieChartData: Array<{ name: string; value: number; color: string }>;
}

export function OverviewCharts({ barChartData, pieChartData }: OverviewChartsProps) {
  return (
    <div className="grid md:grid-cols-5 gap-6">
      <Card className="md:col-span-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold text-blue-900">Penyeimbangan Beban Widyaiswara (JP Bulan Berjalan)</CardTitle>
          <CardDescription>Identifikasi dengan mudah instruktur yang kurang dimanfaatkan atau kelebihan beban mengajar.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-4">
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

      <Card className="md:col-span-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold text-blue-900">Distribusi Pola Pelaksanaan Anggaran</CardTitle>
          <CardDescription>Rasio alokasi jam pelatihan berdasarkan pola pendanaan.</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex flex-col justify-between pt-4">
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
                  <Label
                    value={pieChartData.reduce((sum, d) => sum + d.value, 0)}
                    position="center"
                    className="text-lg font-bold fill-blue-900"
                    formatter={(val: number) => `${val} JP`}
                  />
                </Pie>
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-semibold pt-2">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-blue-600"></span> APBD
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-600"></span> Kontribusi
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-sky-500"></span> Kemitraan
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}