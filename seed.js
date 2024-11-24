const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Claudio Serafino",
      email: "Serafino@mail.com",
      phoneNumber: "+639876463784",
      password: "900673",
      isActive: true,
    },
  });
  console.log("User created:", user);

  const airline = await prisma.airlines.create({
    data: {
      name: "Philippine Airlines",
    },
  });
  console.log("Airline created:", airline);

  const airport = await prisma.airports.create({
    data: {
      name: "Ninoy Aquino International Airport",
      city: "Manila",
      terminal: "T4",
    },
  });
  console.log("Airport created:", airport);

  // data ke tabel flight
  const flight = await prisma.flight.create({
    data: {
      airlinesId: airline.id,
      airportId: airport.id,
      departure: new Date("2025-01-04T07:30:00Z"),
      return: new Date("2025-01-04T12:00:00Z"),
      price: 3000000.0,
      capacity: 150,
      class: "First",
      information: "Non-stop flight to San Frasisco",
    },
  });
  console.log("Flight created:", flight);

  //data ke talble seat
  const seat = await prisma.seat.create({
    data: {
      flightId: flight.id,
      status: "available",
      seatNumber: "A4",
    },
  });
  console.log("Seat created:", seat);

  // masukan data ke tabel passanger
  const passenger = await prisma.passenger.create({
    data: {
      firstName: "Claudio",
      lastName: "Serafino",
      birthDate: new Date("2000-03-20"),
      nationality: "filipino",
      passportNumber: "A627844",
      passportExpiry: new Date("2029-02-23"),
    },
  });
  console.log("Passenger created:", passenger);

  // masukkan data ke tabel seat
  await prisma.seat.update({
    where: { id: seat.id },
    data: {
      passengerId: passenger.id,
      status: "booked",
    },
  });
  console.log("Seat updated with passenger ID.");

  // masukkan data ke tabel booking
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      flightId: flight.id,
      bookingDate: new Date(),
      totalPrice: 6000000.0,
      totalPassenger: 2,
    },
  });
  console.log("Booking created:", booking);

  // data ke tabel bookingpsngger
  const bookingPassenger = await prisma.bookingPassenger.create({
    data: {
      bookingId: booking.id,
      passengerId: passenger.id,
      seatId: seat.id,
    },
  });
  console.log("Booking Passenger created:", bookingPassenger);

  //deta ke tabel notification
  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      name: "Flight Reminder",
      detail: "Your flight is scheduled on 2025-01-04 at 07:30 AM.",
    },
  });
  console.log("Notification created:", notification);
}

// Jalankan fungsi utama
main()
  .catch((e) => {
    console.error("Error occurred:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
