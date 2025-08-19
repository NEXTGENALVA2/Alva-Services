module.exports = {
	i18n: {
		defaultLocale: 'bn',
		locales: ['en', 'bn', 'hi', 'ar', 'fr'],
		localeDetection: false,
		defaultNS: 'common'
	},
	reloadOnPrerender: process.env.NODE_ENV === 'development',
};
