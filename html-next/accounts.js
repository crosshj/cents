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

/**
 * Calculate summary from accounts data
 * Same logic as old index.js summarize function
 * Returns dollar-formatted strings
 */
const calculateSummary = (data) => {
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
		assets: formatMoney(totalAssets),
		liabilities: formatMoney(totalLiabilities),
		totalOwed: formatMoney(totalOwed),
		balance: formatMoney(balance),
	};
};

/**
 * Bind data to template (for card rendering)
 */
const bindData = (template, context) => {
	const clone = template.content.cloneNode(true);

	clone.querySelectorAll('*').forEach((el) => {
		// Replace tokens like {{key}} in all attribute values
		[...el.attributes].forEach((attr) => {
			if (attr.value.includes('{{')) {
				el.setAttribute(
					attr.name,
					attr.value.replace(/\{\{(\w+)\}\}/g, (_, key) =>
						context[key] != null ? context[key] : ''
					)
				);
			}
		});

		// data-if condition
		const keyIf = el.getAttribute('data-if');
		if (keyIf && !context[keyIf]) {
			el.remove();
			return; // skip further updates
		}

		// data-text binding
		const keyText = el.getAttribute('data-text');
		if (keyText && context[keyText] != null) {
			el.textContent = context[keyText];
		}

		// data-href binding
		const keyHref = el.getAttribute('data-href');
		if (keyHref && context[keyHref]) {
			el.href = context[keyHref];
		}
	});

	const container = document.createElement('div');
	container.appendChild(clone);
	return container;
};

/**
 * Format a card item for display
 */
export const formatCard = (item) => {
	if (item.hidden || item.type === 'seperator-def' || item.type === 'group')
		return '';

	const tpl = document.getElementById('card-template');
	if (!tpl) {
		console.warn('Card template not found');
		return '';
	}

	const statusIcon = {
		paid: 'check',
		pending: 'sync',
	}[(item.status || '').toLowerCase()];

	const context = {
		...item,
		title: item.title || 'Untitled',
		amount: formatMoney(item.amount || 0),
		owed: Number(item.total_owed) > 0 ? formatMoney(item.total_owed) : '',
		includes: Array.isArray(item.items)
			? `Includes: ${item.items.map((i) => i.title).join(', ')}`
			: '',
		statusIcon,
	};

	const htmlString = bindData(tpl, context).innerHTML;
	return htmlString;
};

/**
 * Process assets/liabilities for display (filter, sort, format)
 */
export const processAssets = (items) => {
	return (items || [])
		.filter((x) => !x.hidden)
		.sort((a, b) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0))
		.map((item) => ({
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
			}[(item.status || '').toLowerCase()],
			showLog: document.location.href.includes('localhost'),
			auto: item.auto || '',
		}));
};

/**
 * Get accounts data for a user from Supabase
 * Returns data with pre-calculated summary
 */
export const getAccounts = async (supabase, userId) => {
	if (!userId || !supabase) {
		const emptyData = { assets: [], liabilities: [], balance: [] };
		return {
			...emptyData,
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
					assets: processAssets([]),
					liabilities: processAssets([]),
					summary: calculateSummary(emptyData),
				};
			}
			console.error('Error fetching accounts:', error);
			const emptyData = { assets: [], liabilities: [], balance: [] };
			return {
				...emptyData,
				assets: processAssets([]),
				liabilities: processAssets([]),
				summary: calculateSummary(emptyData),
			};
		}

		const accountsData = data?.accounts_data || {
			assets: [],
			liabilities: [],
			balance: [],
		};

		return {
			...accountsData,
			assets: processAssets(accountsData.assets || []),
			liabilities: processAssets(accountsData.liabilities || []),
			summary: calculateSummary(accountsData),
		};
	} catch (error) {
		console.error('Failed to fetch accounts:', error);
		const emptyData = { assets: [], liabilities: [], balance: [] };
		return {
			...emptyData,
			assets: processAssets([]),
			liabilities: processAssets([]),
			summary: calculateSummary(emptyData),
		};
	}
};

/**
 * Save accounts data to Supabase
 */
export const saveAccounts = async (supabase, userId, accountsData) => {
	if (!userId || !supabase || !accountsData) {
		throw new Error('Missing required parameters');
	}

	try {
		const { data, error } = await supabase
			.from('user_accounts')
			.upsert(
				{
					user_id: userId,
					accounts_data: accountsData,
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
