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
    subject, message, setMessage,
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
      const res = await generateMessage(goal, segmentDescription);
      setMessage(res.subject, res.message);
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

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await createCampaign({
        name: `${goal} Campaign`,
        segmentId,
        message: `${subject}\n\n${message}`,
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
        <p className="text-sm text-[#A1A8B3]">AI-assisted campaign creation wizard.</p>
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
          <h2 className="text-lg font-medium">Generate Message</h2>
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
              {loading ? "Generating..." : "Generate with AI"} <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-medium">Review Message & Select Channel</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A8B3]">Subject</label>
                <Input value={subject} onChange={(e) => setMessage(e.target.value, message)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#A1A8B3]">Message</label>
                <Textarea value={message} onChange={(e) => setMessage(subject, e.target.value)} className="h-32" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={handleGetRecommendation} disabled={!message || loading} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[#A1A8B3]">Message Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-[#0B0D0F] rounded-lg border border-[#1E2329]">
                  <p className="font-semibold border-b border-[#1E2329] pb-2 mb-2">{subject}</p>
                  <p className="text-sm whitespace-pre-wrap">{message}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button onClick={handleCreate} disabled={loading} className="bg-white text-black hover:bg-gray-200">
              {loading ? "Creating..." : "Create Campaign"} <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
