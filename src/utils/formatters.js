/**
 * Standardized INR currency and number formatter for OTT CLV Analytics.
 */

/**
 * Formats a numeric value into INR currency format.
 * @param {number|string} val - The numerical value to format.
 * @param {object} [options] - Options for formatting.
 * @param {boolean} [options.compact=true] - Whether to use compact notation (K, L, Cr).
 * @param {number} [options.decimals=2] - Number of decimal places for compact view.
 * @returns {string} Formatted INR string (e.g. ₹22,709.46, ₹1.25L, ₹19.11Cr).
 */
export function formatINR(val, options = {}) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  const { compact = true, decimals = 2 } = options;

  if (compact) {
    const abs = Math.abs(num);
    if (abs >= 10000000) {
      const formatted = (num / 10000000).toFixed(decimals).replace(/\.00$/, '');
      return `₹${formatted}Cr`;
    }
    if (abs >= 100000) {
      const formatted = (num / 100000).toFixed(decimals).replace(/\.00$/, '');
      return `₹${formatted}L`;
    }
    if (abs >= 1000) {
      const formatted = (num / 1000).toFixed(decimals).replace(/\.00$/, '');
      return `₹${formatted}K`;
    }
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: decimals })}`;
  }

  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? decimals,
  })}`;
}

/**
 * Formats standard numbers with commas for en-IN locale.
 */
export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
