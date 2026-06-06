
export default responseMiddleware = (req, res, next) => {

    req.startTime = Date.now();

    next();
};

