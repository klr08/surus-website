import React from 'react';
import Decimal from 'decimal.js';

interface PricingSectionProps {
  aum: number;
  setAum: (value: number) => void;
  surusDaily: Decimal;
  surusMonthly: Decimal;
  surusAnnual: Decimal;
  tierName: string;
  effectiveBps: Decimal;
  benjiAnnual: Decimal;
  buidlAnnual: Decimal;
  benjiSavings: Decimal;
  buidlSavings: Decimal;
  benjiPercent: Decimal;
  buidlPercent: Decimal;
  formatCurrencyDecimal: (amount: Decimal, fractionDigits?: number) => string;
  formatAUM: (amount: Decimal) => string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  aum,
  setAum,
  surusDaily,
  surusMonthly,
  surusAnnual,
  tierName,
  effectiveBps,
  benjiAnnual,
  buidlAnnual,
  benjiSavings,
  buidlSavings,
  benjiPercent,
  buidlPercent,
  formatCurrencyDecimal,
  formatAUM
}) => {
  const aumDecimal = new Decimal(aum);
  
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2>On-demand pricing for treasury infrastructure</h2>
          <p className="pricing-subtitle">Free to $1M, then starting at $0.04 per $10K daily</p>
          <p className="pricing-description">
            We custody and manage the traditional assets backing your tokens. Your compliance is our priority.
          </p>
        </div>
        
        <div className="pricing-calculator">
          <div className="calculator-input">
            <label htmlFor="aum-input">TREASURY SIZE (AUM):</label>
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
              <span>{formatAUM(aumDecimal)}</span>
            </div>
          </div>
          
          <div className="pricing-comparison">
            <div className="pricing-column">
              <div className="pricing-tier">
                <h3>AT SURUS FEE:</h3>
                              <div className="price">
                <span className="price-amount">${surusDaily.toFixed(2)}/day</span>
                <span className="price-monthly">${surusMonthly.toFixed(0)}/mo</span>
                <span className="price-annual">${surusAnnual.toFixed(0)}/yr</span>
              </div>
              </div>
            </div>
            
            <div className="pricing-column">
              <div className="pricing-tier">
                <h3>AT BENJI FEE:</h3>
                <div className="price">
                  <span className="price-amount">${benjiAnnual.div(12).toFixed(0)}/mo</span>
                  <span className="price-annual">${benjiAnnual.toFixed(0)}/yr</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pricing-cta">
            <button className="calculate-button">CALCULATE YOUR SAVINGS</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
