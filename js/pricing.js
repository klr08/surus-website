// Surus Pricing Calculator
// Based on continuous pricing formula from strategy documents

function calculateSurusFee(aum) {
    const aumInMillions = aum / 1000000;
    
    // Free up to $1M AUM
    if (aumInMillions < 1) {
        return 0;
    }
    
    // Continuous pricing formula: $125 × (AUM in millions)^0.72
    return 125 * Math.pow(aumInMillions, 0.72);
}

function calculateCompetitorFees(aum) {
    return {
        benji: aum * 0.0015, // 15 bps annually
        buidl: aum * 0.005,  // 50 bps annually
        traditional: aum * 0.0025 // 25 bps typical
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatAUM(amount) {
    if (amount >= 1000000000) {
        return '$' + (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
        return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return '$' + (amount / 1000).toFixed(0) + 'K';
    } else {
        return '$' + amount.toFixed(0);
    }
}

function getTierName(aum) {
    if (aum < 1000000) return "Free";
    if (aum < 5000000) return "Builder";
    if (aum < 25000000) return "Starter"; 
    if (aum < 100000000) return "Growth";
    return "Enterprise";
}

function updateCalculation() {
    const aumInput = document.getElementById('aum-input');
    const aum = parseFloat(aumInput.value);
    
    // Update AUM display
    document.getElementById('aum-display').textContent = formatAUM(aum);
    
    // Calculate fees
    const surusFee = calculateSurusFee(aum);
    const competitors = calculateCompetitorFees(aum);
    
    // Calculate annual fees
    const surusAnnual = surusFee * 12;
    const benjiAnnual = competitors.benji;
    const buildAnnual = competitors.buidl;
    
    // Calculate savings
    const benjiSavings = benjiAnnual - surusAnnual;
    const buildSavings = buildAnnual - surusAnnual;
    
    // Calculate savings percentages
    const benjiSavingsPercent = benjiAnnual > 0 ? (benjiSavings / benjiAnnual * 100) : 100;
    const buildSavingsPercent = buildAnnual > 0 ? (buildSavings / buildAnnual * 100) : 100;
    
    // Update displays
    document.getElementById('surus-fee').textContent = formatCurrency(surusFee);
    document.getElementById('surus-annual').textContent = formatCurrency(surusAnnual);
    document.getElementById('tier-name').textContent = getTierName(aum);
    
    // Update comparison table
    document.getElementById('benji-annual').textContent = formatCurrency(benjiAnnual);
    document.getElementById('buidl-annual').textContent = formatCurrency(buildAnnual);
    
    document.getElementById('benji-savings').textContent = formatCurrency(benjiSavings);
    document.getElementById('buidl-savings').textContent = formatCurrency(buildSavings);
    
    document.getElementById('benji-percent').textContent = benjiSavingsPercent.toFixed(0) + '%';
    document.getElementById('buidl-percent').textContent = buildSavingsPercent.toFixed(0) + '%';
    
    // Update effective basis points
    const effectiveBps = aum > 0 ? (surusAnnual / aum * 10000) : 0;
    document.getElementById('effective-bps').textContent = effectiveBps.toFixed(1) + ' bps';
}

function scrollToCalculator() {
    document.getElementById('pricing').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCalculation();
});
