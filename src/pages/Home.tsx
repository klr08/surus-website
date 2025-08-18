import React, { useMemo, useState } from 'react';
import Decimal from 'decimal.js';
import HeroSection from '../components/home/HeroSection';
import PricingSection from '../components/home/PricingSection';
import FeaturesSection from '../components/home/FeaturesSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import InsightsSection from '../components/home/InsightsSection';
// CTA Section removed as requested

function d(value: number | string | undefined): Decimal {
  try { return new Decimal(value ?? 0); } catch { return new Decimal(0); }
}

function calculateSurusFeeDaily(aum: Decimal): Decimal {
  const million = d(1_000_000);
  const aumInMillions = aum.div(million);
  if (aumInMillions.lt(1)) return d(0);
  // dailyFee = AUM < 1M ? 0 : 4.167 * Math.pow(AUM/1M, 0.8)
  return new Decimal(4.167).mul(aumInMillions.pow(0.8));
}

function calculateSurusFeeMonthly(aum: Decimal): Decimal {
  return calculateSurusFeeDaily(aum).mul(30); // Approximate monthly fee
}

function formatCurrencyDecimal(amount: Decimal, fractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(amount.toFixed(fractionDigits)));
}

function formatAUM(amount: Decimal): string {
  const billion = d(1_000_000_000);
  const million = d(1_000_000);
  const thousand = d(1_000);
  if (amount.gte(billion)) return '$' + amount.div(billion).toFixed(1) + 'B';
  if (amount.gte(million)) return '$' + amount.div(million).toFixed(1) + 'M';
  if (amount.gte(thousand)) return '$' + amount.div(thousand).toFixed(0) + 'K';
  return '$' + amount.toFixed(0);
}

function getTierName(aum: Decimal): string {
  if (aum.lt(1_000_000)) return 'Free';
  if (aum.lt(5_000_000)) return 'Builder';
  if (aum.lt(25_000_000)) return 'Starter';
  if (aum.lt(100_000_000)) return 'Growth';
  return 'Enterprise';
}

export default function Home(): JSX.Element {
  const [aum, setAum] = useState(5_000_000);
  const a = useMemo(() => d(aum), [aum]);

  const surusDaily = useMemo(() => calculateSurusFeeDaily(a), [a]);
  const surusMonthly = useMemo(() => calculateSurusFeeMonthly(a), [a]);
  const surusAnnual = useMemo(() => surusDaily.mul(365), [surusDaily]);
  const benjiAnnual = useMemo(() => d(aum).mul(0.0015), [aum]);
  const buidlAnnual = useMemo(() => d(aum).mul(0.005), [aum]);
  const benjiSavings = useMemo(() => benjiAnnual.sub(surusAnnual), [benjiAnnual, surusAnnual]);
  const buidlSavings = useMemo(() => buidlAnnual.sub(surusAnnual), [buidlAnnual, surusAnnual]);
  const benjiPercent = useMemo(
    () => (benjiAnnual.gt(0) ? benjiSavings.div(benjiAnnual).mul(100) : d(100)),
    [benjiAnnual, benjiSavings]
  );
  const buidlPercent = useMemo(
    () => (buidlAnnual.gt(0) ? buidlSavings.div(buidlAnnual).mul(100) : d(100)),
    [buidlAnnual, buidlSavings]
  );
  const effectiveBps = useMemo(
    () => (a.gt(0) ? surusAnnual.div(a).mul(10000) : d(0)),
    [a, surusAnnual]
  );

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      <HeroSection onCalculateClick={scrollToPricing} />
      
      <PricingSection
        aum={aum}
        setAum={setAum}
        surusDaily={surusDaily}
        surusMonthly={surusMonthly}
        surusAnnual={surusAnnual}
        tierName={getTierName(a)}
        effectiveBps={effectiveBps}
        formatCurrencyDecimal={formatCurrencyDecimal}
        formatAUM={formatAUM}
      />
      
      <FeaturesSection />
      
      <TestimonialsSection />
      
      <InsightsSection />
    </div>
  );
}