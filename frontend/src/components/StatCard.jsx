export default function StatCard({ label, value, accent = "text-ink" }) {
  return (
    <div className="neo-card-soft p-5">
      <p className="muted text-sm font-semibold uppercase tracking-[0.18em]">{label}</p>
      <p className={`mt-3 text-3xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}

