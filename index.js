const LS_KEY = 'financeData';

const formatCard = (item) => {
	if (item.hidden || item.type === 'seperator-def' || item.type === 'group')
		return '';

	const amount = parseFloat(item.amount || 0).toFixed(2);
	const owed =
		item.total_owed && parseFloat(item.total_owed) > 0
			? `$${parseFloat(item.total_owed).toFixed(2)}`
			: '';
	const recurrence = item.occurence || '';
	const auto = item.auto ? `<span class="auto-pill">AUTO</span>` : '';
	const status = item.status || '';
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
			    ${link ? `<div class="links">${link}</div>` : ''}
            </div>

			<div class="money-row">
				<div><span class="amount">$${amount}</span> ${recurrence}</div>
				${owed ? `<div class="owed">Owed: ${owed}</div>` : ''}
			</div>

			${note ? `<div class="note">${note.split('\n')[0]}</div>` : ''}
            ${subItems}
            <div class="meta-bottom">${[status, date]
				.filter(Boolean)
				.join(' · ')}</div>
		</div>
	`;
};

const populate = (data) => {
	const balanceGrid = document.getElementById('balanceGrid');
	const assetsGrid = document.getElementById('assetsGrid');
	const liabilitiesGrid = document.getElementById('liabilitiesGrid');

	balanceGrid.innerHTML = (data.balance || []).map(formatCard).join('');
	assetsGrid.innerHTML = (data.assets || [])
		.filter((x) => !x.hidden || x.hidden === false)
		.map(formatCard)
		.join('');
	liabilitiesGrid.innerHTML = (data.liabilities || [])
		.filter((x) => !x.hidden || x.hidden === false)
		.map(formatCard)
		.join('');
};

const loadFromLocalStorage = () => {
	const raw = localStorage.getItem(LS_KEY);
	if (raw) {
		try {
			const parsed = JSON.parse(raw);
			populate(parsed);
		} catch {
			console.warn('Invalid JSON in localStorage.');
		}
	}
};

document.getElementById('fileInput').addEventListener('change', (e) => {
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (evt) => {
		try {
			const json = JSON.parse(evt.target.result);
			localStorage.setItem(LS_KEY, JSON.stringify(json));
			populate(json);
		} catch {
			alert('Invalid JSON file.');
		}
	};
	reader.readAsText(file);
});

loadFromLocalStorage();
