"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Save, Terminal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
    <div className="p-8 max-w-5xl mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audience Builder</h1>
        <p className="text-sm text-[#A1A8B3]">Describe your audience in plain english. The AI will do the rest.</p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {segmentData ? (
          <div className="space-y-6">
            <Card className="border-[#8B5CF6]/30 bg-[#8B5CF6]/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8B5CF6]"></div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                      {segmentData.segmentName}
                    </CardTitle>
                    <CardDescription>{explanation || segmentData.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#F8F9FA]">{segmentData.audienceSize}</div>
                    <div className="text-xs text-[#A1A8B3]">Total Customers</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-[#0B0D0F] border border-[#1E2329] p-4 flex flex-col gap-2 font-mono text-sm">
                  <div className="flex items-center gap-2 text-[#A1A8B3] mb-2 pb-2 border-b border-[#1E2329]">
                    <Terminal className="w-4 h-4" />
                    <span>Generated Prisma Query</span>
                  </div>
                  <pre className="text-[#F8F9FA] overflow-x-auto">
                    {JSON.stringify(segmentData.query, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSegmentData(null)}>Reset</Button>
                  <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-0" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Segment"} <Save className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-12 h-12 rounded-full bg-[#1E2329] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-lg font-medium">What kind of audience do you want to build?</h3>
              <p className="text-sm text-[#A1A8B3]">Try something like "customers in bangalore who spent more than 5000 and haven't purchased in 60 days"</p>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="relative flex items-center">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Customers who spent over $5000..."
              className="h-14 pr-14 text-base bg-[#0B0D0F] border-[#1E2329] shadow-sm rounded-xl focus-visible:ring-[#8B5CF6]/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <Button 
              size="icon" 
              className="absolute right-2 h-10 w-10 bg-[#1E2329] hover:bg-[#8B5CF6] text-white transition-colors rounded-lg"
              onClick={handleGenerate}
              disabled={loading || !prompt}
            >
              {loading ? <Sparkles className="w-4 h-4 animate-pulse" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
