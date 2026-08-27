import completeAsset from "../assets/ui/Book (1).svg";
import pendingAsset from "../assets/ui/Megaphone.svg";

export function SummaryCard({ label, count, tone }: { label: string; count: number; tone: "complete" | "pending" }) {
  return (
    <article className={`summary-card summary-card--${tone}`}>
      <div className="summary-card__label"><span className="summary-card__icon"><img src={tone === "complete" ? completeAsset : pendingAsset} alt="" aria-hidden="true" /></span>{label}</div>
      <p><strong>{count.toString().padStart(2, "0")}</strong><small>This Week</small></p>
    </article>
  );
}
