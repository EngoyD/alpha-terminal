"use client";

import { Plus, Search } from "lucide-react";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { COMPANY_LIST, searchCompanies } from "@/lib/data/companies";
import { cn } from "@/lib/format";
import { useTerminal } from "../TerminalProvider";
import { Kbd } from "../ui/primitives";

export function TickerSearch({ onNavigate }: { onNavigate?: () => void }) {
  const { watchlist, addTicker, select } = useTerminal();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputId = useId();
  const listId = useId();

  const results = useMemo(() => searchCompanies(query), [query]);
  const hasQuery = query.trim().length > 0;
  const showList = open && hasQuery && results.length > 0;
  const optionId = (ticker: string) => `${listId}-${ticker}`;

  function commit(ticker: string) {
    addTicker(ticker);
    select(ticker);
    setQuery("");
    setActive(0);
    setOpen(false);
    onNavigate?.();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[Math.min(active, results.length - 1)];
      if (hit) commit(hit.profile.ticker);
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else e.currentTarget.blur();
      setOpen(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <label htmlFor={inputId} className="sr-only">
        Search tickers to add to the watchlist
      </label>
      <div className="flex h-9 items-center gap-2 rounded-md border border-gray-800 bg-gray-900/70 px-2.5 transition focus-within:border-cyan-400/60 focus-within:ring-1 focus-within:ring-cyan-400/30">
        <Search aria-hidden className="size-3.5 shrink-0 text-gray-400" />
        <input
          id={inputId}
          data-ticker-search
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? optionId(results[active].profile.ticker) : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder="Add ticker or company…"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-gray-100 uppercase placeholder:font-sans placeholder:text-gray-500 placeholder:normal-case focus:outline-none"
        />
        <Kbd>/</Kbd>
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Matching tickers"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-gray-700 bg-gray-900 py-1 shadow-2xl shadow-black/60"
      >
        {results.map((c, i) => {
          const { ticker, name, exchange } = c.profile;
          const inList = watchlist.includes(ticker);
          return (
            <li
              key={ticker}
              id={optionId(ticker)}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => commit(ticker)}
              className={cn("flex cursor-pointer items-center gap-2 px-3 py-1.5", i === active && "bg-cyan-400/10")}
            >
              <span className="w-12 shrink-0 font-mono text-[12px] font-bold text-gray-100">{ticker}</span>
              <span className="min-w-0 flex-1 truncate text-[11px] text-gray-400">
                {name} <span className="text-gray-500">· {exchange}</span>
              </span>
              {inList ? (
                <span className="text-[10px] text-gray-400">View</span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cyan-300">
                  <Plus aria-hidden className="size-3" />
                  Add
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {open && hasQuery && results.length === 0 && (
        <p role="status" className="absolute inset-x-0 top-full z-30 mt-1 rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-[11px] leading-relaxed text-gray-400 shadow-2xl shadow-black/60">
          No coverage for <span className="font-mono text-gray-200">{query.trim().toUpperCase()}</span>. The mock universe covers{" "}
          {COMPANY_LIST.map((c) => c.profile.ticker).join(", ")}.
        </p>
      )}
    </div>
  );
}
