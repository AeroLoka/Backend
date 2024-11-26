const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Steve Fox",
        email: "Steve@mail.com",
        phoneNumber: "+621234567890",
        password: "123456",
        isActive: false,
      },
      {
        name: "Reina Mishima",
        email: "Reina@mail.com",
        phoneNumber: "+621234567891",
        password: "654321",
        isActive: false,
      },
      {
        name: "Mark Smith",
        email: "mark@mail.com",
        phoneNumber: "+621234567892",
        password: "abcdef",
        isActive: false,
      },
      {
        name: "Bryan Fury",
        email: "Bryan@mail.com",
        phoneNumber: "+621234567893",
        password: "ghijkl",
        isActive: false,
      },
      {
        name: "Claudio Serafino",
        email: "serafino@mail.com",
        phoneNumber: "+639876463784",
        password: "900673",
        isActive: false,
      },
    ],
  });
  console.log("Users created:", users);

  const notifications = await prisma.notification.createMany({
    data: [
      {
        userId: 1,
        name: "Reminder 1",
        detail: "Your flight is scheduled on 2025-01-04 at 07:30 AM.",
      },
      {
        userId: 2,
        name: "Reminder 2",
        detail: "Your flight is scheduled on 2025-02-01 at 10:00 AM.",
      },
      {
        userId: 3,
        name: "Reminder 3",
        detail: "Your flight is scheduled on 2025-03 at 09:00 AM.",
      },
      {
        userId: 4,
        name: "Reminder 4",
        detail: "Your flight is scheduled on 2025-04-01 at 13:00 AM.",
      },
      {
        userId: 5,
        name: "Reminder 5",
        detail: "Your flight is scheduled on 2025-05-20 at 05:30 AM.",
      },
    ],
  });
  console.log("Notifications created:", notifications);

  const airlines = await prisma.airlines.createMany({
    data: [
      { name: "Garuda Indonesia" },
      { name: "Lion Air" },
      { name: "AirAsia" },
      { name: "Los angeles Airlines" },
      { name: "Philippine Airlines" },
    ],
  });
  console.log("Airlines created:", airlines);

  const cities = await prisma.city.createMany({
    data: [
      { shortname: "CGK", fullname: "Jakarta" },
      { shortname: "SUB", fullname: "Surabaya" },
      { shortname: "DPS", fullname: "Denpasar" },
      { shortname: "LOS", fullname: "Los angeles" },
      { shortname: "MNL", fullname: "Manila" },
    ],
  });
  console.log("Cities created:", cities);

  const airports = await prisma.airports.createMany({
    data: [
      {
        name: "Soekarno-Hatta International Airport",
        cityId: 1,
        terminal: "T3",
        continent: "Asia",
      },
      {
        name: "Juanda International Airport",
        cityId: 2,
        terminal: "T1",
        continent: "Asia",
      },
      {
        name: "Ngurah Rai International Airport",
        cityId: 3,
        terminal: "T2",
        continent: "Asia",
      },
      {
        name: "Los Angeles Airport",
        cityId: 4,
        terminal: "T4",
        continent: "America",
      },
      {
        name: "Ninoy Aquino International Airport",
        cityId: 5,
        terminal: "T4",
        continent: "Asia",
      },
    ],
  });
  console.log("Airports created:", airports);

  const flights = await prisma.flight.createMany({
    data: [
      {
        airlinesId: 1,
        airportId: 1,
        departure: new Date("2025-01-04T07:30:00Z"),
        return: new Date("2025-01-04T12:00:00Z"),
        price: 1000000.0,
        capacity: 180,
        class: "Economy",
        information: "Direct flight",
        duration: 120,
        originCityId: 1,
        destinationCityId: 2,
      },
      {
        airlinesId: 2,
        airportId: 2,
        departure: new Date("2025-02-01T10:00:00Z"),
        return: new Date("2025-02-01T14:30:00Z"),
        price: 2000000.0,
        capacity: 150,
        class: "Business",
        information: "Connecting flight via Surabaya",
        duration: 270,
        originCityId: 3,
        destinationCityId: 4,
      },
      {
        airlinesId: 3,
        airportId: 3,
        departure: new Date("2025-03-15T09:00:00Z"),
        return: new Date("2025-03-15T14:00:00Z"),
        price: 1250000.0,
        capacity: 160,
        class: "Premium Economy",
        information: "Direct flight",
        duration: 300,
        originCityId: 2,
        destinationCityId: 4,
      },
      {
        airlinesId: 4,
        airportId: 4,
        departure: new Date("2025-04-01T13:00:00Z"),
        return: new Date("2025-04-01T18:30:00Z"),
        price: 2500000.0,
        capacity: 200,
        class: "First Class",
        information: "International flight",
        duration: 330,
        originCityId: 4,
        destinationCityId: 5,
      },
      {
        airlinesId: 5,
        airportId: 5,
        departure: new Date("2025-05-20T05:30:00Z"),
        return: new Date("2025-05-20T09:30:00Z"),
        price: 1000000.0,
        capacity: 100,
        class: "Economy",
        information: "Budget airline flight",
        duration: 240,
        originCityId: 1,
        destinationCityId: 3,
      },
    ],
  });
  console.log("Flights created:", flights);

  const passengers = await prisma.passenger.createMany({
    data: [
      {
        firstName: "Steve",
        lastName: "Fox",
        birthDate: new Date("1990-05-10"),
        nationality: "Indonesian",
        passportNumber: "A1234567",
        passportExpiry: new Date("2030-05-10"),
      },
      {
        firstName: "Reina",
        lastName: "Mishima",
        birthDate: new Date("1985-07-20"),
        nationality: "Japan",
        passportNumber: "B9876543",
        passportExpiry: new Date("2028-07-20"),
      },
      {
        firstName: "Mark",
        lastName: "Smith",
        birthDate: new Date("1980-12-15"),
        nationality: "Malaysian",
        passportNumber: "C7654321",
        passportExpiry: new Date("2027-12-15"),
      },
      {
        firstName: "Bryan",
        lastName: "Fury",
        birthDate: new Date("1995-03-25"),
        nationality: "American",
        passportNumber: "D5678901",
        passportExpiry: new Date("2032-03-25"),
      },
      {
        firstName: "Claudio",
        lastName: "Serafino",
        birthDate: new Date("1992-09-05"),
        nationality: "Australian",
        passportNumber: "E3456789",
        passportExpiry: new Date("2029-09-05"),
      },
    ],
  });
  console.log("Passengers created:", passengers);

  const seats = await prisma.seat.createMany({
    data: [
      { flightId: 1, passengerId: 1, status: "available", seatNumber: "1A" },
      { flightId: 1, passengerId: 2, status: "available", seatNumber: "1B" },
      { flightId: 1, passengerId: 3, status: "available", seatNumber: "1C" },
      { flightId: 1, passengerId: 4, status: "available", seatNumber: "2A" },
      { flightId: 1, passengerId: 5, status: "available", seatNumber: "2B" },
    ],
  });
  console.log("Seats created:", seats);

  const bookings = await prisma.booking.createMany({
    data: [
      {
        userId: 1,
        flightId: 1,
        bookingDate: new Date("2024-12-20T08:00:00Z"),
        totalPrice: 1000000,
        totalPassenger: 1,
      },
      {
        userId: 2,
        flightId: 2,
        bookingDate: new Date("2024-12-21T09:30:00Z"),
        totalPrice: 4000000,
        totalPassenger: 2,
      },
      {
        userId: 3,
        flightId: 3,
        bookingDate: new Date("2024-12-22T11:45:00Z"),
        totalPrice: 3750000,
        totalPassenger: 3,
      },
      {
        userId: 4,
        flightId: 4,
        bookingDate: new Date("2024-12-23T14:15:00Z"),
        totalPrice: 10000000,
        totalPassenger: 4,
      },
      {
        userId: 5,
        flightId: 5,
        bookingDate: new Date("2024-12-24T16:00:00Z"),
        totalPrice: 7500000,
        totalPassenger: 5,
      },
    ],
  });
  console.log("Bookings created:", bookings);

  const bookingPassenger = await prisma.bookingPassenger.createMany({
    data: [
      { bookingId: 1, passengerId: 1, seatId: 1 },
      { bookingId: 2, passengerId: 2, seatId: 2 },
      { bookingId: 3, passengerId: 3, seatId: 3 },
      { bookingId: 4, passengerId: 4, seatId: 4 },
      { bookingId: 5, passengerId: 5, seatId: 5 },
    ],
  });
  console.log("Booking Passengers created:", bookingPassenger);
}

/*
  const bookingPassenger = await prisma.bookingPassenger.create({
    data: {
      bookingId: booking.id,
      passengerId: passenger.id,
      seatId: seat.id,
    },
  });
  console.log("Booking Passenger created:", bookingPassenger);
*/

main()
  .catch((e) => {
    console.error("Error occurred:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
