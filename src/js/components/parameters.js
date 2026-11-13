import { BaseComponent } from './base-component.js';

class BenchParameters extends BaseComponent {
	TEMPLATE_PATH = './src/templates/parameters.html';

	async connectedCallback() {
		await super.connectedCallback();

		this.initializeInputs();

		this.initializeEvents();
		this.dispatchParametersChange();
	}

	initializeEvents() {
		this.querySelectorAll('input').forEach(input => {
			input.addEventListener('input', () => {
				this.dispatchParametersChange();
			});
		});
	}

	dispatchParametersChange() {
		this.dispatchEvent(new CustomEvent('parameters-change', {
			bubbles: true,
			composed: true,
			detail: this.getValues()
		}));
	}

	getValues() {
		const root = this;
		const ids = [
			// Property
			'housePrice',
			'houseAppreciation',
			'maintenanceCosts',
			// Financing
			'loanAmount',
			'annualRate',
			'durationYears',
			// Renting
			'rent',
			'rentInflation',
			// Investing
			'initialSavings',
			'investmentReturn',
			// Simulation
			'comparisonYears',
			'buyYear',
		];

		return Object.fromEntries(
			ids.map(id => [
				id,
				Number(
					root.querySelector(
						`#${id} input[type="number"]`
					).value
				)
			])
		);
	}
	initializeInputs() {
		const settings = {
			euro: {
				min: 0,
				step: 10_000,
				max: 1_500_000
			},
			low_euro: {
				min: 0,
				step: 100,
				max: 10_000
			},
			percentage: {
				min: 0,
				max: 100,
				step: 1
			},
			low_percentage: {
				min: 0,
				max: 30,
				step: 0.1
			},
			year: {
				min: 1,
				max: 100,
				step: 1
			},
		};

		this.querySelectorAll('input[type="number"]').forEach(input => {
			const config = settings[input.dataset.type];
			if (!config) return;
			Object.entries(config).forEach(([key, value]) => {
				input[key] = value;
			});
			const range = input.parentElement.querySelector('input[type="range"]');
    		if (!range) return;
			Object.entries(config).forEach(([key, value]) => {
				range[key] = value;
			});

			input.addEventListener('input', () => {
				range.value = input.value;
			});
			range.addEventListener('input', () => {
				input.value = range.value;
			});
		});
	}
}

customElements.define('bench-parameters', BenchParameters);
