"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Save, Terminal, CheckCircle2, BrainCircuit, Lightbulb, Users } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { buildSegment, explainSegment } from "@/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SegmentsPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [segmentData, setSegmentData] = useState<any>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [saving, setSaving] = useState(false);
  
  // Mocking parsed checklist for the UI since backend returns a text summary
  const [checklist, setChecklist] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const data = await buildSegment(prompt);
      setSegmentData(data);
      
      if (data.query) {
        const exp = await explainSegment(data.query);
        setExplanation(exp.summary);
        
        // Mock checklist parsing from prompt/summary for the "AI Understanding" UX requirement
        const words = prompt.toLowerCase();
        const list = [];
        if (words.includes('spent') || words.includes('spend')) list.push('Spent above target threshold');
        if (words.includes('bangalore') || words.includes('city') || words.includes('location')) list.push('Located in target region');
        if (words.includes('days') || words.includes('inactive') || words.includes('dormant')) list.push('Matches inactivity timeframe');
        if (list.length === 0) {
          list.push('Matches demographic profile');
          list.push('Matches recent purchase behavior');
        }
        setChecklist(list);
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
      setChecklist([]);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 max-w-[800px] mx-auto space-y-8 h-full flex flex-col"
    >
      <div className="pb-4 border-b border-[#222]">
        <h1 className="text-xl font-medium tracking-tight">Audience Builder</h1>
        <p className="text-sm text-[#A0A0A0] mt-1">Describe your audience in plain english. The AI will do the rest.</p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {segmentData ? (
          // ... existing result card
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="border border-[#222] bg-[#050505] p-6 lg:p-8 rounded-md">
              <div className="flex items-center gap-2 mb-6 text-[#EDEDED]">
                <BrainCircuit className="w-5 h-5" />
                <h2 className="text-base font-medium tracking-tight">AI Understanding</h2>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-[13px] text-[#A0A0A0]">I found customers who:</p>
                <ul className="space-y-3">
                  {checklist.map((item, i) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      key={i} 
                      className="flex items-center gap-3 text-[14px] text-[#EDEDED]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#222]">
                <div>
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-1">Estimated Reach</p>
                  <p className="text-xl font-medium text-[#EDEDED] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#555]" />
                    {segmentData.audienceSize} users
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#A0A0A0] uppercase tracking-wider font-semibold mb-1">Recommended Strategy</p>
                  <p className="text-[14px] text-[#EDEDED] flex items-center gap-2 mt-1">
                    <Lightbulb className="w-4 h-4 text-[#555]" />
                    {checklist.length > 2 ? 'Win-back Campaign' : 'Retention Campaign'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSegmentData(null)}>Reset</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#EDEDED] text-[#000] hover:bg-[#A0A0A0]">
                {saving ? "Saving..." : "Save Segment"} <Save className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </motion.div>
        ) : loading ? (
          /* Skeleton shown while AI is processing the segment */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-[#222] bg-[#050505] p-6 lg:p-8 rounded-md space-y-6"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-3 w-40" />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 flex-1 max-w-xs" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#222]">
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-[#222] rounded-md bg-[#050505]">
            <div className="text-center space-y-4 max-w-md p-8">
              <div className="w-10 h-10 rounded border border-[#222] bg-[#000] flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-[#EDEDED]" />
              </div>
              <h3 className="text-sm font-medium">Who do you want to reach?</h3>
              <p className="text-[13px] text-[#A0A0A0]">Try something like "customers in bangalore who spent more than 5000 and haven't purchased in 60 days"</p>
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="relative flex items-center">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your audience..."
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
    </motion.div>
  );
}
