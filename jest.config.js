export default {
	testEnvironment: 'node',
	testMatch: ['**/*.test.js'],
	collectCoverageFrom: ['src/**/*.js', '!**/*.test.js'],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
};
