import { createFileRoute } from "@tanstack/react-router";
import { TradePanel } from "@/components/lmc/TradePanel";

export const Route = createFileRoute("/buy")({
  component: () => <TradePanel side="buy" />,
  head: () => ({
    meta: [
      { title: "Buy LMC · LM Coin" },
      { name: "description", content: "Buy LMC at live market price." },
    ],
  }),
});
