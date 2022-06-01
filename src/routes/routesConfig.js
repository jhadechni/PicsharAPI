const defaultRoutes = require('./defaultRoutes');
const userRoutes = require('./userRoutes');
const followRoutes = require('./followRoutes');
const postRoutes = require('./postRoutes');

const routes = (app) => {
    app.use('/', defaultRoutes),
    app.use('/users', userRoutes),
    app.use('/follows', followRoutes)
    app.use('/posts', postRoutes)
};

module.exports = routes