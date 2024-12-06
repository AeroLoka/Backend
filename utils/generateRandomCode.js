const generateUniqueBookingCode = async (prisma) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code;
  let existingBooking; 

  do {
    code = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    existingBooking = await prisma.booking.findUnique({
      where: { bookingCode: code },
    });
  } while (existingBooking);

  return code;
};

module.exports = { generateUniqueBookingCode };
