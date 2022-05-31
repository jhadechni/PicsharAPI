const defaultRoutes = require('./defaultRoutes')
const userRoutes = require('./userRoutes')

const routes = (app) => {
    app.use('/', defaultRoutes),
    app.use('/users', userRoutes)
};

module.exports = routes