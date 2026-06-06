import { v4 as uuidv4 } from "uuid";

export default function requestId() {
  return (req, res, next) => {
    const id = req.headers["X-Request-ID"] || uuidv4();
    req.requestId = id;
    res.setHeader("X-Request-ID", id);
    next();
  };
}
