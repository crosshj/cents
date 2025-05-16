const LS_KEY = 'financeData';

const formatCard = (item) => {
	const fields = [];

	if (item.status) fields.push(item.status);
	if (item.date) fields.push(item.date);
	if (item.occurence) fields.push(`⟳ ${item.occurence}`);
	if (item.total_owed) fields.push(`Owed: $${item.total_owed}`);
	if (item.auto) fields.push("Auto");
	if (item.apr) fields.push(`APR: ${item.apr}%`);
	if (item.aprCash) fields.push(`Cash APR: ${item.aprCash}%`);
	if (item.notes || item.note) fields.push((item.notes || item.note).split('\n')[0]);
	if (item.website) fields.push(`<a href="${item.website}" target="_blank">Link</a>`);
	if (item.website2) fields.push(`<a href="${item.website2}" target="_blank">Link2</a>`);
	if (item.website3) fields.push(`<a href="${item.website3}" target="_blank">Link3</a>`);

	if (Array.isArray(item.items)) {
		const sub = item.items.map(i => i.title).join(', ');
		fields.push(`Includes: ${sub}`);
	}

	return `
		<div class="card">
			<h3>${item.title || "Untitled"}</h3>
			<div class="amount">$${parseFloat(item.amount || 0).toFixed(2)}</div>
			<div class="small">${fields.join(" · ")}</div>
		</div>
	`;
};


const populate = (data) => {
	const balanceGrid = document.getElementById("balanceGrid");
	const assetsGrid = document.getElementById("assetsGrid");
	const liabilitiesGrid = document.getElementById("liabilitiesGrid");

	balanceGrid.innerHTML = (data.balance || []).map(formatCard).join("");
	assetsGrid.innerHTML = (data.assets || []).filter(x => !x.hidden || x.hidden === false).map(formatCard).join("");
	liabilitiesGrid.innerHTML = (data.liabilities || []).filter(x => !x.hidden || x.hidden === false).map(formatCard).join("");
};

const loadFromLocalStorage = () => {
	const raw = localStorage.getItem(LS_KEY);
	if (raw) {
		try {
			const parsed = JSON.parse(raw);
			populate(parsed);
		} catch {
			console.warn("Invalid JSON in localStorage.");
		}
	}
};

document.getElementById("fileInput").addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (evt) => {
		try {
			const json = JSON.parse(evt.target.result);
			localStorage.setItem(LS_KEY, JSON.stringify(json));
			populate(json);
		} catch {
			alert("Invalid JSON file.");
		}
	};
	reader.readAsText(file);
});

loadFromLocalStorage();
