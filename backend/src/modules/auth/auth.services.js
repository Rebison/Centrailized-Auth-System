import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'
import User from '../user/user.schema';
import AppError from '../../utils/AppError';


class AuthService {

    async loginV1({ email, password }) {
        if (!email || !password) {
            throw AppError.badRequest("Required data is missing");
        }

        const user = await User.findOne({ email, deletedAt: null }).select("+password");

        if (!user) {
            throw AppError.badRequest("Invalid email or password");
        }

        if (!user.isActive) {
            throw AppError.badRequest("User is not active");
        }

        if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
            throw AppError.locked("Account is locked due to multiple failed login attempts. Please try again later.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await this.handleFailedLoginAttempt(user);
            throw AppError.unauthorized("Invalid email or password");
        }

        await this.resetLoginAttempts(user);


        // Change the following line of code consider making it separate service for generating token
        const token = jwt.sign(
            { userType: user.userType, role: user.role, id: user._id, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // It should be returning access token and refresh token both, but for now we are only returning access token
        return token;
    }

    static MAX_ATTEMPTS = 5;
    static LOCK_TIME = 15 * 60 * 1000;

    async handleFailedLoginAttempt(user) {

        user.loginAttempts += 1;
        user.loginLastAttempt = new Date();

        if (user.loginAttempts >= MAX_ATTEMPTS) {
            user.isLocked = true;
            user.lockUntil = new Date(new Date().getTime() + LOCK_TIME);
        }

        await user.save();
    }

    async resetLoginAttempts (user) {
        user.loginAttempts = 0;
        user.loginLastAttempt = null;
        user.isLocked = false;
        user.lockUntil = null;

        await user.save();
    };

    async getMeV1(userId) {
        const user = await User.findById(userId).select("-password -__v -deletedAt");

        if (!user) {
            throw AppError.notFound("User not found");
        }

        return user;
    }

    async 
}