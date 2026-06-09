"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingCart, Send, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { getCustomers, getCampaigns } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
  const [stats, setStats] = useState({ customers: 0, orders: 0, campaigns: 0, activeCampaigns: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [custData, campData] = await Promise.all([getCustomers(), getCampaigns()]);
        const totalOrders = custData.reduce((sum: number, c: any) => sum + (c.orderCount || 0), 0);
        setStats({
          customers: custData.length,
          orders: totalOrders,
          campaigns: campData.length,
          activeCampaigns: campData.filter((c: any) => c.status === 'RUNNING').length,
        });
        setCampaigns(campData.slice(0, 5)); // Top 5
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const funnelData = [
    { name: "Sent", value: 1000 },
    { name: "Delivered", value: 950 },
    { name: "Opened", value: 400 },
    { name: "Clicked", value: 150 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-[#A1A8B3]">Your campaign performance at a glance.</p>
        </div>
        <Link href="/campaigns/new" className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A8B3]">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-[#A1A8B3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A8B3]">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-[#A1A8B3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A8B3]">Total Campaigns</CardTitle>
            <Send className="w-4 h-4 text-[#A1A8B3]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A8B3]">Active Campaigns</CardTitle>
            <Activity className="w-4 h-4 text-[#22C55E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#22C55E]">{stats.activeCampaigns}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Delivery Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#A1A8B3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#A1A8B3" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111417', borderColor: '#1E2329' }} itemStyle={{ color: '#F8F9FA' }} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Campaign Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#A1A8B3" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111417', borderColor: '#1E2329' }} cursor={{ fill: '#1E2329' }} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Campaigns</CardTitle>
          <Link href="/campaigns" className="text-sm text-[#A1A8B3] hover:text-[#F8F9FA] flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((camp) => (
                <TableRow key={camp.id} className="cursor-pointer group">
                  <TableCell className="font-medium">
                    <Link href={`/campaigns/${camp.id}`} className="hover:underline">
                      {camp.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#A1A8B3]">{camp.segment?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{camp.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={camp.status === 'RUNNING' ? 'success' : camp.status === 'DRAFT' ? 'warning' : 'default'}>
                      {camp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#A1A8B3]">{format(new Date(camp.createdAt), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#A1A8B3] py-8">
                    No campaigns found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
