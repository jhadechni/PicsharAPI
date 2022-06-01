const defaultRoutes = require('./defaultRoutes');
const userRoutes = require('./userRoutes');
const followRoutes = require('./defaultRoutes');

const routes = (app) => {
    app.use('/', defaultRoutes),
    app.use('/users', userRoutes),
    app.use('/follows', followRoutes)
};

module.exports = routes