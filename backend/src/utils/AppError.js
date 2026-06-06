
export const ERROR_TYPES = Object.freeze({
    VALIDATION: "validation_error",
    AUTH: "auth_error",
    PERMISSION: "permission_error",
    NOT_FOUND: "not_found_error",
    CONFLICT: "conflict_error",
    LOCKED: "locked_error",
    RATE_LIMIT: "rate_limit_error",
    EXTERNAL: "external_error",
    INTERNAL: "internal_error",
});

class AppError extends Error {
    constructor({
        message,
        statusCode = 500,
        type = ERROR_TYPES.INTERNAL,
        code = "INTERNAL_ERROR",
        details = null,
    }) {
        super(message);

        this.statusCode = statusCode;
        this.type = type;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    // 🔹 Mongo Cast Error
    static castError(err) {
        return new AppError({
            message: `Invalid ${err.path}`,
            statusCode: 400,
            type: ERROR_TYPES.VALIDATION,
            code: "INVALID_FIELD",
            details: { field: err.path, value: err.value },
        });
    }

    /**
     * Creates an AppError instance representing a "Bad Request" error, typically used when the client sends invalid or incomplete data in an API request. This method allows for a standardized way to generate error responses for various validation issues, such as missing required fields, invalid formats, or other client-side errors.
     * @param {string} message - Error message to be returned to the client 
     * @param {Object|null} details - Optional additional details about the error (e.g., validation errors, field info, etc.)
     * @returns - An instance of AppError with the provided message and details, ready to be thrown or returned in an API response.
     */
    static badRequest(message = "Bad Request", details = null) {
        return new AppError({
            message,
            statusCode: 400,
            type: ERROR_TYPES.VALIDATION,
            code: "BAD_REQUEST",
            details
        });
    }

    /**
     * Creates an AppError instance representing a "File Upload" error, typically used when the client fails to upload a file.
     * @param {string} message - Error message to be returned to the client
     * @param {Object|null} details - Optional additional details about the error
     * @returns - An instance of AppError with the provided message and details, ready to be thrown or returned in an API response.
     */
    static fileUpload(message = "File upload failed", details = null) {
        return new AppError({
            message,
            statusCode: 400,
            type: ERROR_TYPES.VALIDATION,
            code: "FILE_UPLOAD_ERROR",
            details,
        });
    }

    static validation(errors) {
        return new AppError({
            message: "Validation failed",
            statusCode: 400,
            type: ERROR_TYPES.VALIDATION,
            code: "VALIDATION_ERROR",
            details: errors
        });
    }

    // 🔹 JWT Expired
    static expiredJwt() {
        return new AppError({
            message: "JWT expired, please login again",
            statusCode: 401,
            type: ERROR_TYPES.AUTH,
            code: "TOKEN_EXPIRED",
        });
    }

    // 🔹 JWT Invalid
    static invalidJwt() {
        return new AppError({
            message: "Invalid JWT, please login again",
            statusCode: 401,
            type: ERROR_TYPES.AUTH,
            code: "INVALID_TOKEN",
        });
    }

    static unauthorized(message = "Unauthorized", details = null) {
        return new AppError({
            message,
            statusCode: 401,
            type: ERROR_TYPES.AUTH,
            code: "UNAUTHORIZED",
            details
        });
    }

    static forbidden(message = "Forbidden", details = null) {
        return new AppError({
            message,
            statusCode: 403,
            type: ERROR_TYPES.PERMISSION,
            code: "FORBIDDEN",
            details
        });
    }

    /**
     * Creates an AppError instance representing a "Not Found" error for a specific resource. This method is useful for standardizing the error response when a requested resource (e.g., user, product, etc.) cannot be found in the database or does not exist.
     * @param {string} resource - The resource that was not found
     * @param {object|null} details - Optional additional details about the error
     * @returns - An instance of AppError indicating the resource was not found
     */
    static notFound(resource = "Resource Not Found", details = null) {
        return new AppError({
            message: `${resource}`,
            statusCode: 404,
            type: ERROR_TYPES.NOT_FOUND,
            code: "NOT_FOUND",
            details
        });
    }



    static conflict(message = "Conflict") {
        return new AppError({
            message,
            statusCode: 409,
            type: ERROR_TYPES.CONFLICT,
            code: "CONFLICT",
        });
    }

    /**
     * Handles MongoDB duplicate key errors and converts them into a standardized AppError format.
     * @param {object} err - The original error object thrown by MongoDB, which contains information about the duplicate key violation (e.g., the field and value that caused the conflict).
     * @returns - An instance of AppError with a 409 status code, a conflict error type, and a message indicating which field and value caused the duplication issue. The details property includes the specific field and value for easier debugging and client-side handling.
     */
    static duplicateKey(err) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];

        return new AppError({
            message: `${field} "${value}" already exists`,
            statusCode: 409,
            type: ERROR_TYPES.CONFLICT,
            code: "DUPLICATE_KEY",
            details: { field, value },
        });
    }

    static locked(message = "Resource is locked", details = null) {
        return new AppError({
            message,
            statusCode: 423,
            type: ERROR_TYPES.LOCKED,
            code: "RESOURCE_LOCKED",
            details,
        });
    }

    static tooManyRequests(message = "Too Many Requests", details = null) {
        return new AppError({
            message,
            statusCode: 429,
            type: ERROR_TYPES.RATE_LIMIT,
            code: "TOO_MANY_REQUESTS",
            details,
        });
    }

    static internal(message = "Internal Server Error") {
        return new AppError({
            message,
            statusCode: 500,
            type: ERROR_TYPES.INTERNAL,
            code: "INTERNAL_ERROR",
        });
    }

    static jobFailed(jobName, reason = "Job failed") {
        return new AppError({
            message: `Job "${jobName}" failed`,
            statusCode: 500,
            type: ERROR_TYPES.INTERNAL,
            code: "JOB_FAILED",
            details: { jobName, reason },
        });
    }

    static queueError(queueName, reason = "Queue error") {
        return new AppError({
            message: `Queue "${queueName}" error`,
            statusCode: 500,
            type: ERROR_TYPES.INTERNAL,
            code: "QUEUE_ERROR",
            details: { queueName, reason },
        });
    }

    static socketError(message = "Socket error", details = null) {
        return new AppError({
            message,
            statusCode: 500,
            type: ERROR_TYPES.EXTERNAL,
            code: "SOCKET_ERROR",
            details,
        });
    }

    static externalService(message = "External service failed", details = null) {
        return new AppError({
            message,
            statusCode: 502,
            type: ERROR_TYPES.EXTERNAL,
            code: "EXTERNAL_SERVICE_ERROR",
            details,
        });
    }

    static timeout(message = "Operation timed out", details = null) {
        return new AppError({
            message,
            statusCode: 504,
            type: ERROR_TYPES.EXTERNAL,
            code: "TIMEOUT",
            details,
        });
    }
}

export default AppError;
