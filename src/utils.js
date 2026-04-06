export const getDaysLeft = (expiry) =>
  Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));

export const getExpiryColor = (expiry) => {
  const days = Math.ceil(
    (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 7) return "var(--accent-red)";
  if (days <= 30) return "var(--accent-amber)";
  return "var(--accent-green)";
};
