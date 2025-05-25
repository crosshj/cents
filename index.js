import { decryptJson } from './crypto.js';

const USE_ENCRYPTED = true;
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

function bindData(template, context) {
	const clone = template.content.cloneNode(true);

	clone.querySelectorAll('*').forEach(el => {
		// Replace tokens like {{key}} in all attribute values
		[...el.attributes].forEach(attr => {
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
}

function formatCard(item) {
	if (item.hidden || item.type === 'seperator-def' || item.type === 'group') return '';

	const tpl = document.getElementById('card-template');
	const statusIcon = {
		paid: 'check',
		pending: 'sync'
	}[(item.status || '').toLowerCase()];

	const context = {
		...item,
		title: item.title || 'Untitled',
		amount: Money(item.amount || 0),
		owed: Number(item.total_owed) > 0 ? Money(item.total_owed) : '',
		includes: Array.isArray(item.items)
			? `Includes: ${item.items.map(i => i.title).join(', ')}`
			: '',
		statusIcon
	};

	const htmlString = bindData(tpl, context).innerHTML;
	
	// console.log({ item, htmlString });
	return htmlString
}

function renderSummary(data){
	const tpl = document.getElementById('summary-template');

	const assets = Money(data.find(x => x.title.includes('Assets')).amount);
	const liabilities = Money(data.find(x => x.title.includes('Liabilities')).amount);
	const balance = Money(data.find(x => x.title.includes('Balance')).amount);

	const maxLength = Math.max(assets.length, liabilities.length)

	const context = {
		assets: assets.padStart(maxLength, '\u00A0'),
		liabilities: liabilities.padStart(maxLength, '\u00A0'),
		balance: balance.padStart(maxLength, '\u00A0'),
		totalOwed: Money(data.find(x => x.title.includes('Total Owed')).amount),
	}
	const htmlString = bindData(tpl, context).innerHTML;
	return htmlString
}

function summarize(data) {
	const assets = data.assets || [];
	const liabilities = data.liabilities || [];

	const sum = (arr, key) =>
		arr.filter(x => x.hidden+'' !== "true")
		.reduce((total, item) => {
			const num = parseFloat(item[key] || 0);
			return isNaN(num) ? total : total + num;
		}, 0);
		
	// console.log(liabilities.filter(x => x.hidden+'' !== "true"));

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
	const summarySection = document.getElementById('summary');
	const assetsGrid = document.getElementById('assetsGrid');
	const liabilitiesGrid = document.getElementById('liabilitiesGrid');

	const summary = summarize(data);
	const assets = (data.assets || []).sort((a,b) => b.amount - a.amount);
	const liabilities = (data.liabilities || []).sort((a,b) => b.amount - a.amount);

	summarySection.innerHTML = renderSummary(summary);

	let showLog = false;
	if(document.location.href.includes('fiug.dev')){
		showLog = true;
	}

	assetsGrid.innerHTML = assets.filter((x) => !x.hidden).length
		? assets
				.filter((x) => !x.hidden)
				.map(x => ({ ...x, showLog }))
				.map(formatCard)
				.join('')
		: `<div class="card no-data">No data</div>`;

	liabilitiesGrid.innerHTML = liabilities.filter((x) => !x.hidden).length
		? liabilities
				.filter((x) => !x.hidden)
				.map(x => ({ ...x, showLog }))
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
			return parsed
		} catch {
			console.warn('Invalid JSON in localStorage.');
		}
	} else {
		return { assets: [], liabilities: [] };
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
			const jsonURL = USE_ENCRYPTED ? 'accounts.encrypted.json' : 'accounts.json'
			const response = await fetch(jsonURL, { cache: 'no-store' });
			if (response.ok) {
				fetchedLocal = await response.json();
			}
		} catch (err) {
			console.info(`${jsonURL} not available:`, err);
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
				if(USE_ENCRYPTED){
					const username = prompt('Enter your username');
					const password = prompt('Enter your password');
					const decrypted = await decryptJson(fetchedLocal, username, password);
					if(decrypted?.error) return;
					localStorage.setItem(LS_KEY, JSON.stringify(decrypted));
				} else {
					localStorage.setItem(LS_KEY, JSON.stringify(fetchedLocal))
				} 
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

	const pageData = loadFromLocalStorage();
	if(pageData){
		populate(pageData);
	}
	await setUpFileControls();
});
