const errorHandler = (err, req, res, next) => {
    //TODO: return errors that match content type requested (JSON vs HTML)
    console.log('--- express error ---');
    console.error(err.stack);
    res.status(500).send('Something broke!');
};

module.exports = errorHandler;
