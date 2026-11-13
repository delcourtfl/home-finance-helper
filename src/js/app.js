import './components/chart.js';
import './components/parameters.js';

import { calculateComparison } from './calculations/comparison.js';

const panel = document.querySelector('bench-parameters');
const chart = document.querySelector('bench-chart');

let errorTimeout;

function showError(message) {
    const banner = document.getElementById("errorBanner");

    banner.textContent = "❌ " + message;
    banner.classList.add("show");

    clearTimeout(errorTimeout);

    errorTimeout = setTimeout(() => {
        // banner.classList.remove("show");
    }, 4000);
}

function hideError() {
    clearTimeout(errorTimeout);
    document.getElementById("errorBanner").classList.remove("show");
}

panel.addEventListener('parameters-change', event => {
    const params = event.detail;
    try {
        const comparison = calculateComparison(params);
        const data = comparison.chartData;
        chart.update(
            data.map(item => item.year),
            data.map(item => item.scenarios),
        );
        hideError();
    } catch (error) {
        showError(error.message);
    }
});
