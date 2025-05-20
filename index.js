import { decryptJson } from './crypto.js';

const LS_KEY = 'financeData';

const Money = (value) => {
	const num = Number(value);
	if (isNaN(num)) return '';
	const numString = num.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	return numString;
};

const formatCard = (item) => {
	if (item.hidden || item.type === 'seperator-def' || item.type === 'group')
		return '';

	const amount = Money(item.amount || 0);
	const owed =
		item.total_owed && parseFloat(item.total_owed) > 0
			? `$${Money(item.total_owed)}`
			: '';
	const recurrence = item.occurence || '';
	const auto = item.auto ? `<span class="auto-pill">AUTO</span>` : '';
	const statusIcon = {
		paid: 'check',
		pending: 'sync',
	}[(item.status || '').toLowerCase()];

	const status = statusIcon
		? `<span class="symbols-outlined" style="padding-right: 0.5em">${statusIcon}</span>`
		: item?.status || '';
	const date = item.date || '';

	const note = item.notes || item.note || '';
	const link = item.website
		? `<a href="${item.website}" target="_blank">website</a>`
		: '';

	const subItems = Array.isArray(item.items)
		? `<div class="sub">Includes: ${item.items
				.map((i) => i.title)
				.join(', ')}</div>`
		: '';

	return `
		<div class="card">
			<div class="header-row">
				<div class="title">
					<h3>${item.title || 'Untitled'}</h3>
					${auto}
				</div>
				<div class="links">
					${link}
					${
						item.log !== false
							? `
								<a onclick="window.logAccount('${item.title.replace(/'/g, "\\'")}'); return false;">
									log
								</a>
							  `.trim()
							: ''
					}
				</div>
			</div>

			<div class="money-row">
				<div><span class="amount">$${amount}</span> ${recurrence}</div>
				${owed ? `<div class="owed">${owed} owed</div>` : ''}
			</div>

			${note ? `<div class="note">${note}</div>` : ''}
			${subItems}
			<div class="meta-bottom">${[status, date].filter(Boolean).join('   ')}</div>
		</div>
	`;
};

function summarize(data) {
	const assets = data.assets || [];
	const liabilities = data.liabilities || [];

	const sum = (arr, key) =>
		arr.filter(x => x.hidden+'' !== "true")
		.reduce((total, item) => {
			const num = parseFloat(item[key] || 0);
			return isNaN(num) ? total : total + num;
		}, 0);
		
	console.log(liabilities.filter(x => x.hidden+'' !== "true"));

	const totalAssets = sum(assets, 'amount');
	const totalLiabilities = sum(liabilities, 'amount');
	const totalOwed = sum(liabilities, 'total_owed');
	const balance = totalAssets - totalLiabilities;

	return [
		{
			title: 'Total Liabilities',
			amount: totalLiabilities,
			log: false,
		},
		{ title: 'Total Owed', amount: totalOwed, log: false },
		{
			title: 'Total Assets',
			amount: totalAssets,
			log: false,
		},
		{ title: 'Balance', amount: balance, log: false },
	];
}

const populate = (data) => {
	const balanceGrid = document.getElementById('balanceGrid');
	const assetsGrid = document.getElementById('assetsGrid');
	const liabilitiesGrid = document.getElementById('liabilitiesGrid');

	const summary = summarize(data);
	const assets = (data.assets || []).sort((a,b) => b.amount - a.amount);
	const liabilities = (data.liabilities || []).sort((a,b) => b.amount - a.amount);

	balanceGrid.innerHTML = summary.length
		? summary.map(formatCard).join('')
		: `<div class="card no-data">No data</div>`;

	assetsGrid.innerHTML = assets.filter((x) => !x.hidden).length
		? assets
				.filter((x) => !x.hidden)
				.map(formatCard)
				.join('')
		: `<div class="card no-data">No data</div>`;

	liabilitiesGrid.innerHTML = liabilities.filter((x) => !x.hidden).length
		? liabilities
				.filter((x) => !x.hidden)
				.map(formatCard)
				.join('')
		: `<div class="card no-data">No data</div>`;

	window.logAccount = (title) => {
		const item = [...summary, ...assets, ...liabilities].filter(
			(x) => x.title === title
		);
		console.log(JSON.stringify(item, null, 2));
	};
};

function loadFromLocalStorage() {
	const raw = localStorage.getItem(LS_KEY);
	if (raw) {
		try {
			const parsed = JSON.parse(raw);
			populate(parsed);
		} catch {
			console.warn('Invalid JSON in localStorage.');
		}
	} else {
		populate({ assets: [], liabilities: [] });
	}
}
	
async function setUpFileControls() {
	const container = document.getElementById('file-controls');
	if (!container) return;

	const hasLocalStorage = !!localStorage.getItem(LS_KEY);
	let fetchedLocal = null;

	// Attempt to fetch accounts.json if localStorage is empty
	if (!hasLocalStorage) {

		try {
			const response = await fetch('accounts.encrypted.json', { cache: 'no-store' });
			if (response.ok) {
				fetchedLocal = await response.json();
			}
		} catch (err) {
			console.info('accounts.json not available:', err);
		}
	}

	// Create the hidden file input
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.id = 'fileInput';
	fileInput.hidden = true;
	fileInput.accept = '.json';

	// Custom upload button
	const uploadBtn = document.createElement('button');
	uploadBtn.textContent = 'Upload File';
	uploadBtn.addEventListener('click', () => fileInput.click());

	// Clear button if localStorage exists
	if (hasLocalStorage) {
		const clearBtn = document.createElement('button');
		clearBtn.textContent = 'Clear';
		clearBtn.className = 'clear-button';
		clearBtn.addEventListener('click', () => {
			localStorage.removeItem(LS_KEY);
			location.reload();
		});
		container.append(clearBtn);
	} else {
		container.append(uploadBtn);
		container.append(fileInput);

		// Optionally show "Use Local" if it was fetched successfully
		if (fetchedLocal) {
			const useLocalBtn = document.createElement('button');
			useLocalBtn.textContent = 'Use Local';
			useLocalBtn.className = 'button';
			useLocalBtn.addEventListener('click', async () => {
				const username = prompt('Enter your username');
				const password = prompt('Enter your password');
				const decrypted = await decryptJson(fetchedLocal, username, password);
				if(decrypted?.error) return;
				localStorage.setItem(LS_KEY, JSON.stringify(decrypted));
				location.reload();
			});
			container.append(useLocalBtn);
		}

		fileInput.addEventListener('change', (e) => {
			const file = e.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (evt) => {
				try {
					const json = JSON.parse(evt.target.result);
					localStorage.setItem(LS_KEY, JSON.stringify(json));
					location.reload();
				} catch {
					alert('Invalid JSON file.');
				}
			};
			reader.readAsText(file);
		});
	}
}


document.addEventListener('DOMContentLoaded', async () => {
	document.fonts.ready.then(() => {
		document.documentElement.classList.add('fonts-loaded');
	});

	loadFromLocalStorage();
	await setUpFileControls();
});
