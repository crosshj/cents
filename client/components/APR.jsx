import React from 'react';
import History from './History';
import { formatMoney, formatDateShort, clone } from '../helpers/utilities';

const getDates = (datesMax) => {
	const dates = [];
	var y = 2019;
	while (dates.length <= datesMax) {
		for (var m = 1; m <= 12; m++) {
			dates.push(`${y}${(m + '').padStart(2, '0')}01`)
		}
		y += 1;
	}
	return dates;
}

class DebtPayer {
	constructor({ startingDebt, apr, interest, minPayment }) {
		this.balance = startingDebt;
		this.apr = apr;
		this.totalInterest = 0;
		this.interest = () => {
			return interest(this.balance, this.apr);
		};
		this.minPayment = () => {
			return Math.min(this.balance, minPayment(this.balance));
		};
	}

	pay(additional = 0) {
		const thisMonthsBalance = this.balance;
		const interest = this.interest();
		this.totalInterest += interest;
		this.balance = interest + thisMonthsBalance - this.minPayment() - additional;
		if (this.balance <= 0) {
			this.balance = 0;
		}
		return thisMonthsBalance.toFixed(2);
	}
}

const Controls = ({ prefix, values={}, onChange, fields }) => {
	return (
		<form>
			<h5>{prefix.toUpperCase()} {(prefix=='red' || prefix=='blue') ? 'DEBT' : ''}</h5>
			{ fields.map((key, i) => {
				const cleanKeyName = ['APR'].includes(key)
					? key.toLowerCase()
					: key[0].toLowerCase() + key.slice(1).replace(' ', '');

				return (
					<div className="" key={`controls-${prefix}-key`}>
						<label>{key}</label>
						<input type="number"
							step={values[cleanKeyName] < 1
								? 0.001
								: 1
							}
							value={values[cleanKeyName]}
							onChange={(event) => onChange(prefix, cleanKeyName, event)}
						/>
					</div>
				);
			})}
		</form>
	);
};

const APR = ({ state, onChange }) => {
	const payDebtRed = new DebtPayer({
		startingDebt: state.red.amount,
		apr: state.red.apr,
		interest: (balance, apr, daysInMonth = 30) => (apr / 365) * daysInMonth * balance,
		minPayment: (balance) => Math.max(
			state.red.minimumPayment,
			state.red.minimumPercent * balance
		)
	});
	const payDebtBlue = new DebtPayer({
		startingDebt: state.blue.amount,
		apr: state.blue.apr,
		interest: (balance, apr, daysInMonth = 30) => (apr / 365) * daysInMonth * balance,
		minPayment: (balance) => Math.max(
			state.blue.minimumPayment,
			state.blue.minimumPercent * balance
		)
	});
	const NUMBER_OF_MONTHS = state.other.months;
	const someDates = getDates(NUMBER_OF_MONTHS);

	// SIMULATION HERE
	const dataRed = [];
	const dataBlue = [];
	const totalAvailableMoney = 
		payDebtRed.minPayment()
		+ payDebtBlue.minPayment()
		+ state.other.extra;
	//console.log({ totalAvailableMoney });

	var blueDone, redDone;
	(new Array(NUMBER_OF_MONTHS)).fill().forEach((x, i) => {
		const redMinPay = payDebtRed.minPayment();
		const blueMinPay = payDebtBlue.minPayment();
		var extraMoney = 0;
		var redExtraMoney = 0;
		var blueExtraMoney = 0;

		if (totalAvailableMoney > redMinPay + blueMinPay) {
			extraMoney = totalAvailableMoney - (redMinPay + blueMinPay);
		}

		if(state.other.strategy.includes("APR")){
			if(state.other.strategy.includes("High")){
				if(payDebtRed.apr >= payDebtBlue.apr){
					redExtraMoney = extraMoney;
				}
				if(payDebtRed.apr < payDebtBlue.apr){
					blueExtraMoney = extraMoney;
				}
			} else {
				if(payDebtRed.apr < payDebtBlue.apr){
					redExtraMoney = extraMoney;
				}
				if(payDebtRed.apr >= payDebtBlue.apr){
					blueExtraMoney = extraMoney;
				}
			}
		}

		if(state.other.strategy.includes("Debt")){
			if(state.other.strategy.includes("High")){
				if(payDebtRed.balance >= payDebtBlue.balance){
					redExtraMoney = extraMoney;
				}
				if(payDebtRed.balance < payDebtBlue.balance){
					blueExtraMoney = extraMoney;
				}
			} else {
				if(payDebtRed.balance < payDebtBlue.balance){
					redExtraMoney = extraMoney;
				}
				if(payDebtRed.balance >= payDebtBlue.balance){
					blueExtraMoney = extraMoney;
				}
			}
		}

		if(state.other.strategy.includes("Cost")){
			const redInterest = payDebtRed.interest();
			const blueInterest = payDebtBlue.interest();
			if(state.other.strategy.includes("High")){
				if(redInterest >= blueInterest){
					redExtraMoney = extraMoney;
				}
				if(redInterest < blueInterest){
					blueExtraMoney = extraMoney;
				}
			} else {
				if(redInterest < blueInterest){
					redExtraMoney = extraMoney;
				}
				if(redInterest >= blueInterest){
					blueExtraMoney = extraMoney;
				}
			}
		}

		// dont give extra money to accounts almost or fully paid
		if (redMinPay === 0 || payDebtRed.balance === redMinPay) {
			blueExtraMoney = extraMoney;
		}
		
		if (blueMinPay === 0 || payDebtBlue.balance === blueMinPay) {
			redExtraMoney = extraMoney;
		}

		const redBalance = payDebtRed.pay(redExtraMoney);
		const blueBalance = payDebtBlue.pay(blueExtraMoney);
		if(!redDone){
			dataRed.push({
				date: someDates[i],
				value: redBalance
			});
		}

		if(!blueDone){
			dataBlue.push({
				date: someDates[i],
				value: blueBalance
			});
		}

		if(redBalance <= 0){
			redDone;
		}
		if(blueBalance <= 0){
			blueDone;
		}
	});

	//console.log({ dataRed, dataBlue })

	const series = [{
		name: '',
		color: 'blue',
		fillColor: 'rgba(0,80,255,0.3)',
		data: dataBlue
	}, {
		name: '',
		color: 'red',
		fillColor: 'rgba(255,0,0,0.3)',
		data: dataRed
	}];
	//console.log({ data2 });

	const redBlueControlFields = [
		'Amount', 'APR', 'Minimum Percent', 'Minimum Payment'
	];

	const strategies = [
		'High APR',
		'Low APR',
		'High Debt',
		'Low Debt',
		'High Cost',
		'Low Cost',
		'None'
	].map(x => ({
		text: x,
		isSelected: x === state.other.strategy
	}));

	const totalInterest = formatMoney(payDebtRed.totalInterest + payDebtBlue.totalInterest);
	return (
		<div className="apr-wrapper">
			<div className="apr-contain container">
				<h2>Debt Payment Calculator</h2>
				<History series={series} width={850} type="area" />

				<h5>STRATEGY</h5>
				<div className="grid-row">
					{ strategies.map((button, i) => {
						return (
							<button
								className={button.isSelected ? 'button-primary grey' : ''}
								onClick={(event) => onChange('other', 'strategy', event.target.innerHTML)}
							>{button.text}</button>
						);
					})}
				</div>
				<h5 style={{ marginTop: 25, marginBottom: 10 }}>INTEREST COST</h5>
				<h4 style={{ marginBottom: 40, fontWeight: 500 }}>{totalInterest}</h4>
				<div className="container">
					<div className="flex-row">
						<div className="columns">
							<Controls prefix="blue"
								fields={redBlueControlFields}
								values={state.blue}
								onChange={onChange}
							/>
						</div>
						<div className="columns">
							<Controls prefix="red"
								fields={redBlueControlFields}
								values={state.red}
								onChange={onChange}
							/>
						</div>
						<div className="columns">
							<Controls prefix="other"
								fields={['months', 'extra']}
								values={state.other}
								onChange={onChange}
							/>
						</div>
					</div>
				</div>
				<div>{`
				The idea here is to see what strategies work best for paying down debt.  Consider the following:

				    - pay off debts in order of highest/lowest APR
				    - pay off lowest/highest debt first
				    - pay off whatever debt is costing the most/least per month first
				    - split extra money between accounts [ NOT IMPLEMENTED ]
				    - only pay minimum payment

				Here "pay off" means that there is some extra amount available in addition to normal payment amount.

		`.replace(/\t/g, '')}</div>
			</div>
		</div>
	);
};

const APRInitialState = {
	other: {
		months: 60,
		extra: 0,
		strategy: 'High APR'
	},
	red: {
		// wal-mart
		amount: 2145,
		apr: 0.239,
		minimumPercent: 0.031,
		minimumPayment: 25
	},
	blue: {
		// american express
		amount: 10210.49,
		apr: 0.1774,
		minimumPercent: 0.0255, //doesn't really matter when minPayment is very high
		minimumPayment: 25
	}
}

class APRContainer extends React.Component {
	constructor(props, context){
		super(props, context);
		this.state = APRInitialState;
		this.onChange = this.onChange.bind(this);
	}

	onChange(prefix, cleanKeyName, event){
		const value = typeof event === 'string'
			? event
			: Number(event.target.value);
		this.state[prefix][cleanKeyName] = value;
		this.forceUpdate();
	}

	componentDidMount(){
		//TODO: fix this; is not doing what I wanted (per page allow zoom)
		return;

		// allow zoom
		const viewportMeta = document.querySelector('[name="viewport"]');
		if(!viewportMeta){
			return;
		}
		this.viewportContentBackup = viewportMeta.getAttribute('content');
		if(!this.viewportContentBackup){
			return;
		}
		const newViewportContent = this.viewportContentBackup
			.replace('maximum-scale=1', 'maximum-scale=3');
		viewportMeta.setAttribute('content', newViewportContent);
	}

	componentWillUnmount(){
		// reset zoom
		if(!this.viewportContentBackup){
			return;
		}
		const viewportMeta = document.querySelector('[name="viewport"]');
		viewportMeta.setAttribute('content', this.viewportContentBackup);
	}

	render() {
		return <APR {...this.props} state={this.state} onChange={this.onChange}/>
	}
}

export default APRContainer;