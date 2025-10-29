import {
	initializeFramework,
	SetData,
	Router,
	Trigger,
} from 'https://cdn.jsdelivr.net/npm/@crosshj/html-next@latest/dist/htmlNext.min.js';

const fallback404 = document.getElementById('fallback404').innerHTML;

const cache = new Map();
const fetchPage = async (path) => {
	if (path === '404') {
		return fallback404;
	}
	if (cache.has(path)) return cache.get(path);
	try {
		const response = await fetch(`./pages/${path}`);
		const result = await response.text().then((x) => x.trim());
		if (!result.trim()) {
			throw new Error('Page not found');
		} else {
			cache.set(path, result.trim());
			return result.trim();
		}
	} catch (error) {
		console.error(`Failed to fetch page from ${path}:`, error);
		return fallback404;
	}
};
const fetchData = async (path, defaultValue = {}) => {
	if (cache.has(path)) return cache.get(path);
	try {
		const response = await fetch(`./data/${path}`);
		const result = await response.json();
		cache.set(path, result);
		return result;
	} catch (error) {
		console.error(`Failed to fetch JSON from ${path}:`, error);
		return defaultValue;
	}
};
const setTheme = function (themeMode) {
	const storedTheme = localStorage.getItem('theme-mode');
	if (!themeMode) {
		if (!storedTheme) {
			const prefersDark = window.matchMedia(
				'(prefers-color-scheme: dark)'
			).matches;
			themeMode = prefersDark ? 'dark' : 'light';
		} else {
			themeMode = storedTheme;
		}
	}
	if (!document.documentElement.classList.contains(themeMode)) {
		document.documentElement.classList.remove('light');
		document.documentElement.classList.remove('dark');
		document.documentElement.classList.add(themeMode);
	}
	if (storedTheme !== themeMode) {
		localStorage.setItem('theme-mode', themeMode);
	}
	const metaThemeColor = document.getElementById('theme-color-meta');
	if (metaThemeColor) {
		const newContent = themeMode === 'dark' ? '#101217' : '#fcfcfc';
		if (metaThemeColor.getAttribute('content') !== newContent) {
			metaThemeColor.setAttribute('content', newContent);
		}
	}
};
const routerSetup = async () => {
	const initialHash = window.location.hash || '#/dashboard';
	const initialPath = initialHash.replace(/^#/, '');

	// Handle hash changes and browser back/forward
	const handleNavigation = async () => {
		SetData('mainContent', '');
		const newHash = window.location.hash || '#/dashboard';
		const newPath = newHash.replace(/^#/, '');
		await SetData('activePath', newPath);
		const content = await fetchPage(newPath.replace(/^\//, ''));
		await SetData('mainContent', content);
		document.querySelectorAll('.menuItem.active').forEach((item) => {
			item.classList.remove('active');
		});
		const menuItems = document.querySelectorAll('.menuItem');
		for (const item of menuItems) {
			const href = item.getAttribute('href');
			if (!newPath.startsWith(href)) continue;
			item.classList.add('active');
		}
		document.getElementById('sidebar')?.classList?.remove('open');
	};

	window.addEventListener('hashchange', handleNavigation);

	const beforeEach = async (context) => {
		if (context.to.href === '/logout') {
			cache.clear();
			await Trigger('logout'); //defined in _app.html
			return false;
		}

		if (context.to.href === window.location.hash.replace(/^#/, '')) {
			handleNavigation();
		} else {
			window.location.hash = context.to.path;
		}
	};

	const afterEach = async (context) => {};

	return Router({
		initialPath,
		beforeEach,
		afterEach,
	});
};

(async () => {
	setTheme();
	window.setTheme = setTheme;
	const router = await routerSetup();
	const authToken = localStorage.getItem('authToken');
	const appContent = await fetchPage(authToken ? '_app' : '_auth');
	const menuItems = [
		{
			label: 'Dashboard',
			icon: 'fa-tachometer',
			path: '/dashboard',
		},
		{
			label: 'Assets',
			icon: 'fa-piggy-bank',
			path: '/assets',
		},
		{
			label: 'Debts',
			icon: 'fa-credit-card',
			path: '/debts',
		},
		{ spacer: true },
		{
			path: '/profile',
			label: 'USER PROFILE',
			avatar: './assets/test_user.jpg',
			hasAvatar: true,
		},
		{
			path: '/settings',
			label: 'Settings',
			icon: 'fa-cog',
		},
		{
			path: '/logout',
			label: 'Logout',
			icon: 'fa-sign-out',
		},
	];
	const state = {
		appContent,
		mainContent: '',
		menuItems,
		themeSettings: {
			mode: document.documentElement.classList.contains('dark')
				? 'dark'
				: 'light',
		},
		contentLoaded: false,
	};
	const hooks = {};
	await initializeFramework({ router, state, hooks });
	document.body.classList.add('framework-loaded');
})();
