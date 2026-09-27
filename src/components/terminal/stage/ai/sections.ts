import { CalendarClock, Layers, ShieldAlert, type LucideIcon } from "lucide-react";

export type SectionKey = "moat" | "catalysts" | "risks";

export const SECTIONS: { key: SectionKey; short: string; title: string; Icon: LucideIcon }[] = [
  { key: "moat", short: "Moat", title: "Core Business & Moat", Icon: Layers },
  { key: "catalysts", short: "Catalysts", title: "Upcoming Catalysts & Earnings", Icon: CalendarClock },
  { key: "risks", short: "Risks", title: "Major Risk Factors (SEC extracted)", Icon: ShieldAlert },
];
