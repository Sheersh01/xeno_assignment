"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingCart, Send, Activity, ArrowUpRight, BrainCircuit, ArrowRight, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonTableRow } from "@/components/ui/Skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { getDashboardStats, getCampaigns } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [stats, setStats] = useState({ customers: 0, orders: 0, campaigns: 0, activeCampaigns: 0, dndCustomers: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBrief, setShowBrief] = useState(true);
  const [hoverArea, setHoverArea] = useState(false);
  const [hoverBar, setHoverBar] = useState(false);
  
  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, campData] = await Promise.all([getDashboardStats(), getCampaigns()]);
        setStats({
          customers: statsData.totalCustomers,
          orders: statsData.totalOrders,
          campaigns: statsData.totalCampaigns,
          activeCampaigns: statsData.activeCampaigns,
          dndCustomers: statsData.dndCustomers || 0,
        });
        setCampaigns(campData.slice(0, 5)); // Top 5
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 max-w-[1200px] mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222] mb-8">
        <div>
          <h1 className="text-xl font-medium tracking-tight" suppressHydrationWarning>{greeting}, Sheersh</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Here is your automated daily summary.</p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            New Campaign
          </Button>
        </Link>
      </div>

      {/* HERO SECTION: AI DAILY BRIEF */}
      <AnimatePresence>
        {showBrief && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border border-[#222] bg-[#050505] p-6 lg:p-8 rounded-md relative mb-8">
              <button 
                onClick={() => setShowBrief(false)}
                className="absolute top-6 right-6 p-1 text-[#555] hover:text-[#EDEDED] transition-colors"
                aria-label="Dismiss AI Brief"
              >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-between mb-8 pr-8">
              <div className="flex items-center gap-2 text-[#EDEDED]">
                <BrainCircuit className="w-5 h-5" />
                <h2 className="text-base font-medium tracking-tight">AI Daily Brief</h2>
              </div>
              <Badge variant="outline" className="text-[#A0A0A0] border-[#333]" suppressHydrationWarning>
                {format(new Date(), 'MMM d, yyyy')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 space-y-4">
                <div className="pb-4 border-b border-[#222]">
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-1">Activity</p>
                  <p className="text-2xl font-medium text-[#EDEDED]">{stats.activeCampaigns} campaigns</p>
                  <p className="text-[13px] text-[#A0A0A0] mt-1">running today.</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-1">Automation</p>
                  <p className="text-[14px] text-[#EDEDED] leading-snug">{stats.dndCustomers} customers were automatically moved to DND based on sentiment.</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-2">Performance Insight</p>
                <p className="text-[16px] text-[#EDEDED] leading-relaxed">
                  {campaigns.find((c: any) => c.aiInsight) ? (
                    <span dangerouslySetInnerHTML={{ __html: campaigns.find((c: any) => c.aiInsight).aiInsight.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>') }} />
                  ) : campaigns.length > 0 ? (
                    "Your recent campaigns are running. AI performance insights will be generated once they complete."
                  ) : (
                    "No campaigns run yet. Launch your first campaign to generate AI insights."
                  )}
                </p>
              </div>
              
              <div className="md:col-span-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-2">Recommended Action</p>
                  <p className="text-[14px] text-[#EDEDED] leading-snug">
                    {campaigns.find((c: any) => c.aiInsight) 
                      ? "Review the full campaign performance to apply these learnings to your next audience."
                      : campaigns.length > 0 
                      ? "Monitor your active campaigns to discover winning variants."
                      : "Build your first segment to get started."}
                  </p>
                </div>
                <Link href={campaigns.length > 0 ? `/campaigns/${campaigns[0].id}` : "/campaigns"}>
                  <Button className="w-full mt-6 bg-[#EDEDED] text-[#000] hover:bg-[#A0A0A0] transition-colors">
                    Review Strategy <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STANDARD STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <Card className="flex flex-col transition-colors duration-500 hover:border-white/[0.15]" onMouseEnter={() => setHoverArea(true)} onMouseLeave={() => setHoverArea(false)}>
          <CardHeader className="border-b border-white/[0.05]">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${hoverArea ? 'text-white' : ''}`}>Delivery Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 h-[300px] min-h-[300px] w-full min-w-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EDEDED" stopOpacity={hoverArea ? 0.2 : 0.05} />
                    <stop offset="95%" stopColor="#EDEDED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#EDEDED' }} 
                  cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="value" stroke={hoverArea ? "#ffffff" : "#A0A0A0"} strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 5, fill: '#ffffff', stroke: '#000', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col transition-colors duration-500 hover:border-white/[0.15]" onMouseEnter={() => setHoverBar(true)} onMouseLeave={() => setHoverBar(false)}>
          <CardHeader className="border-b border-white/[0.05]">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${hoverBar ? 'text-white' : ''}`}>Campaign Funnel</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 h-[300px] min-h-[300px] w-full min-w-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                <XAxis type="number" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#555" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                />
                <Bar dataKey="value" fill={hoverBar ? "#EDEDED" : "#555"} radius={[2, 2, 2, 2]} barSize={16} activeBar={{ fill: '#ffffff' }} />
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
                <TableHead>Target Segment</TableHead>
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
    </motion.div>
  );
}
