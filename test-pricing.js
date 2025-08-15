// Test the pricing formula: dailyFee = AUM < 1M ? 0 : 4.167 * Math.pow(AUM/1M, 0.8)

function calculateDailyFee(aum) {
  const million = 1_000_000;
  if (aum < million) return 0;
  return 4.167 * Math.pow(aum / million, 0.8);
}

// Test with different AUM values
const testValues = [
  500_000,      // $500K - should be free
  1_000_000,    // $1M - should be the minimum fee
  5_000_000,    // $5M
  10_000_000,   // $10M
  50_000_000,   // $50M
  100_000_000,  // $100M
  1_000_000_000 // $1B
];

console.log('AUM\t\tDaily Fee\tMonthly Fee\tAnnual Fee\tEffective bps');
console.log('-------------------------------------------------------------------');

testValues.forEach(aum => {
  const dailyFee = calculateDailyFee(aum);
  const monthlyFee = dailyFee * 30;
  const annualFee = dailyFee * 365;
  const effectiveBps = (annualFee / aum) * 10000;
  
  console.log(
    `$${(aum / 1_000_000).toFixed(1)}M\t$${dailyFee.toFixed(2)}/day\t$${monthlyFee.toFixed(0)}/mo\t$${annualFee.toFixed(0)}/yr\t${effectiveBps.toFixed(1)} bps`
  );
});
