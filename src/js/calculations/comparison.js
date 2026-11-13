import * as utils from './utils.js';

function createScenario({
    cash = 0,
    buyYear = null,
    loanYear = null,
} = {}) {
    return {
        house: {
            current: 0,
            year: buyYear,
            maintenance: 0,
        },

        rent: {
            current: 0,
        },

        loan: {
            current: 0,
            year: loanYear,
            duration: 0,
            // Always 0 or annualPayment
            payment: 0,
            // Summary
            interest: 0,
            principal: 0,
        },

        portfolio: {
            current: cash,
        },

        net: {
            current: cash,
        },
    };
}

// Annual computation for now
export function calculateComparison(params, extra) {
    console.log(params);
    const {
        // Property
        housePrice,
        houseAppreciation,
        maintenanceCosts,
        // Financing
        initialSavings,
        loanAmount,
        annualRate,
        durationYears,
        // Renting
        rent,
        rentInflation,
        // Investing
        investmentReturn,
        // Simulation
        comparisonYears,
        buyYear,
    } = params;

    if (housePrice > initialSavings + loanAmount) {
        utils.raiseError("Insufficient funds to purchase the house.");
    }

    // Reference payment to be used as income for comparison
    const loanAnnualPayment = utils.calculateAnnualPayment(
        loanAmount,
        annualRate,
        durationYears
    );

    // The idea is that one has the interest of investment and the other of assets
    // Possible state: NeedHouse, HasHouse, NeedLoan, HasLoan
    // Need to simplify, making a simulator is not the goal
    const scenarios = [
        createScenario({
            cash: initialSavings,
            buyYear: 0,
        }),
        createScenario({
            cash: initialSavings,
        }),
        createScenario({
            cash: initialSavings,
            buyYear,
        }),
    ];

    const chartData = [];
    let currentRent = rent * 12;
    let currentHousePrice = housePrice;
    // Difference between what was added in the year vs what was already in ?

    for (let year = 0; year <= comparisonYears; year++) {
        const yearHistory = []
        for (const s of scenarios) {
            const sHistory = {};
            // Split into start / end for clarity
            // Update at beginning of year

            let actualPayment = 0;

            // 1. Buy the house
            if (year == s.house.year) {
                // Buy it or take a loan for it
                s.house.current = currentHousePrice;
                s.portfolio.current -= currentHousePrice - loanAmount;
                // Need to take a loan
                // Get needed duration for the loan to pay the house
                // Keep same rate and payment (so can only play on duration or amount)
                s.loan.duration = Math.ceil(utils.calculateLoanDuration(
                    loanAmount,
                    loanAnnualPayment,
                    annualRate
                ));
                s.loan.current = loanAmount;
                s.loan.payment = loanAnnualPayment;
                s.loan.year = year;
            } else if (s.house.current > 0) {
                // current house value
                s.house.current = currentHousePrice;
            } 

            // Initial values of the year
            sHistory.portfolio = s.portfolio.current;
            sHistory.loan = s.loan.current;
            sHistory.net = s.house.current + s.portfolio.current - s.loan.current;
            sHistory.house = s.house.current;

            // 2. Repay loan
            if (s.loan.current > 0) {
                // Interest owed for this year
                const interest = s.loan.current * annualRate / 100;
                s.loan.interest += interest;
                // The payment cannot exceed the remaining principal + interest
                actualPayment = Math.min(
                    s.loan.payment,
                    s.loan.current + interest
                );
                // Interest goes to the bank; principal reduces the loan
                const principal = actualPayment - interest;
                s.loan.principal += principal;
                s.loan.current -= principal;

                // No loan anymore
                if (s.loan.current <= 0.001) {
                    // floating point issue
                    s.loan.current = 0;
                    s.loan.payment = 0;
                }
            }

            // 3. House or rent expenses
            if (s.house.current > 0) {
                // update house value
                s.house.current = currentHousePrice;
                // Add it as investable instead
                s.house.maintenance += currentHousePrice * maintenanceCosts / 100;
            } else {
                s.portfolio.current -= currentRent;
                s.rent.current += currentRent;
                // Add it as investable instead
                s.portfolio.current += currentHousePrice * maintenanceCosts / 100;
            }

            // 4. Save the unused annual budget
            // Add it as saving when no loan
            // Invest the equivalent later on after buying
            s.portfolio.current += loanAnnualPayment - actualPayment;

            // 5. Calculate net worth
            s.net.current = s.house.current + s.portfolio.current - s.loan.current;

            // 6. Apply investment returns
            if (s.portfolio.current > 0) {
                s.portfolio.current = utils.applyRate(
                    s.portfolio.current,
                    investmentReturn / 100
                );
            }

            // Modifier values of the year
            sHistory.rent = s.rent.current;
            sHistory.interest = s.loan.interest;
            sHistory.principal = s.loan.principal;

            yearHistory.push(sHistory);
        }

        chartData.push({
            year,
            currentRent,
            currentHousePrice,
            scenarios: yearHistory,
        });

        currentRent = utils.applyRate(
            currentRent,
            rentInflation / 100
        );
        currentHousePrice = utils.applyRate(
            currentHousePrice,
            houseAppreciation / 100
        );
    }

    return {
        chartData,
    };
}
