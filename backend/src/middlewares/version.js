export default version = (targetVersion) => (req, res, next) => {
  const clientVersion = req.headers["x-version"];

  if (clientVersion === targetVersion) {
    return next();
  }
  return next("route");
};