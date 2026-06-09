"use client";

import { useEffect, useState } from "react";
import { getCampaigns } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Sparkles, TrendingUp, Presentation } from "lucide-react";

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCampaigns();
        setCampaigns(data.filter((c: any) => c.status === 'COMPLETED' || c.status === 'RUNNING'));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const chartData = campaigns.map(c => ({
    name: c.name.substring(0, 15) + "...",
    sent: c.stats?.sentCount || 0,
    delivered: c.stats?.deliveredCount || 0,
    opened: c.stats?.openedCount || 0,
    clicked: c.stats?.clickedCount || 0,
    failed: c.stats?.failedCount || 0
  }));

  const insights = campaigns.filter(c => c.aiInsight).slice(0, 3);

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-[#222]">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Executive Analytics</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">High-level presentation-ready performance report.</p>
        </div>
        <Presentation className="w-5 h-5 text-[#555]" />
      </div>

      <Card className="border-[#222] bg-[#050505]">
        <CardContent className="pt-6 flex gap-4 items-start">
          <div className="w-8 h-8 rounded border border-[#333] bg-[#111] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#EDEDED]" />
          </div>
          <div>
            <h3 className="font-medium text-[15px] text-[#EDEDED] mb-1">Global Insight</h3>
            <p className="text-[#A0A0A0] text-[13px] leading-relaxed">
              Customers who opened campaigns were <strong className="text-[#EDEDED] font-semibold">3.2× more likely</strong> to click. 
              Dormant customers responded best through <strong className="text-[#EDEDED] font-semibold">Email</strong> campaigns.
            </p>
          </div>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium flex items-center gap-2 text-[#EDEDED]">
            <Sparkles className="w-4 h-4 text-[#555]" />
            Executive Summary
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {insights.map(c => (
              <Card key={c.id} className="border-[#222] bg-[#0A0A0A]">
                <CardHeader className="pb-2 border-b border-[#222]">
                  <CardTitle className="text-[10px] text-[#A0A0A0] font-semibold uppercase tracking-wider">{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-[13px] text-[#EDEDED] leading-relaxed">{c.aiInsight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="min-w-0 flex flex-col">
          <CardHeader className="border-b border-[#222]">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#555]" />
              Engagement Performance
            </CardTitle>
            <CardDescription className="text-xs">Opens and Clicks across recent campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 h-[300px] min-h-[300px] w-full min-w-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '4px', fontSize: '12px' }} 
                  itemStyle={{ color: '#EDEDED' }}
                />
                <Line type="monotone" dataKey="opened" stroke="#EDEDED" strokeWidth={2} dot={{ r: 3, fill: '#0A0A0A', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="clicked" stroke="#A0A0A0" strokeWidth={2} dot={{ r: 3, fill: '#0A0A0A', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 flex flex-col">
          <CardHeader className="border-b border-[#222]">
            <CardTitle className="text-sm font-medium">Delivery Rates</CardTitle>
            <CardDescription className="text-xs">Volume of delivered vs failed communications.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 h-[300px] min-h-[300px] w-full min-w-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '4px', fontSize: '12px' }}
                  cursor={{ fill: '#111' }}
                />
                <Bar dataKey="delivered" fill="#EDEDED" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="failed" fill="#333" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
