/**
 * Calculates Gestational Age and Estimated Due Date (EDD)
 * using Naegele's Rule (LMP + 280 days).
 */
export function calculatePregnancy(lmpDateStr) {
  if (!lmpDateStr) return null;

  const lmp = new Date(lmpDateStr);
  if (isNaN(lmp.getTime())) return null;

  const today = new Date();
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  
  const diffDays = Math.floor((today - lmp) / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || diffDays > 310) {
    return {
      isValid: false,
      eddFormatted: edd.toLocaleDateString('ar-SY')
    };
  }

  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;

  return {
    isValid: true,
    weeks,
    days,
    summary: `${weeks} أسبوع و ${days} يوم`,
    eddFormatted: edd.toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' })
  };
}

export function formatGPA(g, vd, cs, a) {
  const totalP = (parseInt(vd) || 0) + (parseInt(cs) || 0);
  return `G${g || 0} P${totalP} A${a || 0}`;
}
