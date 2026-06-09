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

  if (!campaign) return <div className="p-8 text-[#A1A8B3]">Loading...</div>;

  const isABTest = Array.isArray(campaign.variants) && campaign.variants.length === 3;
  const isTestingPhase = isABTest && campaign.status === 'RUNNING' && !campaign.abTestCompleted;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
            <Badge variant={campaign.status === 'RUNNING' ? 'success' : campaign.status === 'DRAFT' ? 'warning' : 'default'}>
              {campaign.status}
            </Badge>
            {isTestingPhase && (
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                🟡 A/B Testing in Progress
              </Badge>
            )}
            {campaign.abTestCompleted && (
              <Badge variant="outline" className="border-[#22C55E]/50 text-[#22C55E]">
                🟢 Winner Selected
              </Badge>
            )}
          </div>
          <p className="text-sm text-[#A1A8B3]">Created {format(new Date(campaign.createdAt), 'PPpp')}</p>
        </div>
        
        <div className="flex gap-2">
          {campaign.status === 'DRAFT' && (
            <Button onClick={handleLaunch} disabled={launching} className="bg-white text-black hover:bg-gray-200">
              {launching ? "Launching..." : "Launch Campaign"} <Rocket className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button variant="outline" className="border-[#EF4444]/50 text-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444]" onClick={handleDelete} disabled={deleting}>
             <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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

      {isTestingPhase && stats?.variantStats && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-yellow-500" />
              Live A/B Testing Performance
            </CardTitle>
            <CardDescription>
              Evaluating {campaign.abTestSampleSize} users. Auto-optimization in progress...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {stats.variantStats.map((vStat: any, i: number) => {
                const openRate = vStat.sent > 0 ? Math.round((vStat.opened / vStat.sent) * 100) : 0;
                const clickRate = vStat.opened > 0 ? Math.round((vStat.clicked / vStat.opened) * 100) : 0;
                return (
                  <div key={i} className="p-4 bg-[#0B0D0F] rounded-lg border border-[#1E2329]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Variant {String.fromCharCode(65 + i)}</span>
                      <Badge variant="outline" className="text-[#8B5CF6] border-[#8B5CF6]/50">Score: {vStat.score}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#A1A8B3]">Sent</span>
                        <span>{vStat.sent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A8B3]">Open Rate</span>
                        <span>{openRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A1A8B3]">Click Rate</span>
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
        <Card className="border-[#22C55E]/50 bg-[#22C55E]/5">
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center shrink-0 mt-1">
              <Trophy className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#F8F9FA] mb-1">
                Winner: Variant {String.fromCharCode(65 + campaign.winnerIndex)}
              </h3>
              <p className="text-[#A1A8B3] leading-relaxed text-sm">
                The remaining {campaign.segment?.audienceSize - campaign.abTestSampleSize} customers are receiving this variant.
              </p>
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
                  { label: "Orders", val: stats?.purchasedCount || 0, icon: ShoppingBag, color: "text-[#8B5CF6]" },
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
            <CardContent className="space-y-4">
              {isABTest ? (
                campaign.variants.map((v: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg border font-mono text-sm leading-relaxed ${campaign.winnerIndex === idx ? 'bg-[#22C55E]/10 border-[#22C55E]' : 'bg-[#0B0D0F] border-[#1E2329]'}`}>
                    <p className="text-xs text-[#A1A8B3] font-sans mb-2 font-semibold">
                      Variant {String.fromCharCode(65 + idx)} {campaign.winnerIndex === idx && "(WINNER)"}
                    </p>
                    <p className="font-bold border-b border-[#1E2329] pb-2 mb-2 text-[#F8F9FA]">{v.subject}</p>
                    <p className="whitespace-pre-wrap">{v.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#0B0D0F] rounded-lg border border-[#1E2329] font-mono text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap">{campaign.message}</p>
                </div>
              )}
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
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Live Activity Feed
                {(campaign.status === 'RUNNING' || campaign.status === 'QUEUED') && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#8B5CF6] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]"></span>
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {campaign.communications?.flatMap((c: any) => c.events?.map((e: any) => ({ ...e, customerName: c.customer?.name, dndReason: e.metadata?.replyText })))
                  .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 15)
                  .map((event: any, i: number) => (
                    <div key={i} className="flex flex-col gap-1 pb-4 border-b border-[#1E2329] last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${event.eventType === 'REPLIED' ? 'text-[#8B5CF6]' : 'text-[#F8F9FA]'}`}>
                          {event.eventType}
                        </span>
                        <span className="text-xs text-[#A1A8B3]">{format(new Date(event.timestamp), 'h:mm a')}</span>
                      </div>
                      <span className="text-xs text-[#A1A8B3] truncate">to {event.customerName}</span>
                      {event.eventType === 'REPLIED' && event.dndReason && (
                        <span className="text-xs text-[#A1A8B3] bg-[#8B5CF6]/10 p-1 rounded italic mt-1 truncate">
                          "{event.dndReason}"
                        </span>
                      )}
                    </div>
                  ))}
                  {(!campaign.communications || campaign.communications.length === 0) && (
                    <p className="text-sm text-[#A1A8B3] text-center py-4">No activity yet.</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
