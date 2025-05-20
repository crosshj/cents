const USERNAME = 'harrison';
const PASSWORD = 'password';

// ENCRYPT
export async function encryptJson(json, username, password) {
	try {
		const enc = new TextEncoder();
		const plaintext = enc.encode(JSON.stringify(json));
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));

		const baseKey = await crypto.subtle.importKey(
			'raw',
			enc.encode(username + password),
			{ name: 'PBKDF2' },
			false,
			['deriveKey']
		);

		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100_000,
				hash: 'SHA-256',
			},
			baseKey,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt']
		);

		const encrypted = await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv },
			key,
			plaintext
		);

		return {
			salt: btoa(String.fromCharCode(...salt)),
			iv: btoa(String.fromCharCode(...iv)),
			data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
		};
	} catch(e){
		return { error: e.message }
	}
}

// use this to get file contents for encrypted file
// const plain = await fetch('accounts.json').then(x => x.json());
//console.log(JSON.stringify(plain, null, '\t'));
// const encryptedPlain = await encryptJson(plain, USERNAME, PASSWORD);
// console.log(JSON.stringify(encryptedPlain, null, '\t'));


// DECRYPT
export async function decryptJson(encrypted, username, password) {
	try {
		const dec = new TextDecoder();
		const enc = new TextEncoder();

		const salt = Uint8Array.from(atob(encrypted.salt), c => c.charCodeAt(0));
		const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));
		const rawData = Uint8Array.from(atob(encrypted.data), c => c.charCodeAt(0));

		const baseKey = await crypto.subtle.importKey(
			'raw',
			enc.encode(username + password),
			{ name: 'PBKDF2' },
			false,
			['deriveKey']
		);

		const key = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100_000,
				hash: 'SHA-256',
			},
			baseKey,
			{ name: 'AES-GCM', length: 256 },
			false,
			['decrypt']
		);

		const decrypted = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv },
			key,
			rawData
		);

		return JSON.parse(dec.decode(decrypted));
	} catch(e){
		return { error: e.message }
	}
}

// const encrypted = await fetch('accounts.encrypted.json').then(x => x.json());
// console.log(JSON.stringify({encrypted}, null, '\t'));
// const decrypted = await decryptJson(encrypted, USERNAME, PASSWORD);
// console.log(JSON.stringify({decrypted}, null, '\t'));
