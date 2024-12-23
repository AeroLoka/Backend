const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../middleware/jwt", () => {
    return {
        restrict: jest.fn((req, res, next) => {
            req.user = {
                id: 1,
                email: "testingseat@mail.com",
                role: "user",
            };
            next();
        }),
    };
});

let authToken;
let testFlight;

const cleanupDatabase = async () => {
    await prisma.bookingPassenger.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.airports.deleteMany();
    await prisma.city.deleteMany();
    await prisma.airlines.deleteMany();
    await prisma.user.deleteMany();
};

describe("Seat Controller API Integration Tests", () => {
    beforeAll(async () => {
        await cleanupDatabase();

        const user = await prisma.user.create({
            data: {
                name: "Seat Test User",
                email: "testingseat@mail.com",
                phoneNumber: "1234567890",
                password: "password123",
                isActive: true,
                role: "user",
            },
        });

        const airline = await prisma.airlines.create({
            data: { name: "Test Airlines" },
        });

        const originCity = await prisma.city.create({
            data: {
                shortname: "TST",
                fullname: "Test City",
            },
        });

        const destinationCity = await prisma.city.create({
            data: {
                shortname: "DST",
                fullname: "Destination City",
            },
        });

        const airport = await prisma.airports.create({
            data: {
                name: "Test Airport",
                cityId: originCity.id,
                terminal: "T1",
                continent: "Asia",
            },
        });

        testFlight = await prisma.flight.create({
            data: {
                airlinesId: airline.id,
                airportId: airport.id,
                originCityId: originCity.id,
                destinationCityId: destinationCity.id,
                departure: new Date("2024-12-20T10:00:00Z"),
                return: new Date("2024-12-25T18:00:00Z"),
                price: 500.0,
                capacity: 150,
                class: "Economy",
                information: "Test flight",
                duration: 300,
                imageUrl: "https://example.com/image.jpg",
            },
        });

        await prisma.seat.createMany({
            data: [
                { flightId: testFlight.id, status: "available", seatNumber: "1A" },
                { flightId: testFlight.id, status: "available", seatNumber: "1B" },
                { flightId: testFlight.id, status: "booked", seatNumber: "1C" },
            ],
        });

        const secretKey = process.env.JWT_SECRET;
        authToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secretKey
        );
    });

    afterAll(async () => {
        await cleanupDatabase();
        await prisma.$disconnect();
    });

    describe("GET /api/seats/:flightId", () => {
        it("should retrieve all seats for a given flight ID", async () => {
            const response = await request(app)
                .get(`/api/seats/${testFlight.id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(200);
            expect(response.body.message).toBe("seat retrieved successfully");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(3);

            const firstSeat = response.body.data[0];
            expect(firstSeat).toHaveProperty("id");
            expect(firstSeat).toHaveProperty("flightId");
            expect(firstSeat).toHaveProperty("status");
            expect(firstSeat).toHaveProperty("seatNumber");
        });

        it("should handle invalid flight ID format", async () => {
            const response = await request(app)
                .get("/api/seats/invalid-id")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid flight ID format");
        });

        it("should handle non-existent flight ID", async () => {
            const nonExistentId = 99999;
            const response = await request(app)
                .get(`/api/seats/${nonExistentId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("seat not found");
        });
    });
});