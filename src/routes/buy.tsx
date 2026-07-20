import { createFileRoute } from "@tanstack/react-router";
import { TradePanel } from "@/components/lmc/TradePanel";

export const Route = createFileRoute("/buy")({
  component: () => <TradePanel side="buy" />,
  head: () => ({
    meta: [
      { title: "Buy LMC · LM Coin" },
      { name: "description", content: "Buy LMC at fixed rate (1 INR = 1.25 LMC)." },
    ],
  }),
});
