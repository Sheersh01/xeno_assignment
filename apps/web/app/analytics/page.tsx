"use client";

import { useEffect, useState } from "react";
import { getCampaigns } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Sparkles, TrendingUp, Presentation, BrainCircuit, Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showBrief, setShowBrief] = useState(true);
  const [hoverLine, setHoverLine] = useState(false);
  const [hoverBar, setHoverBar] = useState(false);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 max-w-[1200px] mx-auto"
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#222] mb-8">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Executive Analytics</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">High-level presentation-ready performance report.</p>
        </div>
        <Presentation className="w-5 h-5 text-[#555]" />
      </div>

      {/* HERO SECTION: EXECUTIVE BRIEF */}
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
                aria-label="Dismiss Executive Brief"
              >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-6 text-[#EDEDED] pr-8">
              <BrainCircuit className="w-5 h-5" />
              <h2 className="text-base font-medium tracking-tight">Executive Brief</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-3 space-y-6">
                <div>
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-2">Performance Summary</p>
                  <p className="text-[16px] text-[#EDEDED] leading-relaxed">
                    This week's campaigns exceeded expected engagement by <strong className="font-semibold text-white">18%</strong>. 
                    The strongest predictor of success was urgency-driven messaging targeting dormant customers.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-2">Emerging Trends</p>
                  <p className="text-[14px] text-[#A0A0A0] leading-relaxed">
                    Returning customers show signs of message fatigue, with open rates dropping by 4% over the last 3 touchpoints.
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-1 p-5 bg-[#111] rounded border border-[#222] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[#EDEDED]" />
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold">AI Recommendation</p>
                </div>
                <p className="text-[14px] text-[#EDEDED] leading-snug">
                  Reduce send frequency by 20% for the 'Returning Customers' segment to preserve domain reputation and engagement.
                </p>
              </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        <Card className="min-w-0 flex flex-col transition-colors duration-500 hover:border-white/[0.15]" onMouseEnter={() => setHoverLine(true)} onMouseLeave={() => setHoverLine(false)}>
          <CardHeader className="border-b border-white/[0.05]">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 transition-colors duration-500 ${hoverLine ? 'text-white' : ''}`}>
              <TrendingUp className={`w-3.5 h-3.5 transition-colors duration-500 ${hoverLine ? 'text-white' : 'text-[#555]'}`} />
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
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#EDEDED' }}
                />
                <Line type="monotone" dataKey="opened" stroke={hoverLine ? '#ffffff' : '#888'} strokeWidth={2} dot={{ r: 3, fill: '#0A0A0A', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#ffffff', stroke: '#000', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="clicked" stroke={hoverLine ? '#A0A0A0' : '#444'} strokeWidth={2} dot={{ r: 3, fill: '#0A0A0A', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#A0A0A0', stroke: '#000', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 flex flex-col transition-colors duration-500 hover:border-white/[0.15]" onMouseEnter={() => setHoverBar(true)} onMouseLeave={() => setHoverBar(false)}>
          <CardHeader className="border-b border-white/[0.05]">
            <CardTitle className={`text-sm font-medium transition-colors duration-500 ${hoverBar ? 'text-white' : ''}`}>Delivery Rates</CardTitle>
            <CardDescription className="text-xs">Volume of delivered vs failed communications.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 h-[300px] min-h-[300px] w-full min-w-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="delivered" fill={hoverBar ? '#EDEDED' : '#555'} radius={[2, 2, 0, 0]} barSize={16} activeBar={{ fill: '#ffffff' }} />
                <Bar dataKey="failed" fill={hoverBar ? '#555' : '#222'} radius={[2, 2, 0, 0]} barSize={16} activeBar={{ fill: '#A0A0A0' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
