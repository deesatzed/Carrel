export type DeskOccupancy = {
  packet: { source: "demo" | "paste" } | null;
  turnCount: number;
  keepCount: number;
  receiptCount: number;
};

export type SitWithDemoIntent = "load-demo" | "open-desk" | "confirm-replace";

export function mustConfirmReplace(input: DeskOccupancy): boolean {
  if (!input.packet) return false;
  if (input.packet.source === "paste") return true;
  return input.turnCount > 0 || input.keepCount > 0 || input.receiptCount > 0;
}

export function sitWithDemoIntent(input: DeskOccupancy): SitWithDemoIntent {
  if (!input.packet) return "load-demo";
  if (mustConfirmReplace(input)) return "confirm-replace";
  return "open-desk";
}

export function mustConfirmClear(input: { packet: { source: "demo" | "paste" } | null }): boolean {
  return input.packet !== null;
}
