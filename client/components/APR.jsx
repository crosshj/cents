import React from 'react';
import History from './History';

const NUMBER_OF_MONTHS = 70;
const getDates = (datesMax) => {
	const dates = [];
	var y = 2000;
	while (dates.length <= datesMax){
		for(var m=1; m<=12; m++){
			dates.push(`${y}${(m+'').padStart(2, '0')}01`)
		}
		y += 1;
	}
	return dates;
}
const someDates = getDates(NUMBER_OF_MONTHS);


class DebtPayer {
	constructor({ startingDebt, apr, interest, minPayment }) {
		this.balance = startingDebt;
		this.apr = apr;
		this.interest = () => {
			return interest(this.balance, this.apr);
		};
		this.minPayment = () => {
			return Math.min(this.balance+1, minPayment(this.balance));
		};
	}

	pay(additional = 0){
		const thisMonthsBalance = this.balance;
		this.balance = this.interest() + thisMonthsBalance - this.minPayment() - additional;
		if(this.balance <= 0){
			this.balance = 0;
		}
		return thisMonthsBalance;
	}
}

const APR = () => {
	const payDebtRed = new DebtPayer({
		startingDebt: 1500,
		apr: 0.289,
		interest: (balance, apr, daysInMonth = 30) => (apr / 365) * daysInMonth * balance,
		minPayment: (balance) => Math.max(25, 0.04 * balance)
	});
	const payDebtBlue = new DebtPayer({
		startingDebt: 2500,
		apr: 0.193,
		interest: (balance, apr, daysInMonth = 30) => (apr / 365) * daysInMonth * balance,
		minPayment: (balance) => Math.max(25, 0.04 * balance)
	});

	const dataRed = [];
	const dataBlue = [];
	(new Array(NUMBER_OF_MONTHS)).fill().forEach((x, i) => {
		const redMinPay = payDebtRed.minPayment();
		const blueMinPay = payDebtBlue.minPayment();
		const totalAvailableMoney = 80;
		var extraMoney = 0;
		if(totalAvailableMoney > redMinPay + blueMinPay){
			extraMoney = totalAvailableMoney - (redMinPay + blueMinPay);
		}
		var redExtraMoney = 0;
		var blueExtraMoney = 0;
		if(redMinPay > 1){
			redExtraMoney = extraMoney;
		} else {
			blueExtraMoney = extraMoney;
		}

		dataRed.push({
			date: someDates[i],
			value: payDebtRed.pay(redExtraMoney)
		});
		dataBlue.push({
			date: someDates[i],
			value: payDebtBlue.pay(blueExtraMoney)
		});
	});
	
	//console.log({ dataRed, dataBlue })

	const series = [{
		name: '',
		color: 'red',
		fillColor: 'rgba(255,0,0,0.3)',
		data: dataRed
	}, {
		name: '',
		color: 'blue',
		fillColor: 'rgba(0,0,255,0.3)',
		data: dataBlue
	}]
	//console.log({ data2 });
	return (
		<div className="apr-wrapper">
			<div className="apr-contain container">
				<h2>APR Test</h2>
				<History series={series} width={850} type="area" />
				<div>{`
				The idea here is to see what strategies work best for paying down debt.  Consider the following:

				    - *** pay off debts in order of highest APR ***
				    - pay off lowest debt first
				    - pay off whatever debt is costing the most per month first
				    - only pay minimum payment

				Here "pay off" means that there is some extra amount available in addition to normal payment amount.

				I would like to show these strategies visually by graphing balances over time.

				Each account should have:
				     - minimum due per month (based on balance at given time)
				     - total owed at given time
				     - APR which is applied monthly at given time

		`.replace(/\t/g, '')}</div>
			</div>
		</div>
	);
};

export default APR;