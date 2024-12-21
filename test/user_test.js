const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const app = require("../testApp");

jest.mock("../middleware/jwt", () => {
    return {
        restrict: jest.fn((req, res, next) => {
            req.user = {
                id: 1,
                email: "devialdiuser@mail.com",
                role: "user",
            };
            next();
        }),
    };
});

let authToken;

describe("User Controller API Integration Tests", () => {
    beforeAll(async () => {
        await prisma.user.create({
            data: {
                name: "Devialdi Maisa Putra",
                email: "devialdiuser@mail.com",
                phoneNumber: "1234567890",
                password: "password321",
                isActive: true,
                role: "user",
            },
        });

        const secretKey = process.env.JWT_SECRET;
        authToken = jwt.sign(
            { id: 1, email: "devialdiuser@mail.com", role: "user" },
            secretKey
        );
    });

    afterAll(async () => {
        await prisma.bookingPassenger.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.booking.deleteMany();
        
        await prisma.user.deleteMany();
    });

    it("GET /api/users should retrieve all users", async () => {
        const response = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("200");
        expect(response.body.data).toBeInstanceOf(Array);
    });

    it("GET /api/users/email should retrieve a user by email", async () => {
        const response = await request(app)
            .get(`/api/users/email?email=devialdiuser@mail.com`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("200");
        expect(response.body.data.email).toBe("devialdiuser@mail.com");
    });

    it("PUT /api/users should update a user", async () => {
        const updatedUserData = {
            name: "Updated Name",
            email: "devialdiuser@mail.com",
            phoneNumber: "9876543210",
        };

        const response = await request(app)
            .put("/api/users")
            .set("Authorization", `Bearer ${authToken}`)
            .query({ email: "devialdiuser@mail.com" })
            .send(updatedUserData);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("200");
        expect(response.body.data.name).toBe(updatedUserData.name);
        expect(response.body.data.phoneNumber).toBe(updatedUserData.phoneNumber);
    });

    it("DELETE /api/users should deactivate a user", async () => {
        const response = await request(app)
            .delete("/api/users")
            .set("Authorization", `Bearer ${authToken}`)
            .query({ email: "devialdiuser@mail.com"});

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("200");

        const user = await prisma.user.findUnique({
            where: { email: "devialdiuser@mail.com"},
        });
        expect(user.isActive).toBe(false);
    });
});