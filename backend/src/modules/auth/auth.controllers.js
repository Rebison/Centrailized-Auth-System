import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import authService from "./auth.services.js";

const AuthService = new authService();

export const loginV1 = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const token = await AuthService.loginV1({ email, password });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, true, null, "User logged in successfully");
});

export const logoutV1 = asyncHandler(async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    sendResponse(res, true, null, "User logged out successfully");
});