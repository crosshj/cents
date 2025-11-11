import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import * as framework from 'https://cdn.jsdelivr.net/npm/@crosshj/html-next@latest/dist/htmlNext.min.js';
import helpers from 'https://cdn.jsdelivr.net/npm/@crosshj/html-next@latest/dist/htmlNext.helpers.js';
// import helpers from '../vendor/htmlNext.helpers.js';
// import * as framework from '../vendor/htmlNext.min.js';

import { setupAccounts } from './accounts.js';

export const setupMain = async () => {
	const auth = authSetup();
	const { data: { session } = {} } = await auth.getSession();

	// basic framework setup
	const logoHTML = document.getElementById('logoHTML').innerHTML;
	const getFragment = async (path) => await fetch(`./fragments/${path}.html`);
	const getData = async (path) => await fetch(`./data/${path}`);
	const defaultHash = '/dashboard';
	const { SetData, GetData } = framework;
	const accountsInit = await setupAccounts({
		supabase: auth.supabase,
		SetData,
		GetData,
		auth,
		session,
	});

	// that's it! initialize the framework
	await helpers.pages.enhanced({
		framework,
		initialState: { ...accountsInit.initialState },
		logoHTML,
		defaultHash,
		authSetup: () => auth,
		getFragment,
		getData,
		getMenu: getMenuItems,
	});
};

function getMenuItems({ user } = {}) {
	const userName = user?.email || 'User Profile';
	const userAvatar = user?.user_metadata?.avatar || './images/test_user.jpg';
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
			label: userName,
			avatar: userAvatar,
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
}

function authSetup() {
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
}
