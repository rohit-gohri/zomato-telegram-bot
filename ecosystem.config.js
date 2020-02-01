/* eslint-disable */

module.exports = {
	/**
	 * Application configuration section
	 * http://pm2.keymetrics.io/docs/usage/application-declaration/
	 */
	apps: [
		{
			name: 'boring-food-bot',
			script: 'dist/index.js',

			out_file: `${__dirname}/logs/food_bot.log`,
			log_date_format: 'DD-MM-YYYY HH:mm:ss:SS Z',
			merge_logs: true,

			instances: 1, // or 0 => 'max'
			exec_mode: 'cluster',

			watch: false,
			kill_timeout: 10000,

			env_production: {
				NODE_ENV: 'production',
			},
			env_development: {
				NODE_ENV: 'development',
			},

			dependencies: ['pm2-logrotate'],
		},
	],

	/**
	 * Deployment section
	 * http://pm2.keymetrics.io/docs/usage/deployment/
	 */
	deploy: {
		boring: {
			user: 'rohit',
			host: 'boring.download',
			ssh_options: ['ForwardAgent=yes'],
			ref: 'origin/master',
			repo: 'https://github.com/rohit-gohri/zomato-telegram-bot.git',
			path: '/home/rohit/food_bot',
			get 'post-deploy'() {
				return 'yarn install --production=false && ' +
					'yarn compile && ' +
					'pm2 reload ecosystem.config.js --env production';
			},
			env: {
				NODE_ENV: 'production',
			},
		},
	},
};

