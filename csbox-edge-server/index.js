const path = require('path')
require('dotenv').config()
// Require Provider
const lti = require('ltijs').Provider
const Database = require('ltijs-sequelize')

// Setup ltijs-sequelize using the same arguments as Sequelize's generic contructor
const db = new Database('database', 'user', 'password',
    {
        host: 'db',
        dialect: 'postgres',
        logging: true
    })

// Setup provider
lti.setup(process.env.LTI_KEY, // Key used to sign cookies and tokens
    {
        plugin: db // Passing db object to plugin field
    },
    { // Options
        appRoute: '/', loginRoute: '/login', // Optionally, specify some of the reserved routes
        cookies: {
            secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
            sameSite: 'None' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
        },
        devMode: true // Set DevMode to true if the testing platform is in a different domain and https is not being used
    }
)

// Set lti launch callback
lti.onConnect((token, req, res) => {
    console.log(token)
    return res.send('It\'s alive!')
})

const setup = async () => {
    // Deploy server and open connection to the database
    await lti.deploy({ port: 3000 }) // Specifying port. Defaults to 3000


}

setup()