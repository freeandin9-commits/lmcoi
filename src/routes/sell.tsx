import { createFileRoute } from "@tanstack/react-router";
import { TradePanel } from "@/components/lmc/TradePanel";

export const Route = createFileRoute("/sell")({
  component: () => <TradePanel side="sell" />,
  head: () => ({
    meta: [
      { title: "Sell LMC · LM Coin" },
      { name: "description", content: "Sell LMC at live market price." },
    ],
  }),
});
