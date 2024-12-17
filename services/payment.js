const midtransClient = require('midtrans-client');

const createPayment = async (result) => {
  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  const parameter = {
    transaction_details: {
      order_id: result.booking.bookingCode,
      gross_amount: result.booking.totalPrice,
    },
    customer_details: {
      first_name: result.user.name,
      email: result.user.email,
    },
  };

  const { token, redirect_url } = await snap.createTransaction(parameter);

  return { token, redirect_url };
};

module.exports = { createPayment };
