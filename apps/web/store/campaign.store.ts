import { create } from "zustand";

interface CampaignState {
  step: number;
  segmentId: string | null;
  segmentName: string;
  segmentDescription: string;
  goal: string;
  subject: string;
  message: string;
  channel: string;
  
  // Actions
  setStep: (step: number) => void;
  setSegment: (id: string, name: string, description: string) => void;
  setGoal: (goal: string) => void;
  setMessage: (subject: string, message: string) => void;
  setChannel: (channel: string) => void;
  reset: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  step: 1,
  segmentId: null,
  segmentName: "",
  segmentDescription: "",
  goal: "",
  subject: "",
  message: "",
  channel: "EMAIL",

  setStep: (step) => set({ step }),
  setSegment: (id, name, description) => set({ segmentId: id, segmentName: name, segmentDescription: description }),
  setGoal: (goal) => set({ goal }),
  setMessage: (subject, message) => set({ subject, message }),
  setChannel: (channel) => set({ channel }),
  reset: () => set({
    step: 1,
    segmentId: null,
    segmentName: "",
    segmentDescription: "",
    goal: "",
    subject: "",
    message: "",
    channel: "EMAIL",
  }),
}));
