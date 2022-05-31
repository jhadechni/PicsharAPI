const defaultRoutes = require('./defaultRoutes')

const routes = (app) => {
    app.use('/', defaultRoutes)
};

module.exports = routes