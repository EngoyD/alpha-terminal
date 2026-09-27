"use client";

import { COMPANIES } from "@/lib/data/companies";
import { useTerminal } from "../TerminalProvider";
import { AIAnalysisPanel } from "./ai/AIAnalysisPanel";
import { FinancialHealth } from "./FinancialHealth";
import { NewsFeed } from "./NewsFeed";
import { PriceChart } from "./PriceChart";
import { TickerHero } from "./TickerHero";

/**
 * Deep dive for the selected ticker. At xl+ it is a fixed 100vh bento grid where
 * panels scroll internally; below that it becomes a scrolling two/one-column stack.
 */
export function MainStage() {
  const { selected } = useTerminal();
  const company = COMPANIES[selected];

  return (
    <div className="grid gap-2 md:grid-cols-2 xl:h-full xl:grid-cols-12 xl:grid-rows-[auto_minmax(0,1.25fr)_minmax(0,1fr)]">
      <TickerHero company={company} className="md:col-span-2 xl:col-span-12" />
      <PriceChart company={company} className="h-[380px] md:col-span-2 xl:col-span-7 xl:h-auto" />
      <AIAnalysisPanel company={company} className="h-[560px] md:col-span-2 xl:col-span-5 xl:row-span-2 xl:h-auto" />
      <FinancialHealth company={company} className="md:h-[440px] xl:col-span-3 xl:h-auto" />
      <NewsFeed company={company} className="h-[440px] xl:col-span-4 xl:h-auto" />
    </div>
  );
}
