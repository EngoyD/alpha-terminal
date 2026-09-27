"use client";

import { X } from "lucide-react";
import { useEffect, useEffectEvent } from "react";
import { MarketHeader } from "./MarketHeader";
import { Sidebar } from "./sidebar/Sidebar";
import { MainStage } from "./stage/MainStage";
import { StatusBar } from "./StatusBar";
import { TerminalProvider, useTerminal } from "./TerminalProvider";

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/** Terminal-wide shortcuts. Section keys (1–3) live in the AI panel. */
function Hotkeys() {
  const { watchlist, selected, select, generateReport, toggleWatch, sidebarOpen, setSidebarOpen } = useTerminal();

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape" && sidebarOpen) {
      setSidebarOpen(false);
      return;
    }
    if (isTyping(e.target)) return;

    switch (e.key) {
      case "/":
        e.preventDefault();
        if (window.matchMedia("(max-width: 1023px)").matches) setSidebarOpen(true);
        // Desktop sidebar and mobile drawer each render a search box; focus the visible one.
        requestAnimationFrame(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>("[data-ticker-search]");
          Array.from(inputs).find((el) => el.offsetParent !== null)?.focus();
        });
        break;
      case "ArrowDown":
      case "ArrowUp": {
        // Leave arrows alone inside widgets that use them (tabs, scrollable panels).
        const target = e.target as HTMLElement;
        if (target !== document.body && !target.closest("[data-watchlist]")) return;
        if (!watchlist.length) return;
        e.preventDefault();
        const i = watchlist.indexOf(selected);
        const next = e.key === "ArrowDown" ? (i + 1) % watchlist.length : (i - 1 + watchlist.length) % watchlist.length;
        select(watchlist[i === -1 ? 0 : next]);
        break;
      }
      case "g":
      case "G":
        generateReport(selected);
        break;
      case "w":
      case "W":
        toggleWatch(selected);
        break;
    }
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return null;
}

function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useTerminal();
  if (!sidebarOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Watchlist and AI discovery" className="fixed inset-0 z-50 lg:hidden">
      <button type="button" aria-label="Close" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-y-0 left-0 flex w-[88vw] max-w-80 animate-slide-in-left flex-col border-r border-gray-800 bg-gray-950">
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-800 px-3">
          <span className="font-mono text-[11px] font-semibold tracking-widest text-gray-300">COMMAND CENTER</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close watchlist"
            autoFocus
            className="grid size-8 place-items-center rounded text-gray-300 hover:bg-gray-800"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>
    </div>
  );
}

export default function AlphaTerminal() {
  return (
    <TerminalProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        <MarketHeader />
        <div className="flex min-h-0 flex-1">
          <aside aria-label="Command center" className="hidden w-72 shrink-0 border-r border-gray-800/80 lg:flex 2xl:w-80">
            <Sidebar />
          </aside>
          <main className="min-w-0 flex-1 overflow-y-auto p-2 xl:overflow-hidden">
            <MainStage />
          </main>
        </div>
        <StatusBar />
      </div>
      <MobileSidebar />
      <Hotkeys />
    </TerminalProvider>
  );
}
