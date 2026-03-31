export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="neo-card mx-auto max-w-xl p-10 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-accent" />
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted">{message}</p>
    </div>
  );
}

