const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../services/mail");
const app = require("../app");

jest.mock("../services/mail", () => ({
    sendMail: jest.fn(() => Promise.resolve()),
}));

jest.mock("../middleware/jwt", () => ({
    restrict: jest.fn((req, res, next) => {
        req.user = {
            id: 1,
            email: "testingauth@mail.com",
            role: "user",
        };
        next();
    }),
}));

let authToken;
const dummyUser = {
    name: "Test User",
    email: "testuser@mail.com",
    phoneNumber: "1234567890",
    password: "password123",
};

describe("Pengujian API Controller Auth", () => {
    beforeAll(async () => {
        await prisma.user.create({
            data: {
                ...dummyUser,
                password: await bcrypt.hash(dummyUser.password, 10),
            },
        });
    });

    afterAll(async () => {
        await prisma.bookingPassenger.deleteMany();
        await prisma.seat.deleteMany();
        await prisma.booking.deleteMany();
        await prisma.flight.deleteMany();
        await prisma.airports.deleteMany();
        await prisma.city.deleteMany();
        await prisma.airlines.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it("POST /api/register - harus mendaftarkan pengguna baru dan mengirim OTP", async () => {
        const response = await request(app)
            .post("/api/register")
            .send({
                name: "New User",
                email: "newuser@mail.com",
                phoneNumber: "0987654321",
                password: "newpassword",
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("data.otpToken");

        expect(sendMail).toHaveBeenCalled();
        expect(sendMail).toHaveBeenCalledWith(
            expect.any(String),
            "Your OTP Code",
            expect.stringContaining("Your OTP code")
        );
    });

    it("POST /api/verify-otp - harus memverifikasi OTP dan mengaktifkan pengguna", async () => {
        const otpToken = jwt.sign({ email: dummyUser.email, otp: "123456", otpExpiresAt: Date.now() + 60000 }, process.env.JWT_SECRET);

        const response = await request(app)
            .post("/api/verify-otp?token=" + otpToken)
            .send({ otp: "123456" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("OTP verified successfully. Registration complete.");
    });

    it("POST /api/resend-otp - harus mengirimkan OTP ulang", async () => {
        const response = await request(app)
            .post("/api/resend-otp")
            .send({ email: dummyUser.email });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("New OTP sent successfully. Please check your email.");

        expect(sendMail).toHaveBeenCalled();
    });

    it("POST /api/login - harus login berhasil", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({ identifier: dummyUser.email, password: dummyUser.password });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("token");

        authToken = response.body.data.token;
    });

    it("POST /api/forget-password - harus mengirimkan email reset kata sandi", async () => {
        const response = await request(app)
            .post("/api/forget-password")
            .send({ email: dummyUser.email });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Email sent, please check your email to reset the password");

        expect(sendMail).toHaveBeenCalled();
    });

    it("POST /api/reset-password - harus mereset kata sandi pengguna", async () => {
        const resetToken = jwt.sign({ email: dummyUser.email }, process.env.JWT_SECRET);

        const response = await request(app)
            .post("/api/reset-password?token=" + resetToken)
            .send({ password: "newpassword", confirm_password: "newpassword" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Password reset successfully");

        expect(sendMail).toHaveBeenCalled();
    });
});