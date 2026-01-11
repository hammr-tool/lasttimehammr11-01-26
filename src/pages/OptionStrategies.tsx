import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  LineChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PayoffChart } from "@/components/PayoffChart";

type StrategyType = "all" | "bullish" | "bearish" | "neutral";

interface StrategyLeg {
  action: "Buy" | "Sell";
  type: "Call" | "Put";
  strike: number;
  premium: number;
}

interface StrategyExample {
  stockPrice: number;
  legs: StrategyLeg[];
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
}

interface Strategy {
  name: string;
  type: "bullish" | "bearish" | "neutral";
  description: string;
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  complexity: "beginner" | "intermediate" | "advanced";
  legs: number;
  detailedExplanation: string;
  whenToUse: string;
  example: StrategyExample;
  tips: string[];
  risks: string[];
}

const strategies: Strategy[] = [
  // Bullish Strategies
  {
    name: "Long Call",
    type: "bullish",
    description: "Buy a call option expecting the underlying to rise significantly.",
    maxProfit: "Unlimited",
    maxLoss: "Limited (premium paid)",
    breakeven: "Strike price + premium",
    complexity: "beginner",
    legs: 1,
    detailedExplanation: "A Long Call is the simplest bullish options strategy. You buy a call option, giving you the right (not obligation) to buy the stock at the strike price before expiration. You profit when the stock rises above the strike price plus the premium paid. This is ideal for beginners as it has limited risk (only the premium paid) with unlimited upside potential.",
    whenToUse: "Use when you are strongly bullish on a stock and expect significant upward movement before expiration. Best when implied volatility is low (options are cheaper). Ideal before expected positive news, earnings surprises, or breakouts.",
    example: {
      stockPrice: 23500,
      legs: [{ action: "Buy", type: "Call", strike: 23500, premium: 150 }],
      maxProfit: "Unlimited (Stock Price - Strike - Premium)",
      maxLoss: "₹150 × Lot Size (Premium Paid)",
      breakeven: "23650 (Strike 23500 + Premium 150)",
    },
    tips: [
      "Choose strike prices based on your price target - ATM for higher probability, OTM for higher reward",
      "Consider time decay - options lose value as expiration approaches, so give yourself enough time",
      "Higher implied volatility = more expensive premiums, so buy when IV is relatively low",
      "Set a stop loss at 50% of premium to limit losses if trade goes against you",
    ],
    risks: [
      "100% loss of premium if stock doesn't rise above breakeven by expiration",
      "Time decay (theta) works against you every day",
      "Volatility crush after events can reduce option value even if stock moves in your direction",
    ],
  },
  {
    name: "Bull Call Spread",
    type: "bullish",
    description: "Buy a call at lower strike and sell a call at higher strike. Limited risk and reward.",
    maxProfit: "Limited (difference between strikes - net premium)",
    maxLoss: "Limited (net premium paid)",
    breakeven: "Lower strike + net premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Bull Call Spread involves buying a call at a lower strike and selling a call at a higher strike with the same expiration. The sold call reduces your cost but caps your profit. It's a cost-effective way to bet on moderate upside while defining your maximum risk upfront.",
    whenToUse: "Use when you're moderately bullish and have a specific price target. Great when you want to reduce the cost of buying calls outright. Best in moderate to high IV environments as you benefit from selling an option.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Call", strike: 23500, premium: 150 },
        { action: "Sell", type: "Call", strike: 23700, premium: 70 },
      ],
      maxProfit: "₹120 × Lot Size (Spread 200 - Net Debit 80)",
      maxLoss: "₹80 × Lot Size (Net Debit: 150 - 70)",
      breakeven: "23580 (Lower Strike + Net Debit)",
    },
    tips: [
      "Choose strike width based on expected move - wider spreads = more profit potential but higher cost",
      "Sell the call at your target price level or just above resistance",
      "Best entered when IV is moderate to high for better premium on the sold leg",
      "Consider closing at 50-75% of max profit to lock in gains",
    ],
    risks: [
      "Profit is capped at the upper strike - you won't benefit from moves above it",
      "Both options expire worthless if stock falls below lower strike",
      "Assignment risk on short call if ITM near expiration (early assignment rare but possible)",
    ],
  },
  {
    name: "Long Put",
    type: "bearish",
    description: "Buy a put option expecting the underlying to fall significantly.",
    maxProfit: "Substantial (strike price - premium)",
    maxLoss: "Limited (premium paid)",
    breakeven: "Strike price - premium",
    complexity: "beginner",
    legs: 1,
    detailedExplanation: "A Long Put gives you the right to sell the stock at the strike price before expiration. You profit when the stock falls below the strike price minus the premium paid. It's like insurance against a stock decline and is the simplest bearish strategy.",
    whenToUse: "Use when strongly bearish on a stock or want to hedge your long stock positions. Best when implied volatility is low (puts are cheaper). Ideal before expected negative news or technical breakdowns.",
    example: {
      stockPrice: 23500,
      legs: [{ action: "Buy", type: "Put", strike: 23500, premium: 140 }],
      maxProfit: "₹23,360 × Lot Size (if stock goes to 0)",
      maxLoss: "₹140 × Lot Size (Premium Paid)",
      breakeven: "23360 (Strike 23500 - Premium 140)",
    },
    tips: [
      "Great for portfolio protection during uncertain times",
      "Buy puts when IV is low for cheaper protection",
      "Consider longer expiration for more time to be right on direction",
      "ATM puts have higher delta and move more with the stock",
    ],
    risks: [
      "100% loss of premium if stock doesn't fall enough by expiration",
      "Time decay accelerates significantly near expiration",
      "Stock can remain flat, causing total loss of premium",
    ],
  },
  {
    name: "Iron Condor",
    type: "neutral",
    description: "Sell OTM call and put spreads. Profits when price stays in range.",
    maxProfit: "Limited (net premium received)",
    maxLoss: "Limited (width of wider spread - net premium)",
    breakeven: "Two breakeven points within the wings",
    complexity: "advanced",
    legs: 4,
    detailedExplanation: "An Iron Condor combines a Bull Put Spread and a Bear Call Spread. You sell options on both sides, collecting premium and betting the stock will stay within a range. It profits from time decay and low volatility. This is the most popular income-generating options strategy.",
    whenToUse: "Use when you expect low volatility and the stock to stay in a range. Best after high IV events (like earnings) when premium is rich and you expect volatility to decrease.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Put", strike: 23100, premium: 25 },
        { action: "Sell", type: "Put", strike: 23200, premium: 45 },
        { action: "Sell", type: "Call", strike: 23800, premium: 40 },
        { action: "Buy", type: "Call", strike: 23900, premium: 20 },
      ],
      maxProfit: "₹40 × Lot Size (Net Credit: 45+40-25-20)",
      maxLoss: "₹60 × Lot Size (Spread 100 - Credit 40)",
      breakeven: "23160 (put side) and 23840 (call side)",
    },
    tips: [
      "Enter when IV rank is high (>50%) for better premium",
      "Manage at 50% profit to lock in gains and reduce risk",
      "Keep width of spreads equal for balanced risk on both sides",
      "Choose expiration 30-45 days out for optimal theta decay",
    ],
    risks: [
      "Large moves in either direction cause max loss",
      "Requires active management as price approaches short strikes",
      "Gap moves can cause significant losses beyond breakevens",
    ],
  },
  {
    name: "Long Straddle",
    type: "neutral",
    description: "Buy ATM call and put. Profits from large moves in either direction.",
    maxProfit: "Unlimited",
    maxLoss: "Limited (total premium paid)",
    breakeven: "Strike ± total premium",
    complexity: "intermediate",
    legs: 2,
    detailedExplanation: "A Long Straddle involves buying both a call and put at the same ATM strike price and expiration. You profit from large moves in either direction. The stock needs to move enough to cover the cost of both options. It's a volatility play - you're betting on movement, not direction.",
    whenToUse: "Use before major events like earnings, FDA approvals, election results, or other catalysts when you expect a big move but are unsure of direction. Best when IV is low relative to expected movement.",
    example: {
      stockPrice: 23500,
      legs: [
        { action: "Buy", type: "Call", strike: 23500, premium: 150 },
        { action: "Buy", type: "Put", strike: 23500, premium: 140 },
      ],
      maxProfit: "Unlimited (on upside) / Substantial (on downside)",
      maxLoss: "₹290 × Lot Size (Total Premium: 150 + 140)",
      breakeven: "23210 (down) and 23790 (up)",
    },
    tips: [
      "Buy when IV is low and expected to spike (before events)",
      "Close before expiration to salvage remaining time value",
      "Look for stocks with upcoming catalysts that could move price significantly",
      "Consider closing one leg if a strong directional move occurs",
    ],
    risks: [
      "Very expensive strategy - requires large move to profit",
      "Time decay hurts both legs every day",
      "IV crush after events can cause losses even if stock moves",
    ],
  },
  {
    name: "Covered Call",
    type: "neutral",
    description: "Own the stock and sell a call option against it for income.",
    maxProfit: "Limited (strike - stock price + premium)",
    maxLoss: "Substantial (stock can go to zero)",
    breakeven: "Stock price - premium received",
    complexity: "beginner",
    legs: 1,
    detailedExplanation: "A Covered Call involves owning shares of stock and selling a call option against them. You collect premium income while holding the stock. If the stock rises above the strike, your shares get called away at the strike price. It's a conservative income-generating strategy.",
    whenToUse: "Use when you own stock and are willing to sell at a higher price. Great for generating income in sideways or slightly bullish markets. Ideal for long-term holdings where you want to reduce cost basis.",
    example: {
      stockPrice: 23500,
      legs: [{ action: "Sell", type: "Call", strike: 23700, premium: 70 }],
      maxProfit: "₹270 × Lot Size (Strike 23700 - Stock 23500 + Premium 70)",
      maxLoss: "₹23,430 × Lot Size (if stock goes to 0, reduced by premium)",
      breakeven: "23430 (Stock Price - Premium)",
    },
    tips: [
      "Sell calls at resistance levels where you'd be happy to sell",
      "Choose expiration 30-45 days out for optimal theta decay",
      "Be prepared to have shares called away if stock rallies",
      "Roll the call if you want to keep the shares",
    ],
    risks: [
      "Caps upside potential - you miss gains above strike",
      "Still exposed to full downside stock risk",
      "May miss large rallies by having shares called away",
    ],
  },
];

const OptionStrategies = () => {
  const location = useLocation();
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<StrategyType>("all");
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    if (location.hash === "#calculator") {
      setShowCalculator(true);
      setTimeout(() => {
        calculatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash]);

  const [calcInputs, setCalcInputs] = useState({
    stockPrice: "",
    strike1: "",
    premium1: "",
    action1: "Buy" as "Buy" | "Sell",
    type1: "Call" as "Call" | "Put",
    strike2: "",
    premium2: "",
    action2: "Sell" as "Buy" | "Sell",
    type2: "Call" as "Call" | "Put",
    lotSize: "75",
  });

  const filteredStrategies = strategies.filter(
    (strategy) => filter === "all" || strategy.type === filter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bullish":
        return <TrendingUp className="h-3 w-3" />;
      case "bearish":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "bullish":
        return "bg-success/20 text-success border-success/30";
      case "bearish":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-secondary/50 text-secondary-foreground border-secondary";
    }
  };

  const getComplexityBadgeClass = (complexity: string) => {
    switch (complexity) {
      case "beginner":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "intermediate":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-secondary/50 text-secondary-foreground";
    }
  };

  const calculateResults = () => {
    const strike1 = parseFloat(calcInputs.strike1) || 0;
    const premium1 = parseFloat(calcInputs.premium1) || 0;
    const strike2 = parseFloat(calcInputs.strike2) || 0;
    const premium2 = parseFloat(calcInputs.premium2) || 0;
    const lotSize = parseFloat(calcInputs.lotSize) || 1;

    let netCost = 0;
    netCost += calcInputs.action1 === "Buy" ? premium1 : -premium1;
    if (strike2 && premium2) {
      netCost += calcInputs.action2 === "Buy" ? premium2 : -premium2;
    }

    const spreadWidth = Math.abs(strike2 - strike1);

    let maxProfit = 0;
    let maxLoss = 0;
    let breakeven = 0;

    if (netCost > 0) {
      maxLoss = netCost;
      maxProfit = spreadWidth - netCost;
      breakeven = strike1 + netCost;
    } else {
      maxProfit = Math.abs(netCost);
      maxLoss = spreadWidth - Math.abs(netCost);
      breakeven = strike1 + netCost;
    }

    return {
      netCost: (netCost * lotSize).toFixed(2),
      maxProfit: (maxProfit * lotSize).toFixed(2),
      maxLoss: (maxLoss * lotSize).toFixed(2),
      breakeven: breakeven.toFixed(2),
      isCredit: netCost < 0,
    };
  };

  const calcResults = calculateResults();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg md:text-xl font-bold">Option Strategies</h1>
        </div>

        <Card ref={calculatorRef} id="calculator" className="border-success/30 bg-calculator-bg">
          <div className="p-3">
            <Button
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full bg-gradient-to-r from-success/80 to-success hover:from-success hover:to-success/80 text-white"
              size="sm"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Strategy Calculator
              {showCalculator ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </Button>

            {showCalculator && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Price</Label>
                    <Input
                      type="number"
                      placeholder="23500"
                      value={calcInputs.stockPrice}
                      onChange={(e) => setCalcInputs({ ...calcInputs, stockPrice: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Lot Size</Label>
                    <Input
                      type="number"
                      placeholder="75"
                      value={calcInputs.lotSize}
                      onChange={(e) => setCalcInputs({ ...calcInputs, lotSize: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-xs font-medium">Leg 1</p>
                  <div className="grid grid-cols-4 gap-2">
                    <select
                      value={calcInputs.action1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, action1: e.target.value as "Buy" | "Sell" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Buy">Buy</option>
                      <option value="Sell">Sell</option>
                    </select>
                    <select
                      value={calcInputs.type1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, type1: e.target.value as "Call" | "Put" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Call">Call</option>
                      <option value="Put">Put</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Strike"
                      value={calcInputs.strike1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, strike1: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Premium"
                      value={calcInputs.premium1}
                      onChange={(e) => setCalcInputs({ ...calcInputs, premium1: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <p className="text-xs font-medium">Leg 2 (Optional)</p>
                  <div className="grid grid-cols-4 gap-2">
                    <select
                      value={calcInputs.action2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, action2: e.target.value as "Buy" | "Sell" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Buy">Buy</option>
                      <option value="Sell">Sell</option>
                    </select>
                    <select
                      value={calcInputs.type2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, type2: e.target.value as "Call" | "Put" })}
                      className="h-8 text-xs rounded border bg-background px-2"
                    >
                      <option value="Call">Call</option>
                      <option value="Put">Put</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Strike"
                      value={calcInputs.strike2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, strike2: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Premium"
                      value={calcInputs.premium2}
                      onChange={(e) => setCalcInputs({ ...calcInputs, premium2: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {calcInputs.strike1 && calcInputs.premium1 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-border/50">
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {calcResults.isCredit ? "Net Credit" : "Net Debit"}
                      </p>
                      <p className={`text-sm font-bold ${calcResults.isCredit ? "text-success" : "text-amber-400"}`}>
                        ₹{Math.abs(parseFloat(calcResults.netCost)).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Max Profit</p>
                      <p className="text-sm font-bold text-success">₹{calcResults.maxProfit}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Max Loss</p>
                      <p className="text-sm font-bold text-destructive">₹{calcResults.maxLoss}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Breakeven</p>
                      <p className="text-sm font-bold text-blue-400">₹{calcResults.breakeven}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs whitespace-nowrap"
          >
            All Strategies
          </Button>
          <Button
            variant={filter === "bullish" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("bullish")}
            className="text-xs whitespace-nowrap gap-1"
          >
            <TrendingUp className="h-3 w-3" />
            Bullish
          </Button>
          <Button
            variant={filter === "bearish" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("bearish")}
            className="text-xs whitespace-nowrap gap-1"
          >
            <TrendingDown className="h-3 w-3" />
            Bearish
          </Button>
          <Button
            variant={filter === "neutral" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("neutral")}
            className="text-xs whitespace-nowrap gap-1"
          >
            <Minus className="h-3 w-3" />
            Neutral
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStrategies.map((strategy) => (
            <Card
              key={strategy.name}
              className="p-3 space-y-2 cursor-pointer hover:border-success/50 transition-colors"
              onClick={() => setSelectedStrategy(strategy)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{strategy.name}</h3>
                <div className="flex gap-1 flex-wrap justify-end">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 gap-1 ${getTypeBadgeClass(strategy.type)}`}
                  >
                    {getTypeIcon(strategy.type)}
                    {strategy.type.charAt(0).toUpperCase() + strategy.type.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 ${getComplexityBadgeClass(strategy.complexity)}`}
                  >
                    {strategy.complexity}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {strategy.description}
              </p>

              <div className="space-y-1 pt-1 border-t">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Legs:</span>
                  <span className="font-medium">{strategy.legs}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Max Profit:</span>
                  <span className="text-success font-medium">{strategy.maxProfit}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Max Loss:</span>
                  <span className="text-destructive font-medium">{strategy.maxLoss}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                <BookOpen className="w-3 h-3" />
                <span>Tap for detailed explanation</span>
              </div>
            </Card>
          ))}
        </div>

        {filteredStrategies.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No strategies found for the selected filter.
            </p>
          </Card>
        )}
      </main>

      <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStrategy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap text-lg">
                  <span>{selectedStrategy.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 gap-1 ${getTypeBadgeClass(selectedStrategy.type)}`}
                  >
                    {getTypeIcon(selectedStrategy.type)}
                    {selectedStrategy.type.charAt(0).toUpperCase() + selectedStrategy.type.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 ${getComplexityBadgeClass(selectedStrategy.complexity)}`}
                  >
                    {selectedStrategy.complexity}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-3">
                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    What is {selectedStrategy.name}?
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedStrategy.detailedExplanation}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <Target className="w-4 h-4 text-success" />
                    When to Use This Strategy
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedStrategy.whenToUse}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-3">
                    <LineChart className="w-4 h-4 text-primary" />
                    Payoff Diagram
                  </h4>
                  <PayoffChart
                    stockPrice={selectedStrategy.example.stockPrice}
                    legs={selectedStrategy.example.legs}
                    lotSize={75}
                  />
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-3">
                    📊 Example (Current Price: ₹{selectedStrategy.example.stockPrice})
                  </h4>

                  <div className="space-y-2 mb-3">
                    {selectedStrategy.example.legs.map((leg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded text-xs ${
                          leg.action === "Buy"
                            ? "bg-success/10 border border-success/30"
                            : "bg-destructive/10 border border-destructive/30"
                        }`}
                      >
                        <span className="font-medium">
                          {leg.action} {leg.type} @ ₹{leg.strike}
                        </span>
                        <span className={leg.action === "Buy" ? "text-destructive" : "text-success"}>
                          {leg.action === "Buy" ? "-" : "+"}₹{leg.premium}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-background/50 rounded p-2">
                      <p className="text-[10px] text-muted-foreground">Max Profit</p>
                      <p className="text-xs font-semibold text-success">{selectedStrategy.example.maxProfit}</p>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <p className="text-[10px] text-muted-foreground">Max Loss</p>
                      <p className="text-xs font-semibold text-destructive">{selectedStrategy.example.maxLoss}</p>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <p className="text-[10px] text-muted-foreground">Breakeven</p>
                      <p className="text-xs font-semibold text-blue-400">{selectedStrategy.example.breakeven}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedStrategy.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-success mt-0.5">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Key Risks to Watch
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedStrategy.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-destructive mt-0.5">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                  <div className="text-center p-2 bg-muted/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Legs Required</p>
                    <p className="text-lg font-bold">{selectedStrategy.legs}</p>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Skill Level</p>
                    <p className="text-sm font-bold capitalize">{selectedStrategy.complexity}</p>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Market View</p>
                    <p className="text-sm font-bold capitalize">{selectedStrategy.type}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OptionStrategies;
