import { createFileRoute } from "@tanstack/react-router";
import { TradePanel } from "@/components/lmc/TradePanel";

export const Route = createFileRoute("/sell")({
  component: () => <TradePanel side="sell" />,
  head: () => ({
    meta: [
      { title: "Sell LMC · LM Coin" },
      { name: "description", content: "Sell LMC at fixed rate (1 INR = 1.25 LMC)." },
    ],
  }),
});
