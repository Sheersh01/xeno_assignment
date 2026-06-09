"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Save, Terminal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { buildSegment, explainSegment } from "@/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SegmentsPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [segmentData, setSegmentData] = useState<any>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const data = await buildSegment(prompt);
      setSegmentData(data);
      
      if (data.query) {
        const exp = await explainSegment(data.query);
        setExplanation(exp.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!segmentData) return;
    setSaving(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/segments`, {
        name: segmentData.segmentName,
        description: explanation || segmentData.description,
        naturalLanguageInput: prompt,
        query: segmentData.query,
        audienceSize: segmentData.audienceSize
      });
      alert("Segment saved successfully!");
      setPrompt("");
      setSegmentData(null);
      setExplanation("");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto space-y-8 h-full flex flex-col">
      <div className="pb-4 border-b border-[#222]">
        <h1 className="text-xl font-medium tracking-tight">Audience Builder</h1>
        <p className="text-sm text-[#A0A0A0] mt-1">Describe your audience in plain english. The AI will do the rest.</p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {segmentData ? (
          <div className="space-y-6">
            <Card className="border-[#222] bg-[#050505]">
              <CardHeader className="border-b border-[#222]">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#555]" />
                      {segmentData.segmentName}
                    </CardTitle>
                    <CardDescription className="text-sm">{explanation || segmentData.description}</CardDescription>
                  </div>
                  <div className="text-right flex gap-8">
                    <div>
                      <div className="text-xl font-medium text-[#EDEDED]">₹{segmentData.avgSpend?.toLocaleString() || 0}</div>
                      <div className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold mt-1">Avg Spend</div>
                    </div>
                    <div>
                      <div className="text-xl font-medium text-[#EDEDED]">{segmentData.audienceSize}</div>
                      <div className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold mt-1">Total Customers</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded border border-[#222] bg-[#000] p-4 flex flex-col gap-2 font-mono text-sm">
                  <div className="flex items-center gap-2 text-[#A0A0A0] mb-2 pb-2 border-b border-[#222]">
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Generated Prisma Query</span>
                  </div>
                  <pre className="text-[#EDEDED] overflow-x-auto text-[13px]">
                    {JSON.stringify(segmentData.query, null, 2)}
                  </pre>
                </div>

                {segmentData.reasoning && (
                  <div className="mt-4 p-4 rounded border border-[#222] bg-[#000]">
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#A0A0A0] mb-2">Why this audience?</h4>
                    <p className="text-[13px] text-[#EDEDED] leading-relaxed whitespace-pre-wrap">
                      {segmentData.reasoning}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSegmentData(null)}>Reset</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Segment"} <Save className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-[#222] rounded-md bg-[#050505]">
            <div className="text-center space-y-4 max-w-md p-8">
              <div className="w-10 h-10 rounded border border-[#222] bg-[#000] flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-[#EDEDED]" />
              </div>
              <h3 className="text-sm font-medium">What kind of audience do you want to build?</h3>
              <p className="text-[13px] text-[#A0A0A0]">Try something like "customers in bangalore who spent more than 5000 and haven't purchased in 60 days"</p>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="relative flex items-center">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Customers who spent over $5000..."
              className="h-12 pr-12 text-sm bg-[#000] border-[#222] rounded-md focus-visible:ring-[#EDEDED]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <Button 
              size="icon" 
              className="absolute right-1.5 h-9 w-9 bg-[#222] hover:bg-[#333] border-0 text-[#EDEDED] transition-colors rounded"
              onClick={handleGenerate}
              disabled={loading || !prompt}
            >
              {loading ? <Sparkles className="w-3.5 h-3.5 animate-pulse" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
