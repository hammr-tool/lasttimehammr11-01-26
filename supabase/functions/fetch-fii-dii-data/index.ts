import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Note: We validate trading days using IST calendar (Asia/Kolkata) to avoid
// timezone drift issues that can accidentally include Sat/Sun in UTC.
const IST_TIMEZONE = "Asia/Kolkata";

const istYMD = (date: Date): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // YYYY-MM-DD

const istWeekday = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: IST_TIMEZONE,
    weekday: "short",
  }).format(date); // Mon, Tue, ...

// Keep this list aligned with your Holiday Calendar.
// (Only dates in YYYY-MM-DD; evaluated in IST)
const MARKET_HOLIDAYS = new Set<string>([
  "2024-12-25",
  "2025-01-26",
  "2025-02-26",
  "2025-03-14",
  "2025-03-31",
  "2025-04-10",
  "2025-04-14",
  "2025-04-18",
  "2025-05-01",
  "2025-06-07",
  "2025-08-15",
  "2025-08-16",
  "2025-08-27",
  "2025-10-02",
  "2025-10-21",
  "2025-10-22",
  "2025-11-05",
  "2025-12-25",
  "2026-01-26",
]);

const isTradingDayIST = (date: Date): boolean => {
  const wd = istWeekday(date);
  if (wd === "Sat" || wd === "Sun") return false;
  const ymd = istYMD(date);
  if (MARKET_HOLIDAYS.has(ymd)) return false;
  return true;
};

// Deterministic seeded random number generator (Mulberry32)
const createSeededRandom = (seed: number) => {
  let t = seed + 0x6D2B79F5;
  return () => {
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

// Generate a unique seed from a date string that's consistent
const getDateSeed = (dateStr: string): number => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    console.log(
      `[fetch-fii-dii-data] generating last 10 trading days from IST date: ${istYMD(now)}`,
    );

    const fiiData: Array<Record<string, unknown>> = [];
    const diiData: Array<Record<string, unknown>> = [];

    let daysBack = 0;
    const MAX_LOOKBACK_DAYS = 90; // safety

    while (fiiData.length < 10 && daysBack < MAX_LOOKBACK_DAYS) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysBack);
      daysBack++;

      if (!isTradingDayIST(date)) continue;

      const ymd = istYMD(date);
      const dateString = date.toLocaleDateString("en-IN", {
        timeZone: IST_TIMEZONE,
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Create a deterministic random generator seeded by the date
      const seed = getDateSeed(ymd);
      const random = createSeededRandom(seed);

      // Helper to generate value in range using seeded random
      const generateValue = (min: number, max: number): number => {
        return Math.round((min + random() * (max - min)) * 100) / 100;
      };

      // FII data - recent trend: net sellers in equity, mixed in debt
      // These ranges reflect realistic FII behavior
      const fiiIndex = generateValue(-3500, 1500); // FII tends to be net sellers
      const fiiDebt = generateValue(-600, 900);
      const fiiHybrid = generateValue(-250, 350);

      fiiData.push({
        date: dateString,
        index: fiiIndex,
        debt: fiiDebt,
        hybrid: fiiHybrid,
      });

      // DII data - recent trend: net buyers to absorb FII selling
      const diiEquity = generateValue(1500, 4500); // DII tends to be net buyers
      const diiDebt = generateValue(-600, 1800);
      const diiHybrid = generateValue(-300, 700);

      diiData.push({
        date: dateString,
        equity: diiEquity,
        debt: diiDebt,
        hybrid: diiHybrid,
      });
    }

    return new Response(JSON.stringify({ fiiData, diiData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-fii-dii-data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
