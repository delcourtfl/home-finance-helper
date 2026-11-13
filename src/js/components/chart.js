import { BaseComponent } from './base-component.js';

class BenchChart extends BaseComponent {
    TEMPLATE_PATH = './src/templates/chart.html';

    async connectedCallback() {
        await super.connectedCallback();

        this.initializeChart();
    }

    initializeChart() {
        const canvas = this.querySelector('canvas');

        const style = getComputedStyle(document.body);
        Chart.defaults.font.family = style.fontFamily;
        Chart.defaults.font.size = parseFloat(style.fontSize) * 0.8;
        Chart.defaults.color = style.color;
        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Buyer',
                        data: [],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'Renter',
                        data: [],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'Timed',
                        data: [],
                        borderColor: '#fe2434',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Net worth comparison',
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value =>
                                '€' + Number(value).toLocaleString('en-BE')
                        }
                    }
                },
            }
        });
    }

    update(years, scenarios) {
        if (!this.chart) return;

        this.scenarios = scenarios;

        this.chart.data.labels = years;
        this.chart.data.datasets.forEach((dataset, index) => {
            dataset.data = scenarios.map(
                year => year[index].net
            );
        });

        const fmt = value => value.toLocaleString("en-US", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        });

        const names = this.chart.data.datasets.map(dataset => dataset.label);

        // Populate financial breakdown table
        const tbody = this.querySelector("#details-table tbody");
        tbody.replaceChildren();

        const summaryBody = this.querySelector("#summary-table tbody");
        summaryBody.replaceChildren();

        names.forEach((name, scenarioIndex) => {
            // Scenario heading
            const heading = document.createElement("tr");
            const th = document.createElement("th");
            th.colSpan = 8;
            th.textContent = name;
            heading.className = "scenario-header";
            heading.append(th);
            tbody.append(heading);

            // Yearly data
            scenarios.forEach((yearData, yearIndex) => {
                const d = yearData[scenarioIndex];
                const row = document.createElement("tr");

                [
                    yearIndex,
                    fmt(d.net),
                    fmt(d.portfolio),
                    fmt(d.house),
                    fmt(d.rent),
                    fmt(d.loan),
                    fmt(d.interest),
                    fmt(d.principal),
                ].forEach(value => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    row.append(td);
                });

                tbody.append(row);
            });

            [scenarios.length - 1].forEach(yearIndex => {
                const d = scenarios[yearIndex][scenarioIndex];
                const row = document.createElement("tr");

                [
                    name,
                    fmt(d.net),
                    fmt(d.portfolio),
                    fmt(d.house),
                    fmt(d.rent),
                    fmt(d.loan),
                    fmt(d.interest),
                    fmt(d.principal),
                ].forEach(value => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    row.append(td);
                });

                summaryBody.append(row);
            });
        });

        this.chart.update();
    }

    disconnectedCallback() {
        this.chart?.destroy();
        this.chart = null;
    }
}

customElements.define('bench-chart', BenchChart);
