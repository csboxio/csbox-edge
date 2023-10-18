require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')

const lti = require('ltijs').Provider
const Database = require('ltijs-sequelize')


// Setup ltijs-sequelize using the same arguments as Sequelize's generic contructor
const db = new Database('database', 'user', 'password',
    {
        host: 'localhost',
        dialect: 'postgres',
        logging: false
    })

// Setup
lti.setup('LTIKEY', // Key used to sign cookies and tokens
    {
        plugin: db // Passing db object to plugin field
    },
    { // Options
        appRoute: '/', loginRoute: '/login', // Optionally, specify some of the reserved routes
        cookies: {
            secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
            sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
        },
        devMode: false // Set DevMode to true if the testing platform is in a different domain and https is not being used
    }
)

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
    console.log(token)
    return res.sendFile(path.join(__dirname, './public/index.html'))
})

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
    return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
    await lti.deploy({ port: process.env.PORT })

    // Register platform
    await lti.registerPlatform({
        url: 'https://platform.url',
        name: 'Platform Name',
        clientId: 'TOOLCLIENTID',
        authenticationEndpoint: 'https://platform.url/auth',
        accesstokenEndpoint: 'https://platform.url/token',
        authConfig: { method: 'JWK_SET', key: 'https://platform.url/keyset' }
    })
}

setup()