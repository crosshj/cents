import React from 'react';
import History from './History';

const APR = () => {
	const data = [
		{ date: "20190701", value: 51 },
		{ date: "20190702", value: 48 },
		{ date: "20190703", value: 47 },
		{ date: "20190704", value: 46 },
		{ date: "20190705", value: 45 },
	];
	const data2 = (new Array(30)).fill()
		.map((x, i) => ({
			date: "201907" + (i + 1 + '').padStart(2, '0'),
			value: 50 - i
		}));
	//console.log({ data2 });
	return (
		<div className="apr-wrapper">
		<div className="apr-contain container">
			<h2>APR Test</h2>
			<History data={data2} width={850} />
			<div>{`
				The idea here is to see what strategies work best for paying down debt.  Consider the following:

				    - pay off debts in order of highest APR
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