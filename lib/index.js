import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
	initializeFramework,
	SetData,
	Router,
	Trigger,
} from '../vendor/htmlNext.min.js';
import {
	getAccounts,
	saveAccounts,
	updateAndSaveAccounts,
	calculateSummary,
} from './accounts.js';

const fallback404 = () => document.getElementById('fallback404').innerHTML;

const getMenuItems = ({ user } = {}) => {
	const menuItems = [
		{
			label: 'Dashboard',
			icon: 'fa-tasks',
			path: '/dashboard',
		},
		{
			label: 'Assets',
			icon: 'fa-money',
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
			label: user?.email || 'User Profile',
			avatar: './images/test_user.jpg',
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
	return menuItems;
};

const cache = new Map();
const fetchFragment = async (path) => {
	if (path === '404') {
		return fallback404();
	}
	if (cache.has(path)) return cache.get(path);
	try {
		const response = await fetch(`./fragments/${path}`);
		const result = await response.text().then((x) => x.trim());
		if (!result.trim()) {
			throw new Error('Fragment not found');
		} else {
			cache.set(path, result.trim());
			return result.trim();
		}
	} catch (error) {
		console.error(`Failed to fetch fragment from ${path}:`, error);
		return fallback404();
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

	const handleNavigation = async () => {
		SetData('mainContent', '');
		const newHash = window.location.hash || '#/dashboard';
		const newPath = newHash.replace(/^#/, '');
		await SetData('activePath', newPath);
		const content = await fetchFragment(newPath.replace(/^\//, ''));
		await SetData('mainContent', content);
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

	return Router({
		initialPath,
		beforeEach,
	});
};

export const authSetup = () => {
	const SUPABASE_URL = 'https://milxguwisdbbftfhbxwm.supabase.co';
	const SUPABASE_ANON_KEY =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbHhndXdpc2RiYmZ0ZmhieHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzE2NTcsImV4cCI6MjA3NzcwNzY1N30.t7tiWAz84z-OO_bDxkNwJPbmxkrsqcljfj36MCCeHpA';
	const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
		},
	});
	const emailRedirectTo =
		location.origin === 'https://cents.crosshj.com'
			? 'https://cents.crosshj.com/auth/callback'
			: `http://localhost:3312/auth/callback`;
	const signUp = (email, password) =>
		supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo },
		});

	const signIn = (email, password) =>
		supabase.auth.signInWithPassword({ email, password });

	const signOut = () => {
		supabase.auth.signOut();
		localStorage.removeItem('sm-milxguwisdbbftfhbxwm-auth-token');
	};

	const getSession = () => supabase.auth.getSession();

	const onAuthChange = (cb) =>
		supabase.auth.onAuthStateChange((_event, session) => cb(session));

	const updateUserMetadata = async (metadata) =>
		supabase.auth.updateUser({ data: metadata });

	return {
		signUp,
		signIn,
		signOut,
		getSession,
		onAuthChange,
		updateUserMetadata,
		supabase, // Expose supabase client for direct access if needed
	};
};

export const setupMain = async () => {
	setTheme();
	window.setTheme = setTheme;
	const router = await routerSetup();

	const auth = authSetup();
	window.auth = auth;
	// Expose saveAccounts globally for use in pages
	window.saveAccounts = (userId, data) =>
		saveAccounts(auth.supabase, userId, data);
	// Expose updateAndSaveAccounts globally for use in pages
	window.updateAndSaveAccounts = (userId, rawData) =>
		updateAndSaveAccounts(auth.supabase, userId, rawData);
	const { data: { session } = {} } = await auth.getSession();
	// console.log({ session });

	// Test accounts.js database access - fetch only (proves read works)
	const accounts = await getAccounts(
		window.auth?.supabase,
		session?.user?.id
	);
	const appContent = await fetchFragment(session ? '_app' : '_auth');
	const menuItems = getMenuItems({ user: session?.user });
	const newHash = window.location.hash || '#/dashboard';
	const newPath = newHash.replace(/^#/, '');
	const menuItemSelected = menuItems.findIndex(
		(item) => item.path === newPath
	);

	const rawData = accounts.rawAccountsData || {
		assets: [],
		liabilities: [],
	};
	// Calculate summary on the fly from raw data
	const summary = calculateSummary(rawData);

	const state = {
		appContent,
		accountsSummary: summary,
		accountsAssets: accounts.assets,
		accountsLiabilities: accounts.liabilities,
		accountsRawData: rawData,
		mainContent: '',
		menuItems,
		menuItemSelected,
		themeSettings: {
			mode: document.documentElement.classList.contains('dark')
				? 'dark'
				: 'light',
		},
		contentLoaded: false,
	};
	const hooks = {};
	await initializeFramework({ router, state, hooks });

	// Expose function to refresh accounts data in state
	window.refreshAccountsData = async () => {
		const { data: { session } = {} } = await window.auth.getSession();
		const updatedAccounts = await getAccounts(
			window.auth?.supabase,
			session?.user?.id
		);
		await SetData('accountsAssets', updatedAccounts.assets);
		await SetData('accountsLiabilities', updatedAccounts.liabilities);
		const rawData = updatedAccounts.rawAccountsData || {
			assets: [],
			liabilities: [],
		};
		await SetData('accountsRawData', rawData);
		// Calculate summary on the fly from raw data
		const summary = calculateSummary(rawData);
		await SetData('accountsSummary', summary);
	};

	document.body.classList.add('framework-loaded');
};
