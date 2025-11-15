// Simple accounts data access from Supabase

/**
 * Format number as currency string
 */
const formatMoney = (value) => {
	const num = Number(value);
	if (isNaN(num)) return '0.00';
	return num.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

export const timeWeightedAverage = (() => {
	function inputCoerce(value) {
		const lines = String(value).split(/\r?\n/);
		if (!lines.length || lines[0].trim() !== '[time-weighted-average]')
			return value;
		const tail = lines.slice(1).join(' ').trim();
		if (!tail) return value;
		const parts = tail
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!parts.length) return value;
		const last = parts[parts.length - 1];
		if (!last.includes(':')) {
			const d = new Date();
			const today = `${d.getFullYear()}-${String(
				d.getMonth() + 1
			).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			parts[parts.length - 1] = `${last}:${today}`;
		}
		return `${lines[0]}\n${parts.join(', ')}`;
	}
	function calculateTWA(entries) {
		const monthlyTotals = {};

		for (const { d, v } of entries) {
			const yearMonth = d.toISOString().slice(0, 7); // "YYYY-MM"
			if (!monthlyTotals[yearMonth]) {
				monthlyTotals[yearMonth] = 0;
			}
			monthlyTotals[yearMonth] += v;
		}

		// Fill in missing months
		const sortedMonths = Object.keys(monthlyTotals).sort();
		if (sortedMonths.length > 1) {
			const [startYear, startMonth] = sortedMonths[0]
				.split('-')
				.map(Number);
			const [endYear, endMonth] = sortedMonths[sortedMonths.length - 1]
				.split('-')
				.map(Number);

			let currentDate = new Date(startYear, startMonth - 1);
			const endDate = new Date(endYear, endMonth - 1);
			let lastValue = monthlyTotals[sortedMonths[0]];

			while (currentDate <= endDate) {
				const yearMonth = currentDate.toISOString().slice(0, 7);
				if (!monthlyTotals[yearMonth]) {
					monthlyTotals[yearMonth] = lastValue;
				} else {
					lastValue = monthlyTotals[yearMonth];
				}
				currentDate.setMonth(currentDate.getMonth() + 1);
			}
		}

		const count = Object.keys(monthlyTotals).length;
		const totalValue = Object.values(monthlyTotals).reduce(
			(sum, val) => sum + val,
			0
		);
		const average = totalValue / count;

		return Number(average.toFixed(2));
	}
	function parseValue(value) {
		if (!value || typeof value !== 'string') {
			return value;
		}
		const [firstLine, ...lines] = value.trim().split(/\r?\n/);
		if (!firstLine.includes('[time-weighted-average]')) {
			return value;
		}
		const parts = lines
			.join(' ')
			.trim()
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!parts.length) {
			return value;
		}
		const entries = parts
			.map((p) => {
				const [v, d] = p.split(':').map((s) => s.trim());
				return { v: +v, d: new Date(d) };
			})
			.filter((e) => e.v && !isNaN(e.d));

		if (!entries.length) {
			return 0;
		}

		return calculateTWA(entries);
	}
	function parseAccounts(rawAccounts) {
		const parsedAccounts = { liabilities: [], assets: [] };
		for (const type of ['liabilities', 'assets']) {
			for (const item of rawAccounts[type] || []) {
				const parsedItem = {};
				for (const key of Object.keys(item)) {
					const parsed = parseValue(item[key]);
					if (parsed === item[key]) {
						parsedItem[key] = item[key];
						continue;
					}
					parsedItem[key + '_type'] = 'time-weighted-average';
					parsedItem[key] = parsed;
				}
				parsedAccounts[type].push(parsedItem);
			}
		}
		return parsedAccounts;
	}
	return {
		inputCoerce,
		calculateTWA,
		parseValue,
		parseAccounts,
	};
})();

/**
 * Calculate summary from accounts data
 * Same logic as old index.js summarize function
 * Returns dollar-formatted strings
 */
export const calculateSummary = (data) => {
	const assets = data.assets || [];
	const liabilities = data.liabilities || [];

	const sum = (arr, key) =>
		arr
			.filter((x) => x.hidden + '' !== 'true')
			.reduce((total, item) => {
				const num = parseFloat(item[key] || 0);
				return isNaN(num) ? total : total + num;
			}, 0);

	const totalAssets = sum(assets, 'amount');
	const totalLiabilities = sum(liabilities, 'amount');
	const totalOwed = sum(liabilities, 'total_owed');
	const balance = totalAssets - totalLiabilities;

	return {
		assets: formatMoney(totalAssets).padStart(10, ' '),
		liabilities: formatMoney(totalLiabilities).padStart(10, ' '),
		balance: formatMoney(balance).padStart(10, ' '),
		totalOwed: formatMoney(totalOwed).padStart(10, ' '),
	};
};

/**
 * Process assets/liabilities for display (filter, sort, format)
 */
const processAssets = (items) => {
	const mapAsset = (item) => {
		const mapped = {
			...item,
			title: item.title || 'Untitled',
			amount: formatMoney(item.amount || 0),
			owed:
				Number(item.total_owed) > 0 ? formatMoney(item.total_owed) : '',
			includes: Array.isArray(item.items)
				? `Includes: ${item.items.map((i) => i.title).join(', ')}`
				: '',
			statusIcon: {
				paid: 'check',
				pending: 'sync',
				due: 'clock-o',
			}[(item.status || '').toLowerCase()],
			// showLog: document.location.href.includes('localhost'),
			auto: item.auto || '',
		};
		if (!mapped.statusIcon) {
			console.warn('Unknown status icon for item:', item);
		}
		return mapped;
	};
	const mappedList = (items || [])
		.filter((x) => !x.hidden)
		.sort((a, b) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0))
		.map(mapAsset);
	return mappedList;
};

/**
 * Get accounts data for a user from Supabase
 * Returns data with pre-calculated summary
 */
const getAccounts = async (supabase, userId) => {
	if (!userId || !supabase) {
		console.log('Missing userId or supabase client', { userId, supabase });
		const emptyData = { assets: [], liabilities: [], balance: [] };
		return {
			...emptyData,
			rawAccountsData: emptyData, // Store raw data for editing
			assets: processAssets([]),
			liabilities: processAssets([]),
			summary: calculateSummary(emptyData),
		};
	}

	try {
		const { data, error } = await supabase
			.from('user_accounts')
			.select('accounts_data')
			.eq('user_id', userId)
			.single();

		if (error) {
			// If no record exists, return empty structure
			if (error.code === 'PGRST116') {
				const emptyData = { assets: [], liabilities: [], balance: [] };
				return {
					...emptyData,
					rawAccountsData: emptyData, // Store raw data for editing
					assets: processAssets([]),
					liabilities: processAssets([]),
					summary: calculateSummary(emptyData),
				};
			}
			console.error('Error fetching accounts:', error);
			const emptyData = { assets: [], liabilities: [], balance: [] };
			return {
				...emptyData,
				rawAccountsData: emptyData, // Store raw data for editing
				assets: processAssets([]),
				liabilities: processAssets([]),
				summary: calculateSummary(emptyData),
			};
		}

		const accountsData = data?.accounts_data || {
			assets: [],
			liabilities: [],
		};

		const accountsWithTWA = timeWeightedAverage.parseAccounts(accountsData);

		return {
			...accountsWithTWA,
			rawAccountsData: accountsData, // Store raw data for editing
			assets: processAssets(accountsWithTWA.assets || []),
			liabilities: processAssets(accountsWithTWA.liabilities || []),
			summary: calculateSummary(accountsWithTWA),
		};
	} catch (error) {
		console.error('Failed to fetch accounts:', error);
		const emptyData = { assets: [], liabilities: [], balance: [] };
		return {
			...emptyData,
			rawAccountsData: emptyData, // Store raw data for editing
			assets: processAssets([]),
			liabilities: processAssets([]),
			summary: calculateSummary(emptyData),
		};
	}
};

/**
 * Save accounts data to Supabase
 * Only saves assets and liabilities, filters out any other properties
 */
const saveAccounts = async (supabase, userId, accountsData) => {
	if (!userId || !supabase || !accountsData) {
		throw new Error('Missing required parameters');
	}

	try {
		// Only send assets and liabilities to backend
		const cleanData = {
			assets: accountsData.assets || [],
			liabilities: accountsData.liabilities || [],
		};

		const { data, error } = await supabase
			.from('user_accounts')
			.upsert(
				{
					user_id: userId,
					accounts_data: cleanData,
				},
				{
					onConflict: 'user_id',
				}
			)
			.select()
			.single();

		if (error) {
			console.error('Error saving accounts:', error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Failed to save accounts:', error);
		throw error;
	}
};

/**
 * Update and save accounts data, then refresh
 * Helper function for edit/archive/add operations
 * Only sends assets and liabilities to backend
 */
const updateAndSaveAccounts = async (supabase, userId, rawAccountsData) => {
	if (!userId || !supabase || !rawAccountsData) {
		throw new Error('Missing required parameters');
	}

	try {
		// Only send assets and liabilities to backend
		const cleanData = {
			assets: rawAccountsData.assets || [],
			liabilities: rawAccountsData.liabilities || [],
		};

		// Save clean data to Supabase
		await saveAccounts(supabase, userId, cleanData);

		// Re-fetch and return updated accounts data
		return await getAccounts(supabase, userId);
	} catch (error) {
		console.error('Failed to update and save accounts:', error);
		throw error;
	}
};

export async function setupAccounts({
	supabase,
	SetData,
	GetData,
	auth,
	session,
}) {
	window.saveAccounts = (data) => {
		if (!session?.user?.id) return;
		return saveAccounts(auth.supabase, session.user.id, data);
	};
	window.updateAndSaveAccounts = (rawData) => {
		if (!session?.user?.id) return;
		return updateAndSaveAccounts(auth.supabase, session.user.id, rawData);
	};
	const getAccountsData = async () => {
		if (!session?.user?.id) return;
		const accounts = await getAccounts(supabase, session?.user?.id);
		return accounts;
	};
	window.refreshAccountsData = async () => {
		const accounts = await getAccountsData();
		await SetData('accountsSummary', accounts?.summary);
		await SetData('accountsAssets', accounts?.assets);
		await SetData('accountsLiabilities', accounts?.liabilities);
		await SetData('accountsRawData', accounts?.rawAccountsData);
	};
	window.getDebtDetail = async (debtTitle) => {
		const rawAccounts = (await GetData('accountsRawData')) || {
			liabilities: [],
		};
		const debt = rawAccounts.liabilities.find(
			(debt) => debt?.title?.toLowerCase() === debtTitle.toLowerCase()
		);
		console.warn(
			[
				'TODO: special processing possibly needed for debt detail',
				'this might be especially true when amount can be aggregated',
			].join('\n')
		);
		return debt;
	};

	window.timeWeightedAverage = timeWeightedAverage;

	const state = {};
	const accounts = await getAccountsData();
	if (accounts) {
		state.accountsSummary = accounts?.summary;
		state.accountsAssets = accounts?.assets;
		state.accountsLiabilities = accounts?.liabilities;
		state.accountsRawData = accounts?.rawAccountsData;
	}
	return { initialState: state };
}
