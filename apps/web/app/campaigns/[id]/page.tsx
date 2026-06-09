"use client";

import { useEffect, useState, use } from "react";
import { getCampaignById, launchCampaign, getCampaignStats, deleteCampaign } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Rocket, Activity, Send, CheckCircle2, AlertCircle, Eye, MousePointerClick, Sparkles, ShoppingBag, Trash2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [launching, setLaunching] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setDeleting(true);
    try {
      await deleteCampaign(id);
      router.push("/campaigns");
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getCampaignById(id);
        setCampaign(data);
        if (data.stats) {
          const s = await getCampaignStats(id);
          setStats(s);
        }
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
      const s = await getCampaignStats(id);
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLaunching(false);
    }
  };

  if (!campaign) return <div className="p-8 text-[#A0A0A0] max-w-[1200px] mx-auto text-sm">Loading...</div>;

  const isABTest = Array.isArray(campaign.variants) && campaign.variants.length === 3;
  const isTestingPhase = isABTest && campaign.status === 'RUNNING' && !campaign.abTestCompleted;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-medium tracking-tight">{campaign.name}</h1>
            <Badge variant={campaign.status === 'RUNNING' ? 'success' : campaign.status === 'DRAFT' ? 'warning' : 'default'}>
              {campaign.status}
            </Badge>
            {isTestingPhase && (
              <Badge variant="outline" className="border-[#F59E0B] text-[#F59E0B]">
                A/B Testing in Progress
              </Badge>
            )}
            {campaign.abTestCompleted && (
              <Badge variant="outline" className="border-[#10B981] text-[#10B981]">
                Winner Selected
              </Badge>
            )}
          </div>
          <p className="text-[13px] text-[#A0A0A0]">Created {format(new Date(campaign.createdAt), 'PPpp')}</p>
        </div>
        
        <div className="flex gap-2">
          {campaign.status === 'DRAFT' && (
            <Button onClick={handleLaunch} disabled={launching}>
              {launching ? "Launching..." : "Launch Campaign"} <Rocket className="w-3.5 h-3.5 ml-2" />
            </Button>
          )}
          <Button variant="outline" className="text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444] border-[#222]" onClick={handleDelete} disabled={deleting}>
             <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {campaign.aiInsight && (
        <Card className="border-[#222] bg-[#050505]">
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="w-8 h-8 rounded border border-[#333] bg-[#111] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-[#EDEDED]" />
            </div>
            <div>
              <h3 className="font-medium text-[15px] text-[#EDEDED] mb-1">Executive Summary</h3>
              <p className="text-[#A0A0A0] text-[13px] leading-relaxed">{campaign.aiInsight}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isTestingPhase && stats?.variantStats && (
        <Card className="border-[#F59E0B]/30 bg-[#F59E0B]/5">
          <CardHeader className="border-b border-[#F59E0B]/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#FBBF24]">
              <Activity className="w-4 h-4" />
              Live A/B Testing Performance
            </CardTitle>
            <CardDescription className="text-xs text-[#FBBF24]/70">
              Evaluating {campaign.abTestSampleSize} users. Auto-optimization in progress...
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              {stats.variantStats.map((vStat: any, i: number) => {
                const openRate = vStat.sent > 0 ? Math.round((vStat.opened / vStat.sent) * 100) : 0;
                const clickRate = vStat.opened > 0 ? Math.round((vStat.clicked / vStat.opened) * 100) : 0;
                return (
                  <div key={i} className="p-4 bg-[#0A0A0A] rounded border border-[#222]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[13px] font-medium">Variant {String.fromCharCode(65 + i)}</span>
                      <Badge variant="outline" className="text-[#A0A0A0] border-[#333]">Score: {vStat.score}</Badge>
                    </div>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-[#A0A0A0]">Sent</span>
                        <span>{vStat.sent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A0A0A0]">Open Rate</span>
                        <span>{openRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A0A0A0]">Click Rate</span>
                        <span>{clickRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {campaign.abTestCompleted && typeof campaign.winnerIndex === 'number' && (
        <Card className="border-[#10B981]/30 bg-[#10B981]/5">
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="w-8 h-8 rounded border border-[#10B981]/30 bg-[#052E16] flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 text-[#34D399]" />
            </div>
            <div>
              <h3 className="font-medium text-[15px] text-[#34D399] mb-1">
                Winner: Variant {String.fromCharCode(65 + campaign.winnerIndex)}
              </h3>
              <p className="text-[#A0A0A0] text-[13px] leading-relaxed">
                The remaining {campaign.segment?.audienceSize - campaign.abTestSampleSize} customers are receiving this variant.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="border-b border-[#222]">
              <CardTitle className="text-sm font-medium">Live Delivery Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Sent", val: stats?.sentCount || 0, icon: Send },
                  { label: "Delivered", val: stats?.deliveredCount || 0, icon: CheckCircle2 },
                  { label: "Opened", val: stats?.openedCount || 0, icon: Eye },
                  { label: "Clicked", val: stats?.clickedCount || 0, icon: MousePointerClick },
                  { label: "Orders", val: stats?.purchasedCount || 0, icon: ShoppingBag },
                  { label: "Failed", val: stats?.failedCount || 0, icon: AlertCircle },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-3 bg-[#000] rounded border border-[#222] relative overflow-hidden group">
                    <stat.icon className="w-5 h-5 mb-2 text-[#555] group-hover:text-[#EDEDED] transition-colors" />
                    <span className="text-xl font-medium mb-1">{stat.val}</span>
                    <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold">{stat.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[#222]">
              <CardTitle className="text-sm font-medium">Message Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {isABTest ? (
                campaign.variants.map((v: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded border font-mono text-[13px] leading-relaxed ${campaign.winnerIndex === idx ? 'bg-[#052E16]/30 border-[#065F46]' : 'bg-[#000] border-[#222]'}`}>
                    <p className="text-[11px] text-[#A0A0A0] font-sans mb-2 font-semibold uppercase tracking-wider">
                      Variant {String.fromCharCode(65 + idx)} {campaign.winnerIndex === idx && "(WINNER)"}
                    </p>
                    <p className="font-medium border-b border-[#222] pb-2 mb-2 text-[#EDEDED]">{v.subject}</p>
                    <p className="whitespace-pre-wrap">{v.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#000] rounded border border-[#222] font-mono text-[13px] leading-relaxed">
                  <p className="whitespace-pre-wrap">{campaign.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-[#222]">
              <CardTitle className="text-sm font-medium">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#A0A0A0] mb-1.5">Target Segment</p>
                <div className="p-3 bg-[#000] rounded border border-[#222]">
                  <p className="font-medium text-[13px]">{campaign.segment?.name || 'Unknown'}</p>
                  <p className="text-[12px] text-[#A0A0A0] mt-1 line-clamp-2">{campaign.segment?.description}</p>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#A0A0A0] mb-1.5">Delivery Channel</p>
                <Badge variant="outline" className="w-full justify-center">
                  {campaign.channel}
                </Badge>
              </div>

              {campaign.completedAt && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#A0A0A0] mb-1.5">Completed At</p>
                  <p className="text-[13px]">{format(new Date(campaign.completedAt), 'PPpp')}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="border-b border-[#222]">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Live Activity Feed
                {(campaign.status === 'RUNNING' || campaign.status === 'QUEUED') && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {campaign.communications?.flatMap((c: any) => c.events?.map((e: any) => ({ ...e, customerName: c.customer?.name, dndReason: e.metadata?.replyText })))
                  .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 15)
                  .map((event: any, i: number) => (
                    <div key={i} className="flex flex-col gap-1 pb-3 border-b border-[#222] last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[12px] font-semibold tracking-wider uppercase ${event.eventType === 'REPLIED' ? 'text-[#EDEDED]' : 'text-[#A0A0A0]'}`}>
                          {event.eventType}
                        </span>
                        <span className="text-[11px] text-[#777]">{format(new Date(event.timestamp), 'h:mm a')}</span>
                      </div>
                      <span className="text-[12px] text-[#A0A0A0] truncate">to {event.customerName}</span>
                      {event.eventType === 'REPLIED' && event.dndReason && (
                        <span className="text-[12px] text-[#A0A0A0] bg-[#111] p-1.5 rounded border border-[#222] mt-1 truncate">
                          "{event.dndReason}"
                        </span>
                      )}
                    </div>
                  ))}
                  {(!campaign.communications || campaign.communications.length === 0) && (
                    <p className="text-[13px] text-[#555] text-center py-4">No activity yet.</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
