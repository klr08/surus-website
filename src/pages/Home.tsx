import React, { useMemo, useState } from 'react';
import Decimal from 'decimal.js';

function d(value: number | string | undefined): Decimal {
  try { return new Decimal(value ?? 0); } catch { return new Decimal(0); }
}

function calculateSurusFeeMonthly(aum: Decimal): Decimal {
  const million = d(1_000_000);
  const aumInMillions = aum.div(million);
  if (aumInMillions.lt(1)) return d(0);
  return new Decimal(125).mul(aumInMillions.pow(0.72));
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

  const surusMonthly = useMemo(() => calculateSurusFeeMonthly(a), [a]);
  const surusAnnual = useMemo(() => surusMonthly.mul(12), [surusMonthly]);
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

  return (
    <>
      <section id="hero">
        <h1>You Build the DeFi. We'll Handle the TradFi.</h1>
        <p>Surus is an institutional-grade asset management, custody, and compliance platform for the future of finance.</p>
        <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
          Calculate Your Savings
        </button>
      </section>

      <section id="pricing">
        <div className="pricing-container">
          <h2>Pricing that scales with you</h2>
          <p className="pricing-subtitle">Free up to $1M AUM. Always cheaper than BENJI, BUIDL, and traditional custody.</p>

          <div className="calculator-card">
            <div className="calculator-input">
              <label htmlFor="aum-input">Treasury Size (AUM):</label>
              <input
                id="aum-input"
                type="range"
                min={100000}
                max={1000000000}
                step={100000}
                value={aum}
                onChange={(e) => setAum(Number(e.target.value))}
              />
              <div className="aum-display">
                <span id="aum-display">{formatAUM(a)}</span>
              </div>
            </div>

            <div className="results-section">
              <div className="surus-result">
                <h3>Your Surus Pricing</h3>
                <div className="tier-badge">
                  <span id="tier-name">{getTierName(a)}</span> Tier
                </div>
                <div className="fee-display">
                  <div className="monthly-fee">
                    <span className="fee-amount" id="surus-fee">{formatCurrencyDecimal(surusMonthly, 0)}</span>
                    <span className="fee-period">/month</span>
                  </div>
                  <div className="annual-fee">
                    <span id="surus-annual">{formatCurrencyDecimal(surusAnnual, 0)}</span> /year
                  </div>
                  <div className="effective-rate">
                    Effective rate:{' '}
                    <span id="effective-bps">
                      {Number((a.gt(0) ? surusAnnual.div(a).mul(10000) : d(0)).toFixed(1))} bps
                    </span>
                  </div>
                </div>
              </div>

              <div className="comparison-section">
                <h3>Compare Your Savings</h3>
                <div className="comparison-table">
                  <div className="comparison-row header">
                    <span>Provider</span>
                    <span>Annual Cost</span>
                    <span>You Save</span>
                    <span>% Savings</span>
                  </div>
                  <div className="comparison-row surus-row">
                    <span className="provider-name">Surus</span>
                    <span id="surus-annual-compare">{formatCurrencyDecimal(surusAnnual, 0)}</span>
                    <span className="savings-amount">—</span>
                    <span className="savings-percent">—</span>
                  </div>
                  <div className="comparison-row competitor-row">
                    <span className="provider-name">BENJI (15 bps)</span>
                    <span id="benji-annual">{formatCurrencyDecimal(benjiAnnual, 0)}</span>
                    <span className="savings-amount positive" id="benji-savings">{formatCurrencyDecimal(benjiSavings, 0)}</span>
                    <span className="savings-percent positive" id="benji-percent">{Number(benjiPercent.toFixed(0))}%</span>
                  </div>
                  <div className="comparison-row competitor-row">
                    <span className="provider-name">BUIDL (50 bps)</span>
                    <span id="buidl-annual">{formatCurrencyDecimal(buidlAnnual, 0)}</span>
                    <span className="savings-amount positive" id="buidl-savings">{formatCurrencyDecimal(buidlSavings, 0)}</span>
                    <span className="savings-percent positive" id="buidl-percent">{Number(buidlPercent.toFixed(0))}%</span>
                  </div>
                </div>
              </div>

              <div className="cta-section">
                <a className="cta-button" href="#contact">Calculate My Custom Quote</a>
                <p className="cta-subtitle">• No minimums • No lock-ups • Transparent pricing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <h2>What We Do</h2>
        <p>Surus powers onchain finance by providing builders with regulated infrastructure that bridges traditional and digital assets.</p>
      </section>

      <section id="contact">
        <h2>Get in Touch</h2>
        <p>Let's talk about how Surus can support your business</p>
        <p>Email: hello@surus.io</p>
      </section>
    </>
  );
}


