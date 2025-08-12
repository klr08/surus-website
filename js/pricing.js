// Surus Pricing Calculator (decimal-safe)

function d(value) {
  // Create Decimal from number/string; default to 0 if invalid
  try { return new Decimal(value || 0); } catch { return new Decimal(0); }
}

function calculateSurusFeeMonthly(aum) {
  const a = d(aum);
  const million = d(1000000);
  const aumInMillions = a.div(million);
  if (aumInMillions.lt(1)) return d(0);
  // 125 * (AUM_M)^0.72
  const base = new Decimal(125);
  return base.mul(aumInMillions.pow(0.72));
}

function calculateCompetitorAnnualFees(aum) {
  const a = d(aum);
  return {
    benji: a.mul(0.0015),      // 15 bps annually
    buidl: a.mul(0.005),       // 50 bps annually
    traditional: a.mul(0.0025) // 25 bps typical
  };
}

function formatCurrencyDecimal(decimalAmount, fractionDigits = 0) {
  const value = Number(decimalAmount.toFixed(fractionDigits));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
}

function formatAUM(amount) {
  const a = d(amount);
  const billion = d(1000000000);
  const million = d(1000000);
  const thousand = d(1000);
  if (a.gte(billion)) return '$' + a.div(billion).toFixed(1) + 'B';
  if (a.gte(million)) return '$' + a.div(million).toFixed(1) + 'M';
  if (a.gte(thousand)) return '$' + a.div(thousand).toFixed(0) + 'K';
  return '$' + a.toFixed(0);
}

function getTierName(aum) {
  const a = d(aum);
  if (a.lt(1000000)) return 'Free';
  if (a.lt(5000000)) return 'Builder';
  if (a.lt(25000000)) return 'Starter';
  if (a.lt(100000000)) return 'Growth';
  return 'Enterprise';
}

function updateCalculation() {
  const aumInput = document.getElementById('aum-input');
  const aum = d(parseFloat(aumInput.value));

  document.getElementById('aum-display').textContent = formatAUM(aum);

  const surusMonthly = calculateSurusFeeMonthly(aum);
  const competitors = calculateCompetitorAnnualFees(aum);

  const surusAnnual = surusMonthly.mul(12);
  const benjiAnnual = competitors.benji;
  const buidlAnnual = competitors.buidl;

  const benjiSavings = benjiAnnual.sub(surusAnnual);
  const buidlSavings = buidlAnnual.sub(surusAnnual);

  const hundred = d(100);
  const zero = d(0);
  const benjiPercent = benjiAnnual.gt(zero) ? benjiSavings.div(benjiAnnual).mul(hundred) : hundred;
  const buidlPercent = buidlAnnual.gt(zero) ? buidlSavings.div(buidlAnnual).mul(hundred) : hundred;

  document.getElementById('surus-fee').textContent = formatCurrencyDecimal(surusMonthly, 0);
  document.getElementById('surus-annual').textContent = formatCurrencyDecimal(surusAnnual, 0);
  document.getElementById('tier-name').textContent = getTierName(aum);

  document.getElementById('benji-annual').textContent = formatCurrencyDecimal(benjiAnnual, 0);
  document.getElementById('buidl-annual').textContent = formatCurrencyDecimal(buidlAnnual, 0);

  document.getElementById('benji-savings').textContent = formatCurrencyDecimal(benjiSavings, 0);
  document.getElementById('buidl-savings').textContent = formatCurrencyDecimal(buidlSavings, 0);

  document.getElementById('benji-percent').textContent = `${Number(benjiPercent.toFixed(0))}%`;
  document.getElementById('buidl-percent').textContent = `${Number(buidlPercent.toFixed(0))}%`;

  const effectiveBps = aum.gt(zero) ? surusAnnual.div(aum).mul(10000) : zero;
  document.getElementById('effective-bps').textContent = `${Number(effectiveBps.toFixed(1))} bps`;
}

function scrollToCalculator() {
  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function () {
  updateCalculation();
});
