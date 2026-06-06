import { sanitize } from "./sanitize.js";

const omitIfEmpty = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  return Object.keys(obj).length === 0 ? undefined : obj;
};

const formatHTTPLoggerResponse = (req, res, responseBody = {}) => {
  const request = {
    method: req.method,
    url: req.originalUrl,
    clientIp:
      req.headers["x-forwarded-for"] ??
      req.socket.remoteAddress,
  };

  const params = omitIfEmpty(sanitize(req.params));
  const query = omitIfEmpty(sanitize(req.query));
  const body = omitIfEmpty(sanitize(req.body));

  if (params) request.params = params;
  if (query) request.query = query;
  if (body) request.body = body;

  const response = {
    statusCode: res.statusCode,
  };

  if (responseBody && Object.keys(responseBody).length > 0) {
    response.body =
      JSON.stringify(responseBody).length > 1000
        ? "[TRUNCATED]"
        : sanitize(responseBody);
  }

  return {
    request,
    response,
    metadata: {
      requestId: req.requestId || null,
      userId: req?.user?.id || null,
      duration: `${Date.now() - (req.startTime || Date.now())}ms`,
      timestamp: new Date().toISOString(),
    },
  };
};

export default formatHTTPLoggerResponse;