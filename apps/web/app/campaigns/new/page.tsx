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
            <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${step >= i ? 'bg-[#EDEDED] text-[#000]' : 'bg-[#111] text-[#555] border border-[#222]'}`}>
              {step > i ? <Check className="w-3 h-3" /> : i}
            </div>
            {i < 4 && <div className={`w-8 h-[1px] ${step > i ? 'bg-[#555]' : 'bg-[#222]'}`} />}
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
                className={`cursor-pointer transition-colors hover:border-[#555] ${segmentId === s.id ? 'border-[#EDEDED] ring-1 ring-[#EDEDED]' : ''}`}
                onClick={() => setSegment(s.id, s.name, s.description || "Segment")}
              >
                <CardHeader className="border-b border-[#222] pb-3">
                  <CardTitle className="text-[13px]">{s.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="line-clamp-2 text-[12px] mb-4">{s.description}</CardDescription>
                  <Badge variant="outline">{s.audienceSize} Customers</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button disabled={!segmentId} onClick={() => setStep(2)}>Next <ArrowRight className="w-3.5 h-3.5 ml-2" /></Button>
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
                  className="bg-[#000]"
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
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back</Button>
            <Button onClick={handleGenerateMessage} disabled={!goal || loading}>
              {loading ? "Generating Variants..." : "Generate 3 Variants"} <Sparkles className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-sm font-medium">Review Variants & Select Channel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((variant, idx) => (
              <Card key={idx}>
                <CardHeader className="border-b border-[#222]">
                  <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-[#A0A0A0]">Variant {String.fromCharCode(65 + idx)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#A0A0A0]">Subject</label>
                    <Input 
                      value={variant.subject} 
                      onChange={(e) => handleVariantChange(idx, 'subject', e.target.value)} 
                      className="bg-[#000] text-[13px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-[#A0A0A0]">Message</label>
                    <Textarea 
                      value={variant.message} 
                      onChange={(e) => handleVariantChange(idx, 'message', e.target.value)} 
                      className="h-32 text-[13px] bg-[#000]" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back</Button>
            <Button onClick={handleGetRecommendation} disabled={variants.length === 0 || loading}>
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
            <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Launch Experiment"} <Send className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
