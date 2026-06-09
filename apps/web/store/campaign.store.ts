import { create } from "zustand";

interface Variant {
  subject: string;
  message: string;
}

interface CampaignState {
  step: number;
  segmentId: string | null;
  segmentName: string;
  segmentDescription: string;
  goal: string;
  variants: Variant[];
  channel: string;
  
  // Actions
  setStep: (step: number) => void;
  setSegment: (id: string, name: string, description: string) => void;
  setGoal: (goal: string) => void;
  setVariants: (variants: Variant[]) => void;
  setChannel: (channel: string) => void;
  reset: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  step: 1,
  segmentId: null,
  segmentName: "",
  segmentDescription: "",
  goal: "",
  variants: [],
  channel: "EMAIL",

  setStep: (step) => set({ step }),
  setSegment: (id, name, description) => set({ segmentId: id, segmentName: name, segmentDescription: description }),
  setGoal: (goal) => set({ goal }),
  setVariants: (variants) => set({ variants }),
  setChannel: (channel) => set({ channel }),
  reset: () => set({
    step: 1,
    segmentId: null,
    segmentName: "",
    segmentDescription: "",
    goal: "",
    variants: [],
    channel: "EMAIL",
  }),
}));
