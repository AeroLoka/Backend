const routes = require("express").Router();
const passport = require("../services/passport");
const { restrict } = require("../middleware/jwt");
const multer = require("multer");
const upload = multer();
const {
  createBooking,
  getAllBookingsByUserId,
  handlePaymentNotification,
  getBookingByBookingCode,
} = require("../controllers/transactionController");
const { getFlights } = require("../controllers/flightController");
const {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require("../controllers/airfareControllers");
const {
  login,
  register,
  resetPassword,
  sendEmailForgetPassword,
  verifyOtp,
  resendOtp,
  oauthLogin,
} = require("../controllers/authControler");

const {
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByEmail,
} = require("../controllers/userController");
const { getAllSeatByFlightId } = require("../controllers/seatController");
const { admin } = require("../middleware/admin");

const {
  createNotification,
  getAllNotificationByUserId,
  updateNotification,
  deleteNotificationByUserId,
  getAllNotification,
} = require("../controllers/notificationControllers");

routes.get("/api/users", getAllUsers);
routes.get("/api/users/email", getUserByEmail);
routes.put("/api/users", updateUser);
routes.delete("/api/users", deleteUser);

routes.post("/api/booking", restrict, createBooking);
routes.get("/api/booking", restrict, getBookingByBookingCode);
routes.get("/api/booking/:userId", restrict, getAllBookingsByUserId);
routes.post("/api/booking/notification", handlePaymentNotification);

routes.get("/api/search-flights", getFlights);
routes.get("/api/flights/", getAllFlights);
routes.get("/api/flights/:id", getFlightById);

routes.post("/api/flights/", upload.single("imageUrl"), createFlight);
routes.put("/api/flights/:id", upload.single("imageUrl"), updateFlight);
routes.delete("/api/flights/:id", restrict, admin, deleteFlight);

routes.get("/api/seats/:flightId", getAllSeatByFlightId);

routes.post("/api/register", register);
routes.post("/api/verify-otp", verifyOtp);
routes.post("/api/resend-otp", resendOtp);
routes.post("/api/login", login);
routes.post("/api/forget-password", sendEmailForgetPassword);
routes.post("/api/reset-password", resetPassword);

routes.post("/api/notifications/:userId", createNotification);
routes.get("/api/notifications/:userId", getNotificationByUserId);
routes.put("/api/notifications/:id", updateNotification);
routes.delete("/api/notifications/:userId", deleteNotificationByUserId);
routes.get("/api/notifications/", getAllNotification);

routes.get(
  "/api/google",
  passport.authenticate("google", {
    session: false,
    scope: ["email", "profile"],
  })
);
routes.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  oauthLogin
);

module.exports = routes;
