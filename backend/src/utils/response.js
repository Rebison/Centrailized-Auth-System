/**
 * 
 * @param {object} res - Express response object to send the response to the client
 * @param {Boolean} success - success status of the response either `true` or `false`
 * @param {object|null} data - data to be sent in the response, can be `null` if there's no data to send
 * @param {String} message - message describing the response, can be used for both success and error messages
 * @param {Number} statusCode - HTTP status code for the response, defaults to `200 (OK)` if not provided
 * @returns 
 */
export const sendResponse = (
    res,
    success,
    data,
    message,
    statusCode = 200
) => {
    const responseBody = {
        success,
        message,
        data,
    };

    res.locals.body = responseBody;

    return res.status(statusCode).json(responseBody);
};