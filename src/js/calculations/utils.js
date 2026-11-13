
export function raiseError(msg) {
    console.error(msg);
    throw new Error(msg);
}

export function applyRate(value, annualRate) {
    return value * (1 + annualRate);
}

export function calculateAnnualPayment(
    loanAmount,
    annualRate,
    durationYears
) {
    if (durationYears <= 0) {
        raiseError("Invalid mortgage duration.");
    }

    const rate = annualRate / 100;

    if (rate === 0) {
        return loanAmount / durationYears;
    }

    return loanAmount * rate / (1 - Math.pow(1 + rate, -durationYears));
}
export function calculateLoanDuration(
    principal,
    annualPayment,
    annualInterestRate
) {
    const rate = annualInterestRate / 100;

    if (annualPayment < principal * rate) {
        raiseError("Monthly payment is too low to repay the loan.");
    }

    if (rate === 0) {
        return principal / annualPayment;
    }

    return -Math.log(1 - (principal * rate) / annualPayment) / Math.log(1 + rate);
}
