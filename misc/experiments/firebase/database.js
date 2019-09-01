(function(){
	// Initialize Firebase
	var config = {
		apiKey: "<your api key here>",
		authDomain: "centsv1-db5cd.firebaseapp.com",
		databaseURL: "https://centsv1-db5cd.firebaseio.com",
		storageBucket: "centsv1-db5cd.appspot.com",
		messagingSenderId: "135911048684"
	};
	firebase.initializeApp(config);

	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('https://www.googleapis.com/auth/plus.login');

	function signIn(){
		firebase.auth().signInWithPopup(provider).then(function(result) {
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;
			localStorage.setItem('user', JSON.stringify(result.user));
			localStorage.setItem('token', JSON.stringify(result.credential.accessToken));
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			console.log(error);
		});
	}

	// AUTO SIGN-IN
	// firebase.auth().onAuthStateChanged(function(user) {
	// 	var storedUser = JSON.parse(localStorage.getItem('user'));
	// 	user = user || storedUser || null;
	// 	if (user) {
	// 		// User is signed in.
	// 	} else {
	// 		// No user is signed in.
	// 		signIn();
	// 	}
	// });

	function signOut(){
		var user = JSON.parse(localStorage.getItem('user')) || null;
		if(!user) {
			return console.log('ERROR: not signed in');
		}

		firebase.auth().signOut().then(function() {
			localStorage.removeItem('user');
			console.log('Sign-out successful.');
		}, function(error) {
			console.log('An error happened.');
		});
	}

	function doDatabase(read, write){
		var user = JSON.parse(localStorage.getItem('user')) || null;
		if(!user) {
			return console.log('ERROR: not signed in');
		}
		var db = firebase.database();
		var dataToSet = localStorage.getItem('accounts') || MAIN_DATA;

		function writeUserData(demoId, data) {
			db.ref('demo/' + demoId).set(data).then(function(snapshot) {
				console.log('Write SUCCESS');
			})
			.catch(function(error) {
				console.log('Write FAIL');
				console.log(error);
			});
		}

		function readUserData(demoId) {
			db.ref('demo/' + demoId).once('value').then(function(snapshot) {
				console.log('Read SUCCESS');
				console.log(snapshot.val());
			})
			.catch(function(error) {
				console.log('Read FAIL');
				console.log(error);
			});
		}

		if(write) writeUserData(user.email.split('@')[0].replace('.', ''), dataToSet);
		if(read) readUserData(user.email.split('@')[0].replace('.', ''));
	}

	function readDatabase(){ doDatabase(true, false); }
	function writeDatabase(){ doDatabase(false, true); }

	// to allow use of node syntax and potentially enable interop going forward
	module = (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
		? module
		: { exports: undefined };

	var Database = {
		signIn,
		signOut,
		read: readDatabase,
		write: writeDatabase
	};

	if (window){
		window.Database = Database;
	}

	module.exports = Database;
})();
