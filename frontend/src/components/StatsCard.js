function StatsCard({ label, value, meta }) {
  return (
    <article className="stats-card">
      <p>{label}</p>
      <strong>{value}</strong>
      {meta && <span>{meta}</span>}
    </article>
  );
}

export default StatsCard;
