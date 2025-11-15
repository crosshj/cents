import { timeWeightedAverage } from './accounts';

const twaTag = (string) => `[time-weighted-average]\n${string}`;

describe('Accounts', () => {
	it('should calculate time-weighted averages: no tag', async () => {
		const amount = 999;
		const result = timeWeightedAverage.parseValue(amount);
		expect(result).toBe(999);
	});
	it('should calculate time-weighted averages: basic', async () => {
		const amount = twaTag`1000.10:2025-11-15`;
		const result = timeWeightedAverage.parseValue(amount);
		expect(result).toBe(1000.1);
	});
	it('should calculate time-weighted averages: multiple + bad format', async () => {
		const amount = twaTag`  1000.10:2025-11-15,\n\n500:\t2025-12-15\n\n\t`;
		const result = timeWeightedAverage.parseValue(amount);
		expect(result).toBe(750.05);
	});
	it('should calculate time-weighted averages: totals months', async () => {
		const amount = twaTag`1000:2025-11-15, 500:2025-12-01, 500:2025-12-15`;
		const result = timeWeightedAverage.parseValue(amount);
		expect(result).toBe(1000);
	});
	it('should calculate time-weighted averages: totals months + fills month gaps', async () => {
		const amount = twaTag`500:2025-10-01, 500:2025-10-05, 1100:2025-12-01`;
		const result = timeWeightedAverage.parseValue(amount);
		expect(result).toBe(1033.33);
	});
});
