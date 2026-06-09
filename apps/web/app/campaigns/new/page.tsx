"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/store/campaign.store";
import { getSegments, generateMessage, recommendChannel, createCampaign } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, ArrowRight, ArrowLeft, Check, Smartphone, Mail, MessageSquare, Send } from "lucide-react";

export default function NewCampaignPage() {
  const router = useRouter();
  const { 
    step, setStep, 
    segmentId, segmentName, segmentDescription, setSegment,
    goal, setGoal,
    variants, setVariants,
    channel, setChannel,
    reset
  } = useCampaignStore();

  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getSegments();
      setSegments(data);
    }
    load();
  }, []);

  const handleGenerateMessage = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const generatedVariants = await generateMessage(goal, segmentDescription);
      setVariants(generatedVariants);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!segmentId) return;
    setLoading(true);
    try {
      const res = await recommendChannel(segmentId);
      setRecommendation(res);
      setChannel(res.recommendedChannel);
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (index: number, field: 'subject' | 'message', value: string) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await createCampaign({
        name: `${goal} Campaign`,
        segmentId,
        message: "A/B Testing Variants", // Placeholder, we rely on variants array
        variants,
        channel,
      });
      reset();
      router.push(`/campaigns/${res.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[800px] mx-auto space-y-8">
      <div className="pb-4 border-b border-[#222]">
        <h1 className="text-xl font-medium tracking-tight">Create Campaign</h1>
        <p className="text-sm text-[#A0A0A0] mt-1">AI-assisted autonomous A/B testing campaign wizard.</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${step >= i ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-[#111] text-[#555] border border-[#222]'}`}>
              {step > i ? <Check className="w-3 h-3" /> : i}
            </div>
            {i < 4 && <div className={`w-8 h-[2px] transition-colors ${step > i ? 'bg-indigo-500/50' : 'bg-[#222]'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium">Select Audience Segment</h2>
          <div className="grid grid-cols-2 gap-4">
            {segments.map((s) => (
              <Card 
                key={s.id} 
                className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] group ${segmentId === s.id ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-500/5' : ''}`}
                onClick={() => setSegment(s.id, s.name, s.description || "Segment")}
              >
                <CardHeader className="border-b border-[#222] pb-3 group-hover:border-indigo-500/20 transition-colors">
                  <CardTitle className={`text-[13px] transition-colors ${segmentId === s.id ? 'text-indigo-400' : 'group-hover:text-indigo-400'}`}>{s.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="line-clamp-2 text-[12px] mb-4 group-hover:text-[#AAA] transition-colors">{s.description}</CardDescription>
                  <Badge variant="outline" className={`transition-colors ${segmentId === s.id ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'group-hover:border-indigo-500/30 group-hover:text-indigo-300'}`}>{s.audienceSize} Customers</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button disabled={!segmentId} onClick={() => setStep(2)} className="hover:bg-indigo-500 hover:text-white transition-colors hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">Next <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-sm font-medium">Generate A/B Test Variants</h2>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-[#A0A0A0]">Campaign Goal</label>
                  <Input 
                    placeholder="e.g. Win back customers with a 20% discount" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-[#000] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all hover:border-indigo-500/50"
                  />
              </div>
              <div className="p-4 bg-[#000] rounded border border-[#222]">
                <p className="text-[10px] text-[#A0A0A0] uppercase font-semibold mb-2 tracking-wider">Targeting</p>
                <p className="text-[13px] font-medium">{segmentName}</p>
                <p className="text-[12px] text-[#A0A0A0] mt-1">{segmentDescription}</p>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)} className="hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"><ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back</Button>
            <Button onClick={handleGenerateMessage} disabled={!goal || loading} className="hover:bg-indigo-500 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              {loading ? "Generating Variants..." : "Generate 3 Variants"} <Sparkles className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-medium tracking-tight mb-2">Review Variants</h2>
            <p className="text-sm text-[#A0A0A0]">Fine-tune the AI-generated copy. The system will automatically run multivariate tests on these.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {variants.map((variant, idx) => {
              const themeColors = [
                { ring: 'focus-within:ring-white/10', border: 'focus-within:border-white/20', hover: 'hover:border-white/20 hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)]', headerBg: 'group-focus-within:bg-white/[0.03]', iconBg: 'bg-[#111] text-white border border-[#333] shadow-sm', inputBorder: 'focus:border-white/30', text: 'group-focus-within:text-white' },
                { ring: 'focus-within:ring-white/10', border: 'focus-within:border-white/20', hover: 'hover:border-white/20 hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)]', headerBg: 'group-focus-within:bg-white/[0.03]', iconBg: 'bg-[#111] text-white border border-[#333] shadow-sm', inputBorder: 'focus:border-white/30', text: 'group-focus-within:text-white' },
                { ring: 'focus-within:ring-white/10', border: 'focus-within:border-white/20', hover: 'hover:border-white/20 hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)]', headerBg: 'group-focus-within:bg-white/[0.03]', iconBg: 'bg-[#111] text-white border border-[#333] shadow-sm', inputBorder: 'focus:border-white/30', text: 'group-focus-within:text-white' }
              ];
              const theme = themeColors[idx % 3];

              return (
              <div key={idx} className={`flex flex-col bg-[#050505] border border-[#222] rounded-lg overflow-hidden group focus-within:ring-2 transition-all duration-300 hover:-translate-y-1 ${theme.ring} ${theme.border} ${theme.hover}`}>
                <div className={`px-5 py-4 border-b border-[#222] bg-[#0A0A0A] flex justify-between items-center transition-colors duration-300 ${theme.headerBg}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${theme.iconBg}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-[13px] font-medium text-[#EDEDED] transition-colors ${theme.text}`}>Variant {String.fromCharCode(65 + idx)}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] bg-transparent border-[#333] text-[#A0A0A0] transition-colors ${theme.text}`}>AI Generated</Badge>
                </div>
                
                <div className="p-5 space-y-6 flex-1 flex flex-col group-hover:bg-[#080808] transition-colors duration-300">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-[#777]">Subject</label>
                    <Input 
                      value={variant.subject} 
                      onChange={(e) => handleVariantChange(idx, 'subject', e.target.value)} 
                      className={`bg-[#0A0A0A] border-[#222] text-[14px] font-medium text-[#EDEDED] shadow-sm transition-colors ${theme.inputBorder}`}
                    />
                  </div>
                  
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-[11px] font-medium text-[#777]">Message Body</label>
                    <Textarea 
                      value={variant.message} 
                      onChange={(e) => handleVariantChange(idx, 'message', e.target.value)} 
                      className={`bg-[#0A0A0A] border-[#222] min-h-[180px] text-[13px] text-[#A0A0A0] resize-none flex-1 leading-relaxed shadow-sm transition-colors ${theme.inputBorder}`} 
                    />
                  </div>
                </div>
              </div>
            )})}
          </div>

          <div className="flex justify-between items-center pt-6 mt-4 border-t border-[#222]">
            <Button variant="outline" onClick={() => setStep(2)} className="h-10 px-6 text-[13px] hover:text-indigo-400 hover:border-indigo-500/50 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back
            </Button>
            <Button onClick={handleGetRecommendation} disabled={variants.length === 0 || loading} className="h-10 px-6 text-[13px] hover:bg-indigo-500 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              {loading ? "Analyzing..." : "Get Channel Recommendation"} <Sparkles className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-sm font-medium">Final Preview</h2>
          
          {recommendation && (
            <Card className="border-[#222] bg-[#050505]">
              <CardContent className="pt-5 flex gap-4 items-start">
                <div className="w-8 h-8 rounded border border-[#333] bg-[#111] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#EDEDED]" />
                </div>
                <div>
                  <h3 className="font-medium text-[14px] flex items-center gap-2">
                    AI Recommends: {recommendation.recommendedChannel}
                  </h3>
                  <p className="text-[13px] text-[#A0A0A0] mt-1">{recommendation.reason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="border-b border-[#222]">
                <CardTitle className="text-[12px] uppercase tracking-wider font-semibold text-[#A0A0A0]">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <p className="text-[10px] text-[#A0A0A0] uppercase font-semibold tracking-wider mb-1">Audience</p>
                  <p className="font-medium text-[13px]">{segmentName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#A0A0A0] uppercase font-semibold tracking-wider mb-1">Channel</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="py-1 px-3">
                      {channel === 'EMAIL' ? <Mail className="w-3.5 h-3.5 mr-2" /> : channel === 'WHATSAPP' ? <MessageSquare className="w-3.5 h-3.5 mr-2" /> : <Smartphone className="w-3.5 h-3.5 mr-2" />}
                      {channel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#A0A0A0] uppercase font-semibold tracking-wider mb-1">Testing Mode</p>
                  <Badge variant="outline">Autonomous A/B Testing</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-[#222]">
                <CardTitle className="text-[12px] uppercase tracking-wider font-semibold text-[#A0A0A0]">Selected Variants</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-4 bg-[#000] rounded border border-[#222]">
                  <p className="font-medium text-[13px] border-b border-[#222] pb-2 mb-2">3 AI Variants generated</p>
                  <p className="text-[12px] text-[#A0A0A0]">15% of the audience will be split among the variants. The highest performing variant will automatically be sent to the remaining 85%.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)} className="hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"><ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back</Button>
            <Button onClick={handleCreate} disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)] border-none">
              {loading ? "Creating..." : "Launch Experiment"} <Send className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
