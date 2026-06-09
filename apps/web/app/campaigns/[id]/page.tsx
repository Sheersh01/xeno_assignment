"use client";

import { useEffect, useState, use } from "react";
import { getCampaignById, launchCampaign, getCampaignStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Rocket, Activity, Send, CheckCircle2, AlertCircle, Eye, MousePointerClick, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCampaignById(id);
        setCampaign(data);
        if (data.stats) setStats(data.stats);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (campaign && (campaign.status === 'RUNNING' || campaign.status === 'QUEUED')) {
      interval = setInterval(async () => {
        try {
          const s = await getCampaignStats(id);
          setStats(s);
          
          // Optional: Re-fetch campaign to see if status changed to COMPLETED/FAILED
          const c = await getCampaignById(id);
          setCampaign(c);
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [campaign, id]);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      await launchCampaign(id);
      const updated = await getCampaignById(id);
      setCampaign(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLaunching(false);
    }
  };

  if (!campaign) return <div className="p-8 text-[#A1A8B3]">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
            <Badge variant={campaign.status === 'RUNNING' ? 'success' : campaign.status === 'DRAFT' ? 'warning' : 'default'}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-sm text-[#A1A8B3]">Created {format(new Date(campaign.createdAt), 'PPpp')}</p>
        </div>
        
        {campaign.status === 'DRAFT' && (
          <Button onClick={handleLaunch} disabled={launching} className="bg-white text-black hover:bg-gray-200">
            {launching ? "Launching..." : "Launch Campaign"} <Rocket className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {campaign.aiInsight && (
        <Card className="border-[#8B5CF6]/50 bg-[#8B5CF6]/5 shadow-lg shadow-[#8B5CF6]/5 animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#F8F9FA] mb-1">AI Executive Summary</h3>
              <p className="text-[#A1A8B3] leading-relaxed">{campaign.aiInsight}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-[#1E2329] bg-[#1E2329]/20">
              <CardTitle className="text-sm">Live Delivery Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: "Sent", val: stats?.sentCount || 0, icon: Send, color: "text-blue-400" },
                  { label: "Delivered", val: stats?.deliveredCount || 0, icon: CheckCircle2, color: "text-[#22C55E]" },
                  { label: "Opened", val: stats?.openedCount || 0, icon: Eye, color: "text-purple-400" },
                  { label: "Clicked", val: stats?.clickedCount || 0, icon: MousePointerClick, color: "text-yellow-400" },
                  { label: "Failed", val: stats?.failedCount || 0, icon: AlertCircle, color: "text-[#EF4444]" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-4 bg-[#0B0D0F] rounded-lg border border-[#1E2329] relative overflow-hidden group">
                    {(campaign.status === 'RUNNING' || campaign.status === 'QUEUED') && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    <stat.icon className={`w-6 h-6 mb-3 ${stat.color}`} />
                    <span className="text-2xl font-bold mb-1">{stat.val}</span>
                    <span className="text-xs text-[#A1A8B3] font-medium uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Message Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-[#0B0D0F] rounded-lg border border-[#1E2329] font-mono text-sm leading-relaxed">
                <p className="whitespace-pre-wrap">{campaign.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-[#A1A8B3] mb-1">Target Segment</p>
                <div className="p-3 bg-[#0B0D0F] rounded-md border border-[#1E2329]">
                  <p className="font-medium text-sm">{campaign.segment?.name || 'Unknown'}</p>
                  <p className="text-xs text-[#A1A8B3] mt-1 line-clamp-2">{campaign.segment?.description}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-[#A1A8B3] mb-1">Delivery Channel</p>
                <Badge variant="outline" className="text-sm py-1 px-3 w-full justify-center">
                  {campaign.channel}
                </Badge>
              </div>

              {campaign.completedAt && (
                <div>
                  <p className="text-xs text-[#A1A8B3] mb-1">Completed At</p>
                  <p className="text-sm font-medium">{format(new Date(campaign.completedAt), 'PPpp')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
