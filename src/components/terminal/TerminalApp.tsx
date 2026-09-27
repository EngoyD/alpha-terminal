"use client";

import dynamic from "next/dynamic";

function BootScreen() {
  return (
    <div className="grid h-dvh place-items-center">
      <div className="font-mono text-xs leading-relaxed text-gray-400">
        <div className="text-sm font-bold tracking-tight text-white">
          ALPHA<span className="text-cyan-300">/</span>TERMINAL <span className="text-gray-400">v2</span>
        </div>
        <div className="mt-2">
          <span className="text-cyan-300">›</span> connecting simulated market feed
          <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 animate-blink bg-cyan-300" />
        </div>
      </div>
    </div>
  );
}

// The terminal is entirely client state (live ticks, clock, localStorage), so skip SSR
// and show a boot screen while the bundle loads.
const AlphaTerminal = dynamic(() => import("./AlphaTerminal"), { ssr: false, loading: BootScreen });

export function TerminalApp() {
  return <AlphaTerminal />;
}
