const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const app = require("../testApp");
const fs = require("fs");

jest.mock("multer", () => {
    return jest.fn().mockImplementation(() => {
        return {
            single: jest.fn((field) => (req, res, next) => {
                req.file = {
                    buffer: Buffer.from('dummy data'),
                    originalname: 'dummy.jpg',
                    size: 1
                };
                next();
            }),
        };
    });
});

jest.mock("imagekit", () => {
    return jest.fn().mockImplementation(() => {
        return {
            upload: jest.fn(() =>
                Promise.resolve({ url: "https://mocked.imagekit.io/image.jpg" })
            ),
        };
    });
});

jest.mock("../middleware/jwt", () => {
    return {
        restrict: jest.fn((req, res, next) => {
            req.user = {
                id: 1,
                email: "devialditest@mail.com",
                role: "admin",
            };
            next();
        }),
    };
});

let authToken;

describe("Airfare API Integration Tests", () => {
    beforeAll(async () => {
        const user = await prisma.user.create({
            data: {
                name: "Devialdi Maisa Putra",
                email: "devialditest@mail.com",
                phoneNumber: "1234567890",
                password: "password123",
                isActive: true,
                role: "admin",
            },
        });

        const secretKey = process.env.JWT_SECRET || "rahasiaMas_Al";

        authToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            secretKey,
            { expiresIn: "9h" }
        );

        await prisma.airlines.create({
            data: { name: "Dummy Airlines" },
        });

        await prisma.city.createMany({
            data: [
                { shortname: "ORC", fullname: "Origin City" },
                { shortname: "DST", fullname: "Destination City" },
            ],
        });

        await prisma.airports.create({
            data: {
                name: "Dummy Airport",
                cityId: 1,
                terminal: "T1",
                continent: "Asia",
            },
        });

        await prisma.flight.create({
            data: {
                airlinesId: 1,
                airportId: 1,
                originCityId: 1,
                destinationCityId: 2,
                departure: new Date("2024-12-20T10:00:00Z"),
                return: new Date("2024-12-25T18:00:00Z"),
                price: 500.0,
                capacity: 150,
                class: "Economy",
                information: "Non-stop flight",
                duration: 300,
                imageUrl: "https://example.com/image.jpg",
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

    it("should fetch all flights", async () => {
        const response = await request(app)
            .get("/api/flights")
            .query({ limit: 5, page: 1 })
            .set("Authorization", `Bearer ${authToken}`);
    });

    it("should fetch a flight by ID", async () => {
        const response = await request(app)
            .get("/api/flights/1")
            .set("Authorization", `Bearer ${authToken}`);
    });

    it("should create a new flight", async () => {
        const newFlight = {
            airlinesId: 1,
            airportId: 1,
            originCityId: 1,
            destinationCityId: 2,
            departure: "2024-12-30T10:00:00Z",
            return: "2025-01-05T18:00:00Z",
            price: 600,
            capacity: 120,
            class: "Business",
            information: "Direct flight",
            duration: 320,
            imageUrl: "https://mocked.imagekit.io/image.jpg",
            judul: "Flight Image",
            deskripsi: "Business class, direct flight"
        };

        const response = await request(app)
            .post("/api/flights")
            .set("Authorization", `Bearer ${authToken}`)
            .send(newFlight);
    });

    it("should update a flight", async () => {
        const updatedFlight = {
            airlinesId: 1,
            airportId: 1,
            originCityId: 1,
            destinationCityId: 2,
            departure: "2024-12-30T10:00:00Z",
            return: "2026-05-10T18:00:00Z",
            price: 400,
            capacity: 100,
            class: "Economy",
            information: "Direct flight",
            duration: 520,
            judul: "Update Flight Image",
            deskripsi: "Update Business class, direct flight"
        };

        const response = await request(app)
            .put("/api/flights/16")
            .set("Authorization", `Bearer ${authToken}`)
            .send(updatedFlight);
        expect(response.status).toBe(400);
    });

    it("should delete a flight", async () => {

        const response = await request(app)
            .delete("/api/flights/16")
            .set("Authorization", `Bearer ${authToken}`);
    });
});
