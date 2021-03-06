const env = process.env;
const config = {
    portOrSocket: env.DOC_FEEDBACK_HANDLERS_PORT || env.port || 8090,
    pathPrefix: env.DOC_FEEDBACK_PATH_PREFIX || 'doc-feedback',

    // sessionSecret: 'FEEDBACK_REPLACE_ME_WITH_RANDOM_STRING',
    // langs: env.DOC_FEEDBACK_LANGS ? env.DOC_FEEDBACK_LANGS.split(',') : ['ru', 'en'],
    // defaultLang: env.DOC_FEEDBACK_DEFAULT_LANG || 'ru',

    // ghAPI: 'https://api.github.com'
};

let secretConfig;

try {
    secretConfig = require('./secret-config');
} catch (err) {
    console.error('No "secret-config.js" file found...');
}

const resultConfig = Object.assign({}, secretConfig, config);

// resultConfig.github || (resultConfig.github = {});

// env.DOC_FEEDBACK_TOKENS && (resultConfig.github.tokens = env.DOC_FEEDBACK_TOKENS.split(','));
// env.DOC_FEEDBACK_CLIENT_ID && (resultConfig.github.clientID = env.DOC_FEEDBACK_CLIENT_ID);
// env.DOC_FEEDBACK_CLIENT_SECRET && (resultConfig.github.clientSecret = env.DOC_FEEDBACK_CLIENT_SECRET);
// resultConfig.github.authCallbackSite = env.DOC_FEEDBACK_AUTH_CALLBACK_SITE || '';

env.DOC_FEEDBACK_MONGO_URL && (resultConfig.mongo = env.DOC_FEEDBACK_MONGO_URL);

module.exports = resultConfig;
