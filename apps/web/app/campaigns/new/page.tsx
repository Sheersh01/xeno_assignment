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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Campaign</h1>
        <p className="text-sm text-[#A1A8B3]">AI-assisted autonomous A/B testing campaign wizard.</p>
      </div>

      <div className="flex items-center gap-2 mb-8 text-sm font-medium">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= i ? 'bg-[#8B5CF6] text-white' : 'bg-[#1E2329] text-[#A1A8B3]'}`}>
              {step > i ? <Check className="w-3 h-3" /> : i}
            </div>
            {i < 4 && <div className={`w-8 h-[2px] ${step > i ? 'bg-[#8B5CF6]' : 'bg-[#1E2329]'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-medium">Select Audience Segment</h2>
          <div className="grid grid-cols-2 gap-4">
            {segments.map((s) => (
              <Card 
                key={s.id} 
                className={`cursor-pointer transition-colors hover:border-[#8B5CF6]/50 ${segmentId === s.id ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]' : ''}`}
                onClick={() => setSegment(s.id, s.name, s.description || "Segment")}
              >
                <CardHeader>
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{s.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{s.audienceSize} Customers</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button disabled={!segmentId} onClick={() => setStep(2)}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-medium">Generate A/B Test Variants</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A8B3]">Campaign Goal</label>
                <Input 
                  placeholder="e.g. Win back customers with a 20% discount" 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              <div className="p-4 bg-[#1E2329]/30 rounded-md border border-[#1E2329]">
                <p className="text-xs text-[#A1A8B3] uppercase font-semibold mb-1">Targeting</p>
                <p className="text-sm font-medium">{segmentName}</p>
                <p className="text-xs text-[#A1A8B3] mt-1">{segmentDescription}</p>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={handleGenerateMessage} disabled={!goal || loading} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
              {loading ? "Generating 3 Variants..." : "Generate 3 Variants"} <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-medium">Review Variants & Select Channel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((variant, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base text-[#A1A8B3]">Variant {String.fromCharCode(65 + idx)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A1A8B3]">Subject</label>
                    <Input 
                      value={variant.subject} 
                      onChange={(e) => handleVariantChange(idx, 'subject', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#A1A8B3]">Message</label>
                    <Textarea 
                      value={variant.message} 
                      onChange={(e) => handleVariantChange(idx, 'message', e.target.value)} 
                      className="h-32 text-sm" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={handleGetRecommendation} disabled={variants.length === 0 || loading} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
              {loading ? "Analyzing..." : "Get Channel Recommendation"} <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-medium">Final Preview</h2>
          
          {recommendation && (
            <Card className="border-[#8B5CF6]/50 bg-[#8B5CF6]/5">
              <CardContent className="pt-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    AI Recommends: {recommendation.recommendedChannel}
                  </h3>
                  <p className="text-sm text-[#A1A8B3] mt-1">{recommendation.reason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[#A1A8B3]">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-[#A1A8B3] mb-1">Audience</p>
                  <p className="font-medium">{segmentName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A1A8B3] mb-1">Channel</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base py-1 px-3">
                      {channel === 'EMAIL' ? <Mail className="w-4 h-4 mr-2" /> : channel === 'WHATSAPP' ? <MessageSquare className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                      {channel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#A1A8B3] mb-1">Testing Mode</p>
                  <Badge variant="outline" className="text-[#8B5CF6] border-[#8B5CF6]/50">Autonomous A/B Testing</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[#A1A8B3]">Selected Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-[#0B0D0F] rounded-lg border border-[#1E2329]">
                  <p className="font-semibold text-sm border-b border-[#1E2329] pb-2 mb-2">3 AI Variants generated</p>
                  <p className="text-sm text-[#A1A8B3]">15% of the audience will be split among the variants. The highest performing variant will automatically be sent to the remaining 85%.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={handleCreate} disabled={loading} className="bg-white text-black hover:bg-gray-200">
              {loading ? "Creating..." : "Launch Experiment"} <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
