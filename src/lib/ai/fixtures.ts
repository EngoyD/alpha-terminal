import type { AIReport } from "./schema";

/**
 * Canned "model output" for the mock provider. It goes through the same schema
 * validation a real LLM response would, so the UI cannot tell the difference.
 * Illustrative content only.
 */
const REPORTS: Record<string, AIReport> = {
  NVDA: {
    ticker: "NVDA",
    stance: "bullish",
    confidence: 0.78,
    summary:
      "Dominant AI-accelerator franchise with a compounding software moat. The debate has shifted from demand to how durable hyperscaler capex is into 2027.",
    business: {
      overview:
        "Sells GPUs, full rack-scale systems and networking to cloud providers, enterprises and sovereign AI programs, with CUDA and enterprise software tying customers to the platform. Data-center revenue now dwarfs the legacy gaming and visualization businesses.",
      segments: [
        { name: "Data center", share: 0.88 },
        { name: "Gaming", share: 0.07 },
        { name: "Professional visualization", share: 0.02 },
        { name: "Automotive & robotics", share: 0.02 },
        { name: "OEM & other", share: 0.01 },
      ],
      moatRating: "wide",
      moatHeadline: "Full-stack lock-in across silicon, networking and CUDA.",
      advantages: [
        {
          title: "CUDA developer ecosystem",
          detail:
            "A decade of optimized libraries and millions of trained developers make porting production workloads to rival silicon slow and costly.",
        },
        {
          title: "System-level integration",
          detail:
            "Sells rack-scale systems rather than chips. NVLink, networking and reference designs capture a larger share of each data-center dollar.",
        },
        {
          title: "Annual architecture cadence",
          detail:
            "A one-year product cycle (Blackwell to Rubin) keeps competitors chasing a moving target and supports pricing power.",
        },
      ],
    },
    catalysts: {
      headline: "Earnings and the Rubin ramp dominate the next two quarters.",
      events: [
        {
          date: "2026-10-27",
          dateLabel: null,
          title: "GTC Washington D.C. keynote",
          type: "product",
          impact: "medium",
          detail: "Watch for Rubin Ultra timing, sovereign-AI deals and networking attach rates.",
        },
        {
          date: "2026-11-18",
          dateLabel: null,
          title: "Q3 FY27 earnings",
          type: "earnings",
          impact: "high",
          detail: "Data-center guide and the gross-margin path through the Rubin transition are the swing factors.",
        },
        {
          date: "2026-12-15",
          dateLabel: "Dec 2026",
          title: "Export-license framework update",
          type: "regulatory",
          impact: "high",
          detail: "Any change to licensing for China-bound accelerators moves the international revenue run-rate.",
        },
        {
          date: "2027-01-06",
          dateLabel: null,
          title: "CES 2027 keynote",
          type: "product",
          impact: "low",
          detail: "Consumer, PC and robotics platform updates with limited near-term revenue impact.",
        },
      ],
    },
    risks: {
      headline: "Customer concentration and geopolitics outweigh competitive threats near term.",
      factors: [
        {
          title: "Customer concentration",
          severity: "high",
          source: "10-K FY2026 · Item 1A",
          summary:
            "A small number of hyperscale customers account for a large share of data-center revenue, so a coordinated capex pause would hit results quickly.",
        },
        {
          title: "Export controls",
          severity: "high",
          source: "10-K FY2026 · Item 1A",
          summary:
            "Expanded U.S. licensing requirements could restrict sales of advanced products to China and other regions with little notice.",
        },
        {
          title: "Foundry and packaging dependence",
          severity: "medium",
          source: "10-Q Q2 FY27 · Part II, Item 1A",
          summary:
            "Relies on third-party foundries for leading-edge wafers and advanced packaging; capacity limits or a regional disruption would constrain supply.",
        },
        {
          title: "Custom-silicon substitution",
          severity: "medium",
          source: "10-K FY2026 · Item 1A",
          summary:
            "Customers building in-house accelerators could reduce demand or pricing power, particularly for inference workloads.",
        },
      ],
    },
    sources: ["10-K FY2026", "10-Q Q2 FY27", "Q2 FY27 earnings call", "8-K (Aug 2026)"],
  },

  AAPL: {
    ticker: "AAPL",
    stance: "neutral",
    confidence: 0.64,
    summary:
      "Unmatched ecosystem economics, but hardware growth is cyclical and the multiple already prices in a strong iPhone 18 cycle.",
    business: {
      overview:
        "Sells premium iPhones, Macs, iPads and wearables, then monetizes the installed base through App Store commissions, subscriptions, payments and licensing. Services now drive a disproportionate share of gross profit.",
      segments: [
        { name: "iPhone", share: 0.5 },
        { name: "Services", share: 0.27 },
        { name: "Mac", share: 0.08 },
        { name: "Wearables & home", share: 0.08 },
        { name: "iPad", share: 0.07 },
      ],
      moatRating: "wide",
      moatHeadline: "Ecosystem lock-in, monetized through Services.",
      advantages: [
        {
          title: "Installed-base flywheel",
          detail:
            "2.4B active devices create switching costs through iMessage, iCloud and cross-device continuity that rivals cannot replicate piecemeal.",
        },
        {
          title: "Services annuity",
          detail: "App Store, iCloud, AppleCare and payments earn roughly 75% gross margins and grow faster than hardware.",
        },
        {
          title: "Silicon and supply-chain scale",
          detail: "In-house Apple silicon and unmatched purchasing power sustain premium margins across the product line.",
        },
      ],
    },
    catalysts: {
      headline: "Holiday-quarter guidance is the next major checkpoint.",
      events: [
        {
          date: "2026-10-29",
          dateLabel: null,
          title: "FQ4 FY26 earnings",
          type: "earnings",
          impact: "high",
          detail: "First full read on iPhone 18 sell-through and December-quarter guidance.",
        },
        {
          date: "2026-11-15",
          dateLabel: "Q4 2026",
          title: "EU DMA compliance decision",
          type: "regulatory",
          impact: "medium",
          detail: "Possible fines or mandated changes to the App Store fee structure in Europe.",
        },
        {
          date: "2026-12-01",
          dateLabel: "Dec 2026",
          title: "Apple Intelligence expansion",
          type: "product",
          impact: "low",
          detail: "Wider language and region rollout could support upgrade demand in 2027.",
        },
        {
          date: "2027-03-15",
          dateLabel: "1H 2027",
          title: "U.S. search-default remedy ruling",
          type: "regulatory",
          impact: "high",
          detail: "Limits on default-search payments would pressure high-margin licensing revenue.",
        },
      ],
    },
    risks: {
      headline: "Regulatory pressure on Services is the key medium-term risk.",
      factors: [
        {
          title: "App Store regulation",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary:
            "Legislation and litigation in the U.S. and EU could force changes to commission rates and payment-steering rules.",
        },
        {
          title: "Search licensing revenue",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "Remedies in U.S. antitrust proceedings could restrict or end default-search payment arrangements.",
        },
        {
          title: "Greater China exposure",
          severity: "medium",
          source: "10-Q Q3 FY26 · Part II, Item 1A",
          summary: "Significant manufacturing and revenue exposure to Greater China amid trade and geopolitical tension.",
        },
        {
          title: "Product-cycle dependence",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "iPhone is still about half of revenue, so a weak upgrade cycle weighs directly on results.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q3 FY26", "Q3 FY26 earnings call"],
  },

  MSFT: {
    ticker: "MSFT",
    stance: "bullish",
    confidence: 0.74,
    summary:
      "Best-positioned enterprise AI distributor. Azure capacity, not demand, is the binding constraint on near-term growth.",
    business: {
      overview:
        "Sells cloud infrastructure (Azure), productivity software (Microsoft 365, Dynamics), LinkedIn, GitHub, Windows and gaming. AI is monetized through Copilot seat licenses and consumption of Azure AI services.",
      segments: [
        { name: "Intelligent Cloud", share: 0.41 },
        { name: "Productivity & Business Processes", share: 0.4 },
        { name: "More Personal Computing", share: 0.19 },
      ],
      moatRating: "wide",
      moatHeadline: "Enterprise distribution plus hyperscale infrastructure.",
      advantages: [
        {
          title: "Enterprise incumbency",
          detail:
            "Microsoft 365, Entra and Windows sit at the center of nearly every enterprise stack, lowering the cost of selling new AI products.",
        },
        {
          title: "Hyperscale cloud",
          detail: "Azure's global footprint and AI capacity create scale economies few competitors can match.",
        },
        {
          title: "Developer gravity",
          detail: "GitHub, VS Code and Azure AI Foundry anchor developers inside the ecosystem.",
        },
      ],
    },
    catalysts: {
      headline: "Azure growth and capex guidance drive the next leg.",
      events: [
        {
          date: "2026-10-28",
          dateLabel: null,
          title: "FQ1 FY27 earnings",
          type: "earnings",
          impact: "high",
          detail: "Azure growth versus capacity constraints, and the FY27 capex trajectory.",
        },
        {
          date: "2026-10-20",
          dateLabel: "Oct 2026",
          title: "UK cloud-licensing remedies",
          type: "regulatory",
          impact: "medium",
          detail: "Potential remedies on licensing terms for competing clouds.",
        },
        {
          date: "2026-11-17",
          dateLabel: null,
          title: "Ignite 2026",
          type: "product",
          impact: "medium",
          detail: "Copilot agent pricing and new Azure AI services.",
        },
      ],
    },
    risks: {
      headline: "Returns on the AI build-out are the central debate.",
      factors: [
        {
          title: "AI capex intensity",
          severity: "high",
          source: "10-K FY2026 · Item 1A",
          summary:
            "Heavy data-center investment may not earn expected returns if AI monetization lags the capacity build-out.",
        },
        {
          title: "Cloud competition",
          severity: "medium",
          source: "10-K FY2026 · Item 1A",
          summary: "Intense competition from other hyperscalers and model providers could pressure pricing.",
        },
        {
          title: "Regulatory scrutiny",
          severity: "medium",
          source: "10-K FY2026 · Item 1A",
          summary: "Competition reviews of cloud licensing and AI partnerships are under way in several jurisdictions.",
        },
        {
          title: "Cybersecurity incidents",
          severity: "medium",
          source: "10-K FY2026 · Item 1A",
          summary: "Nation-state attacks on Microsoft systems could damage customer trust and trigger regulatory action.",
        },
      ],
    },
    sources: ["10-K FY2026", "FQ4 FY26 earnings call", "8-K (Sep 2026)"],
  },

  TSLA: {
    ticker: "TSLA",
    stance: "neutral",
    confidence: 0.52,
    summary:
      "Valuation rests on autonomy and robotics optionality, while the core auto business faces margin pressure and share loss in key markets.",
    business: {
      overview:
        "Designs and sells electric vehicles direct to consumers, plus Megapack and Powerwall energy storage, charging and software services. Long-dated bets on FSD, robotaxi and Optimus account for much of the valuation.",
      segments: [
        { name: "Automotive", share: 0.74 },
        { name: "Energy generation & storage", share: 0.13 },
        { name: "Services & other", share: 0.13 },
      ],
      moatRating: "narrow",
      moatHeadline: "Scale and data advantages, but the auto moat is eroding.",
      advantages: [
        {
          title: "Fleet data advantage",
          detail:
            "Millions of camera-equipped vehicles generate driving data at a scale competitors cannot easily match for autonomy training.",
        },
        {
          title: "Manufacturing cost leadership",
          detail: "Large castings and vertical integration keep unit costs among the lowest in the EV industry.",
        },
        {
          title: "Energy storage growth",
          detail: "Megapack deployments are a fast-growing, higher-margin business less exposed to auto cyclicality.",
        },
      ],
    },
    catalysts: {
      headline: "Deliveries, earnings and robotaxi milestones in a dense 30-day window.",
      events: [
        {
          date: "2026-10-02",
          dateLabel: null,
          title: "Q3 2026 deliveries",
          type: "corporate",
          impact: "high",
          detail: "Consensus is about 468K; a miss would refocus attention on auto demand.",
        },
        {
          date: "2026-10-21",
          dateLabel: null,
          title: "Q3 2026 earnings",
          type: "earnings",
          impact: "high",
          detail: "Auto gross margin excluding credits, energy growth and robotaxi unit economics.",
        },
        {
          date: "2026-11-06",
          dateLabel: null,
          title: "Annual shareholder meeting",
          type: "corporate",
          impact: "medium",
          detail: "Votes on governance proposals and executive compensation.",
        },
        {
          date: "2026-12-01",
          dateLabel: "Q4 2026",
          title: "Cybercab volume production start",
          type: "product",
          impact: "high",
          detail: "Timing and ramp rate are central to the autonomy thesis.",
        },
      ],
    },
    risks: {
      headline: "Key-person and regulatory risks are unusually concentrated.",
      factors: [
        {
          title: "Key-person dependence",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "Heavy reliance on the CEO, whose attention is divided across several companies.",
        },
        {
          title: "Autonomy regulation and liability",
          severity: "high",
          source: "10-Q Q2 2026 · Part II, Item 1A",
          summary:
            "Investigations or incidents involving FSD or robotaxi could delay deployment and create product-liability exposure.",
        },
        {
          title: "EV price competition",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Aggressive pricing from Chinese and legacy automakers pressures volumes and margins.",
        },
        {
          title: "Regulatory-credit decline",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Changes to emissions-credit programs shrink a historically high-margin revenue stream.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "Q2 2026 earnings call", "NHTSA filings"],
  },

  AMD: {
    ticker: "AMD",
    stance: "bullish",
    confidence: 0.69,
    summary:
      "Credible number two in AI accelerators with a dominant server-CPU franchise. MI450 rack-scale execution is the swing factor for 2027.",
    business: {
      overview:
        "Designs CPUs, GPUs and adaptive chips manufactured by TSMC. Revenue is shifting toward the data center, where EPYC server CPUs and Instinct AI accelerators sell to hyperscalers and enterprises.",
      segments: [
        { name: "Data center", share: 0.48 },
        { name: "Client", share: 0.28 },
        { name: "Gaming", share: 0.13 },
        { name: "Embedded", share: 0.11 },
      ],
      moatRating: "narrow",
      moatHeadline: "A share-taker with engineering depth, still trailing on software.",
      advantages: [
        {
          title: "Chiplet architecture",
          detail: "Early mastery of chiplet design yields cost and yield advantages across EPYC and Instinct.",
        },
        {
          title: "Server CPU momentum",
          detail: "EPYC's performance-per-watt lead has driven multi-year share gains in cloud and enterprise.",
        },
        {
          title: "Open software stack",
          detail: "ROCm is narrowing the gap with CUDA and appeals to buyers wary of single-vendor lock-in.",
        },
      ],
    },
    catalysts: {
      headline: "MI450 launch and Q3 earnings are the near-term tests.",
      events: [
        {
          date: "2026-11-03",
          dateLabel: null,
          title: "Q3 2026 earnings",
          type: "earnings",
          impact: "high",
          detail: "Data-center GPU revenue run-rate and MI450 order visibility.",
        },
        {
          date: "2026-11-11",
          dateLabel: null,
          title: "Financial Analyst Day",
          type: "corporate",
          impact: "medium",
          detail: "Long-term margin and AI revenue targets.",
        },
        {
          date: "2026-12-10",
          dateLabel: "Q4 2026",
          title: "MI450 rack general availability",
          type: "product",
          impact: "high",
          detail: "On-time volume shipments would validate the rack-scale strategy.",
        },
      ],
    },
    risks: {
      headline: "Execution against a faster incumbent is the core risk.",
      factors: [
        {
          title: "Competitive execution",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary:
            "Failing to match competitors' AI product cadence and software ecosystem could limit accelerator share gains.",
        },
        {
          title: "Foundry dependence",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Relies on TSMC for leading-edge manufacturing, so capacity allocation is a constraint.",
        },
        {
          title: "Export controls",
          severity: "medium",
          source: "10-Q Q2 2026 · Part II, Item 1A",
          summary: "Licensing requirements limit sales of advanced accelerators to certain regions.",
        },
        {
          title: "PC and gaming cyclicality",
          severity: "low",
          source: "10-K FY2025 · Item 1A",
          summary: "Client and gaming segments remain exposed to swings in consumer demand.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "Q2 2026 earnings call", "8-K (Sep 2026)"],
  },

  PLTR: {
    ticker: "PLTR",
    stance: "bullish",
    confidence: 0.58,
    summary:
      "Best-in-class AI deployment engine with accelerating commercial growth, but the valuation leaves no room for a deceleration.",
    business: {
      overview:
        "Sells software platforms (Gotham, Foundry, AIP, Apollo) that integrate an organization's data and put AI models to work in operational decisions. Government agencies and large enterprises pay multi-year subscriptions.",
      segments: [
        { name: "U.S. government", share: 0.42 },
        { name: "U.S. commercial", share: 0.31 },
        { name: "International government", share: 0.14 },
        { name: "International commercial", share: 0.13 },
      ],
      moatRating: "narrow",
      moatHeadline: "Deep workflow embedding in high-stakes environments.",
      advantages: [
        {
          title: "Ontology-driven lock-in",
          detail: "Foundry's ontology becomes the customer's operational data layer, which makes replacement costly.",
        },
        {
          title: "Security accreditation",
          detail: "High-side accreditations and classified deployments are multi-year barriers to entry.",
        },
        {
          title: "Bootcamp sales motion",
          detail: "Hands-on AIP bootcamps compress sales cycles from months to days and drive fast expansion.",
        },
      ],
    },
    catalysts: {
      headline: "The Q3 print must justify an extreme multiple.",
      events: [
        {
          date: "2026-10-14",
          dateLabel: null,
          title: "AIPCon customer event",
          type: "corporate",
          impact: "low",
          detail: "Customer case studies have historically been a sentiment catalyst.",
        },
        {
          date: "2026-11-02",
          dateLabel: null,
          title: "Q3 2026 earnings",
          type: "earnings",
          impact: "high",
          detail: "U.S. commercial growth and the Rule of 40 score (about 94 last quarter).",
        },
        {
          date: "2026-12-15",
          dateLabel: "Q4 2026",
          title: "FY27 defense appropriations",
          type: "regulatory",
          impact: "medium",
          detail: "Budget allocation for software and AI programs.",
        },
      ],
    },
    risks: {
      headline: "Valuation and government concentration dominate the risk profile.",
      factors: [
        {
          title: "Share-price volatility",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "The stock has been, and may remain, highly volatile relative to operating results.",
        },
        {
          title: "Government concentration",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "A large share of revenue depends on government contracts subject to budget and political cycles.",
        },
        {
          title: "Stock-based compensation",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Ongoing equity grants dilute existing shareholders.",
        },
        {
          title: "Long sales cycles",
          severity: "low",
          source: "10-K FY2025 · Item 1A",
          summary: "Large deployments can involve long evaluations and significant upfront investment.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "Q2 2026 earnings call"],
  },

  SLS: {
    ticker: "SLS",
    stance: "neutral",
    confidence: 0.44,
    summary:
      "Binary Phase 3 setup. A positive REGAL readout could re-rate the equity several-fold; a miss would likely force a financing at distressed levels.",
    business: {
      overview:
        "Pre-revenue clinical-stage biotech. Value rests on galinpepimut-S (GPS), a WT1-targeting immunotherapy in the Phase 3 REGAL trial for AML patients in second remission, plus SLS009, a CDK9 inhibitor in Phase 2.",
      segments: [],
      moatRating: "narrow",
      moatHeadline: "IP-protected, first-in-class asset; the moat depends on Phase 3 success.",
      advantages: [
        {
          title: "Composition-of-matter IP",
          detail: "GPS patents and orphan-drug designations in the U.S. and EU would provide exclusivity well into the next decade if approved.",
        },
        {
          title: "First-in-class mechanism",
          detail: "WT1-targeted maintenance therapy addresses AML patients in second remission, who have few options.",
        },
        {
          title: "Regulatory designations",
          detail: "Fast Track and orphan status enable rolling review and potentially faster timelines.",
        },
      ],
    },
    catalysts: {
      headline: "One event dominates: the REGAL final analysis.",
      events: [
        {
          date: "2026-11-12",
          dateLabel: null,
          title: "Q3 2026 10-Q and cash update",
          type: "earnings",
          impact: "medium",
          detail: "Runway disclosure and at-the-market usage.",
        },
        {
          date: "2026-11-30",
          dateLabel: "Q4 2026",
          title: "REGAL Phase 3 final analysis",
          type: "clinical",
          impact: "high",
          detail: "Primary endpoint is overall survival, triggered after 80 events. A binary outcome for the equity.",
        },
        {
          date: "2026-12-06",
          dateLabel: null,
          title: "ASH 2026: SLS009 Phase 2 data",
          type: "clinical",
          impact: "medium",
          detail: "Response rates in relapsed/refractory AML with ASXL1 mutations.",
        },
        {
          date: "2027-04-15",
          dateLabel: "1H 2027",
          title: "Potential BLA submission",
          type: "regulatory",
          impact: "high",
          detail: "Contingent on positive REGAL data.",
        },
      ],
    },
    risks: {
      headline: "Clinical binary plus a financing overhang.",
      factors: [
        {
          title: "Single-asset clinical risk",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "Company value depends heavily on GPS; a failed Phase 3 would materially impair the business.",
        },
        {
          title: "Liquidity and dilution",
          severity: "high",
          source: "10-Q Q2 2026 · Part I, Item 2",
          summary:
            "Current cash funds operations for a limited period, so further equity raises are likely and would be dilutive.",
        },
        {
          title: "Regulatory pathway",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Even with positive data, the FDA may require additional trials or reach different conclusions.",
        },
        {
          title: "Manufacturing reliance",
          severity: "low",
          source: "10-K FY2025 · Item 1A",
          summary: "Relies on third-party manufacturers for clinical and eventual commercial supply.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "ClinicalTrials.gov (REGAL)", "8-K (Sep 2026)"],
  },

  VKTX: {
    ticker: "VKTX",
    stance: "bullish",
    confidence: 0.6,
    summary:
      "Well-funded obesity pure-play with competitive efficacy data. The question is whether it can differentiate against incumbents with scale and pricing power.",
    business: {
      overview:
        "Pre-revenue biotech developing VK2735, a dual GLP-1/GIP agonist in injectable (Phase 3) and oral (Phase 2) forms for obesity, and VK2809 for MASH. Likely paths to market are a partnership, an acquisition or a self-funded launch.",
      segments: [],
      moatRating: "narrow",
      moatHeadline: "Competitive data in a market dominated by giants.",
      advantages: [
        {
          title: "Dual-agonist profile",
          detail: "VK2735 has shown weight loss competitive with approved dual agonists in mid-stage trials.",
        },
        {
          title: "Oral and injectable optionality",
          detail: "Both formulations come from one molecule, enabling induction-to-maintenance sequencing.",
        },
        {
          title: "Strong balance sheet",
          detail: "About $690M in cash funds Phase 3 through key readouts without near-term dilution.",
        },
      ],
    },
    catalysts: {
      headline: "ObesityWeek data is the next read; Phase 3 is the big one.",
      events: [
        {
          date: "2026-10-22",
          dateLabel: null,
          title: "Q3 2026 earnings",
          type: "earnings",
          impact: "low",
          detail: "Cash burn and Phase 3 enrollment updates.",
        },
        {
          date: "2026-11-04",
          dateLabel: null,
          title: "ObesityWeek: oral maintenance data",
          type: "clinical",
          impact: "high",
          detail: "Tolerability and weight maintenance after switching from the injectable.",
        },
        {
          date: "2027-02-15",
          dateLabel: "Q1 2027",
          title: "VK2809 MASH Phase 3 decision",
          type: "clinical",
          impact: "medium",
          detail: "Contingent on a partnership or funding decision.",
        },
        {
          date: "2027-09-15",
          dateLabel: "2H 2027",
          title: "VANQUISH-1 Phase 3 topline",
          type: "clinical",
          impact: "high",
          detail: "78-week primary endpoint and the key value inflection.",
        },
      ],
    },
    risks: {
      headline: "Competing against scaled incumbents is the defining risk.",
      factors: [
        {
          title: "Competitive intensity",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary:
            "Large pharma incumbents with approved GLP-1 products have major scale, pricing and manufacturing advantages.",
        },
        {
          title: "Clinical and safety risk",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "Late-stage trials may fail to replicate earlier results or surface tolerability issues.",
        },
        {
          title: "Manufacturing scale-up",
          severity: "medium",
          source: "10-Q Q2 2026 · Part II, Item 1A",
          summary: "Depends on third parties to produce commercial-scale peptide supply.",
        },
        {
          title: "Pricing and reimbursement",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Payer coverage for obesity drugs remains limited and subject to policy change.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "ClinicalTrials.gov (VANQUISH-1)"],
  },

  CRSP: {
    ticker: "CRSP",
    stance: "bullish",
    confidence: 0.55,
    summary:
      "Commercial validation through Casgevy plus a deep in vivo pipeline, with net cash covering roughly 30% of the market cap.",
    business: {
      overview:
        "Develops CRISPR/Cas9 gene-editing therapies. Casgevy is sold with Vertex under a 60/40 profit split, while wholly owned in vivo cardiovascular and allogeneic CAR-T programs drive the pipeline.",
      segments: [
        { name: "Collaboration & license", share: 0.86 },
        { name: "Grants & other", share: 0.14 },
      ],
      moatRating: "narrow",
      moatHeadline: "Foundational IP and first-mover commercial experience in gene editing.",
      advantages: [
        {
          title: "Foundational CRISPR/Cas9 IP",
          detail: "Licensed foundational patents underpin a broad pipeline and partnering economics.",
        },
        {
          title: "First approved CRISPR therapy",
          detail: "Casgevy brings manufacturing, regulatory and launch experience competitors lack.",
        },
        {
          title: "Vertex partnership",
          detail: "Vertex funds and runs commercialization at scale in exchange for 60% of Casgevy profits.",
        },
      ],
    },
    catalysts: {
      headline: "In vivo cardiovascular data could reframe the platform.",
      events: [
        {
          date: "2026-11-05",
          dateLabel: null,
          title: "Q3 2026 earnings",
          type: "earnings",
          impact: "medium",
          detail: "Casgevy infusions and the treatment-center ramp.",
        },
        {
          date: "2026-11-08",
          dateLabel: null,
          title: "AHA 2026: CTX310 update",
          type: "clinical",
          impact: "high",
          detail: "Durability of LDL and triglyceride reductions from a one-time in vivo edit.",
        },
        {
          date: "2027-03-01",
          dateLabel: "1H 2027",
          title: "CTX320 Lp(a) dose-escalation data",
          type: "clinical",
          impact: "medium",
          detail: "First look at editing to lower lipoprotein(a), a large untreated population.",
        },
      ],
    },
    risks: {
      headline: "The commercial ramp is slower than hoped.",
      factors: [
        {
          title: "Slow commercial uptake",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "Complex treatment logistics and reimbursement may slow Casgevy adoption.",
        },
        {
          title: "In vivo clinical risk",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Early in vivo programs may show safety signals or insufficient durability.",
        },
        {
          title: "Patent disputes",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "Ongoing proceedings over CRISPR/Cas9 patent rights could affect licensing economics.",
        },
        {
          title: "Partner dependence",
          severity: "low",
          source: "10-Q Q2 2026 · Part II, Item 1A",
          summary: "Casgevy economics depend on Vertex's commercial execution and priorities.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "8-K (Sep 2026)"],
  },

  RKLB: {
    ticker: "RKLB",
    stance: "bullish",
    confidence: 0.57,
    summary:
      "The only scaled U.S. launch challenger outside SpaceX. Neutron's debut is the key de-risking event for the 2027 revenue ramp.",
    business: {
      overview:
        "Provides launch services on Electron (and soon Neutron) and builds spacecraft, satellite components and subsystems for commercial, civil and defense customers. Space Systems is already the larger revenue line.",
      segments: [
        { name: "Space systems", share: 0.66 },
        { name: "Launch services", share: 0.34 },
      ],
      moatRating: "narrow",
      moatHeadline: "Launch heritage plus vertical integration.",
      advantages: [
        {
          title: "Flight heritage",
          detail: "More than 70 Electron missions give customers schedule confidence few new entrants can offer.",
        },
        {
          title: "Vertical integration",
          detail: "In-house components (solar, reaction wheels, star trackers) capture margin across the value chain.",
        },
        {
          title: "Defense relationships",
          detail: "Growing national-security launch and spacecraft awards diversify away from commercial cycles.",
        },
      ],
    },
    catalysts: {
      headline: "Neutron's maiden flight dominates the setup.",
      events: [
        {
          date: "2026-11-10",
          dateLabel: null,
          title: "Q3 2026 earnings",
          type: "earnings",
          impact: "medium",
          detail: "Backlog growth and the Neutron schedule.",
        },
        {
          date: "2026-12-01",
          dateLabel: "Q4 2026",
          title: "Neutron first launch",
          type: "product",
          impact: "high",
          detail: "A successful debut would open medium-lift constellation contracts.",
        },
        {
          date: "2026-12-15",
          dateLabel: "Dec 2026",
          title: "Space Force launch on-ramp awards",
          type: "regulatory",
          impact: "medium",
          detail: "Eligibility for national-security launch task orders.",
        },
      ],
    },
    risks: {
      headline: "Execution on a new vehicle against a dominant incumbent.",
      factors: [
        {
          title: "Neutron schedule and execution",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "Delays or a failed first flight would push out revenue and raise funding needs.",
        },
        {
          title: "Incumbent competition",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "A dominant competitor with reusable heavy-lift vehicles sets aggressive price points.",
        },
        {
          title: "Equity dilution",
          severity: "medium",
          source: "10-Q Q2 2026 · Part I, Item 2",
          summary: "At-the-market programs and convertible notes can dilute shareholders.",
        },
        {
          title: "Government contract dependence",
          severity: "low",
          source: "10-K FY2025 · Item 1A",
          summary: "Awards are subject to budget cycles and procurement timing.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "8-K (Sep 2026)"],
  },

  IONQ: {
    ticker: "IONQ",
    stance: "neutral",
    confidence: 0.46,
    summary:
      "Technical leader in trapped-ion systems with a large cash cushion, but commercial revenue is early and the valuation embeds years of execution.",
    business: {
      overview:
        "Sells access to trapped-ion quantum computers through public clouds and on-premises systems, and has expanded into quantum networking and sensing through acquisitions. Customers are mostly governments, research labs and enterprise R&D teams.",
      segments: [
        { name: "Quantum computing systems & cloud", share: 0.62 },
        { name: "Networking & sensing", share: 0.38 },
      ],
      moatRating: "narrow",
      moatHeadline: "Leading gate fidelities, but the technology race is wide open.",
      advantages: [
        {
          title: "Trapped-ion fidelity",
          detail: "Best-in-class two-qubit gate fidelity supports more useful computations per qubit.",
        },
        {
          title: "Balance-sheet strength",
          detail: "About $1.5B in cash funds several years of R&D and acquisitions.",
        },
        {
          title: "Cloud distribution",
          detail: "Availability on all major clouds lowers the barrier for enterprise experimentation.",
        },
      ],
    },
    catalysts: {
      headline: "Roadmap proof points matter more than near-term revenue.",
      events: [
        {
          date: "2026-11-04",
          dateLabel: null,
          title: "Q3 2026 earnings",
          type: "earnings",
          impact: "medium",
          detail: "Bookings, gross margin and integration of acquisitions.",
        },
        {
          date: "2026-12-10",
          dateLabel: "Dec 2026",
          title: "Next-generation system benchmark",
          type: "product",
          impact: "high",
          detail: "Published algorithmic-qubit results against the stated roadmap.",
        },
        {
          date: "2027-02-01",
          dateLabel: "Q1 2027",
          title: "Government quantum program awards",
          type: "regulatory",
          impact: "medium",
          detail: "Funding decisions for national quantum initiatives.",
        },
      ],
    },
    risks: {
      headline: "Technology and valuation risk are both high.",
      factors: [
        {
          title: "Technology risk",
          severity: "high",
          source: "10-K FY2025 · Item 1A",
          summary: "Rival qubit modalities may reach commercial advantage first, or the market may develop more slowly.",
        },
        {
          title: "Acquisition integration",
          severity: "medium",
          source: "10-Q Q2 2026 · Part II, Item 1A",
          summary: "Rapid M&A adds integration risk and goodwill that could be impaired.",
        },
        {
          title: "Share-price volatility",
          severity: "medium",
          source: "10-K FY2025 · Item 1A",
          summary: "The stock is highly volatile and sensitive to sector sentiment.",
        },
        {
          title: "Customer concentration",
          severity: "low",
          source: "10-K FY2025 · Item 1A",
          summary: "A few government and research customers account for a large share of bookings.",
        },
      ],
    },
    sources: ["10-K FY2025", "10-Q Q2 2026", "Q2 2026 earnings call"],
  },
};

export function getMockReport(ticker: string): AIReport | undefined {
  return REPORTS[ticker];
}
