export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  recruiter: string;
  hospital: string;
  initials: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    recruiter: "Priya Mehra",
    hospital: "Apollo Clinic, Kolkata",
    initials: "PM",
    lastMessage: "Are you available for a call on Wednesday?",
    lastTime: "10:42 AM",
    unread: 2,
    messages: [
      { id: "m1", from: "them", text: "Hi Dr. Sengupta, thanks for applying.", time: "10:32 AM" },
      { id: "m2", from: "them", text: "We loved your profile.", time: "10:33 AM" },
      { id: "m3", from: "me", text: "Thank you, happy to discuss further.", time: "10:38 AM" },
      { id: "m4", from: "them", text: "Are you available for a call on Wednesday?", time: "10:42 AM" },
    ],
  },
  {
    id: "c2",
    recruiter: "Rohan Kapoor",
    hospital: "Fortis Hospital, Bengaluru",
    initials: "RK",
    lastMessage: "Sharing the JD for the radiology lead role.",
    lastTime: "Yesterday",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Sharing the JD for the radiology lead role.", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    recruiter: "Dr. Anil Verma",
    hospital: "AIIMS, New Delhi",
    initials: "AV",
    lastMessage: "Please confirm your earliest joining date.",
    lastTime: "2d",
    unread: 1,
    messages: [
      { id: "m1", from: "them", text: "Please confirm your earliest joining date.", time: "2 days ago" },
    ],
  },
  {
    id: "c4",
    recruiter: "Neha Iyer",
    hospital: "Manipal Hospitals, Bengaluru",
    initials: "NI",
    lastMessage: "Looking forward to the interview.",
    lastTime: "3d",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Looking forward to the interview.", time: "3 days ago" },
    ],
  },
];
