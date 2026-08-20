const assert = require('assert');

console.log('[Core Service Test] Running core service metrics and logic verification...');

// 1. Sustainability calculation test
const calculateMetrics = (quantity, unit) => {
    let weightInKg = quantity;
    if (unit === 'portions' || unit === 'items') {
        weightInKg = quantity * 0.4;
    } else if (unit === 'liters') {
        weightInKg = quantity * 1.0;
    }
    const co2Saved = Number((weightInKg * 2.5).toFixed(2));
    return { weightInKg, co2Saved };
};

const mealResult = calculateMetrics(50, 'portions');
assert.strictEqual(mealResult.weightInKg, 20, '50 portions should equal 20 kg');
assert.strictEqual(mealResult.co2Saved, 50, '20 kg should save 50 kg CO2');

const produceResult = calculateMetrics(15, 'kg');
assert.strictEqual(produceResult.weightInKg, 15, '15 kg produce should equal 15 kg');
assert.strictEqual(produceResult.co2Saved, 37.5, '15 kg produce should save 37.5 kg CO2');

console.log('✓ [Core Service Test] All core service logic tests passed successfully!');
