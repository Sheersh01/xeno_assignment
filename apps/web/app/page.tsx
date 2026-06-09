"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingCart, Send, Activity, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { getCustomers, getCampaigns } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";

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
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222]">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Overview of campaign performance and metrics.</p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#A0A0A0]">Total Customers</CardTitle>
            <Users className="w-3.5 h-3.5 text-[#555]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{stats.customers.toLocaleString()}</div>
            <p className="text-xs text-[#A0A0A0] mt-1 flex items-center">
              <span className="text-[#34D399] flex items-center mr-1">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
              </span> 
              from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#A0A0A0]">Total Orders</CardTitle>
            <ShoppingCart className="w-3.5 h-3.5 text-[#555]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{stats.orders.toLocaleString()}</div>
            <p className="text-xs text-[#A0A0A0] mt-1 flex items-center">
              <span className="text-[#34D399] flex items-center mr-1">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 8%
              </span> 
              from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#A0A0A0]">Total Campaigns</CardTitle>
            <Send className="w-3.5 h-3.5 text-[#555]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{stats.campaigns}</div>
            <p className="text-xs text-[#555] mt-1">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#A0A0A0]">Active Campaigns</CardTitle>
            <Activity className="w-3.5 h-3.5 text-[#555]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">{stats.activeCampaigns}</div>
            <p className="text-xs text-[#555] mt-1">Running right now</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="border-b border-[#222]">
            <CardTitle className="text-sm font-medium">Delivery Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 h-[300px] min-h-[300px] w-full min-w-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EDEDED" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#EDEDED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '4px', fontSize: '12px' }} 
                  itemStyle={{ color: '#EDEDED' }} 
                  cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="value" stroke="#EDEDED" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="border-b border-[#222]">
            <CardTitle className="text-sm font-medium">Campaign Funnel</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 h-[300px] min-h-[300px] w-full min-w-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#555" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '4px', fontSize: '12px' }} 
                  cursor={{ fill: '#111' }} 
                />
                <Bar dataKey="value" fill="#EDEDED" radius={[2, 2, 2, 2]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#222]">
          <CardTitle className="text-sm font-medium">Recent Campaigns</CardTitle>
          <Link href="/campaigns" className="text-xs font-medium text-[#A0A0A0] hover:text-[#EDEDED] transition-colors">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222] bg-[#0A0A0A] hover:bg-[#0A0A0A]">
                <TableHead>Name</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((camp) => (
                <TableRow key={camp.id}>
                  <TableCell className="font-medium text-[13px]">
                    <Link href={`/campaigns/${camp.id}`} className="hover:underline underline-offset-4">
                      {camp.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#A0A0A0] text-[13px]">{camp.segment?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{camp.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={camp.status === 'RUNNING' ? 'success' : camp.status === 'DRAFT' ? 'warning' : 'default'}>
                      {camp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#A0A0A0] text-[13px]">{format(new Date(camp.createdAt), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#555] py-12 text-[13px]">
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
