// Accepts only our own uploaded photos (/api/uploads/12) or normal https links
export const cleanImg = (v) => {
  const s = String(v || '').trim();
  if (/^\/api\/uploads\/\d+$/.test(s)) return s;
  if (/^https?:\/\/[^\s]+$/i.test(s)) return s.slice(0, 600);
  return '';
};
