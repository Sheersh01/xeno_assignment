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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#1E2329] pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executive Analytics</h1>
          <p className="text-sm text-[#A1A8B3]">High-level presentation-ready performance report.</p>
        </div>
        <Presentation className="w-6 h-6 text-[#A1A8B3]" />
      </div>

      <Card className="border-[#8B5CF6]/50 bg-[#8B5CF6]/5 shadow-lg shadow-[#8B5CF6]/5 animate-in fade-in slide-in-from-bottom-4">
        <CardContent className="pt-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-1">
            <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[#F8F9FA] mb-1">Global AI Insight</h3>
            <p className="text-[#A1A8B3] leading-relaxed">
              Customers who opened campaigns were <strong className="text-[#F8F9FA]">3.2× more likely</strong> to click. 
              Dormant customers responded best through <strong className="text-[#F8F9FA]">Email</strong> campaigns.
            </p>
          </div>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
            AI Executive Summary
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {insights.map(c => (
              <Card key={c.id} className="border-[#1E2329] bg-[#111417]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#A1A8B3] font-normal uppercase tracking-wider">{c.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{c.aiInsight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#A1A8B3]" />
              Engagement Performance
            </CardTitle>
            <CardDescription>Opens and Clicks across recent campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2329" vertical={false} />
                <XAxis dataKey="name" stroke="#A1A8B3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A1A8B3" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111417', borderColor: '#1E2329', borderRadius: '8px' }} 
                  itemStyle={{ color: '#F8F9FA' }}
                />
                <Line type="monotone" dataKey="opened" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="clicked" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Delivery Rates</CardTitle>
            <CardDescription>Volume of delivered vs failed communications.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2329" vertical={false} />
                <XAxis dataKey="name" stroke="#A1A8B3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A1A8B3" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111417', borderColor: '#1E2329', borderRadius: '8px' }}
                  cursor={{ fill: '#1E2329', opacity: 0.5 }}
                />
                <Bar dataKey="delivered" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
