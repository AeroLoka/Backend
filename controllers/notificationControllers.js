const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createNotification = async (req, res) => {
  const { email, type, title, detail } = req.body;

  try {
    const userId = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
      }
    });

    if (!userId) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId.id,
        type,
        title,
        detail,
      },
    });

    return res.status(201).json({
      status: 201,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Error creating notification",
      error: error.message,
    });
  }
};

const getAllNotificationByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const userId = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    })

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId.id,
      },
    });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Notifications not found",
      });
    }

    const notificationsWithoutUserId = notifications.map((notification) => {
      const { userId, ...rest } = notification;
      return rest;
    });

    return res.status(200).json({
      status: 200,
      message: "Notifications retrieved successfully",
      data: notificationsWithoutUserId,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
};

const getCountNotificationByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const userId = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    })

    const count = await prisma.notification.findMany({
      where: {
        userId: userId.id,
      },
    });

    if (!count || count.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Notifications not found",
      });
    }

    const allNotifications = count.length;
    const readNotifications = count.filter(
      (notification) => notification.isRead
    ).length;
    const unreadNotifications = count.filter(
      (notification) => !notification.isRead
    ).length;

    return res.status(200).json({
      status: 200,
      message: "Notifications retrieved successfully",
      data: {
        allCount: allNotifications,
        readCount: readNotifications,
        unreadCount: unreadNotifications,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
};

const updateNotification = async (req, res) => {
  const { id } = req.params;
  const notificationIdNumber = Number(id);

  if (isNaN(notificationIdNumber)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid notification ID",
    });
  }

  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationIdNumber,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Notification read successfully",
    });

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Error reading notification",
      error: error.message,
    });
  }
};

const deleteNotificationByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const userId = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    })

    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        userId: userId.id,
        isRead: true,
      },
    });

    if (deletedNotifications.count === 0) {
      return res.status(404).json({
        status: 404,
        message: "No read notifications found for the specified user ID",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Notification deleted successfully",
      deletedCount: deletedNotifications.count,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

const filterNotification = async (req, res) => {
  const { email } = req.params;
  const { isread } = req.query;

  if (!email || isread === undefined) {
    return res.status(400).json({
      status: 400,
      message: "email and isread filter are required",
    });
  }

  const isReadBoolean = isread === "true";

  try {
    const userId = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    })

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId.id,
        isRead: isReadBoolean,
      },
    });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Notifications not found",
      });
    }

    const notificationsWithoutUserId = notifications.map((notification) => {
      const { userId, ...rest } = notification;
      return rest;
    });

    return res.status(200).json({
      status: 200,
      message: "Notifications retrieved successfully",
      data: notificationsWithoutUserId,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Error filtering notifications",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getAllNotificationByEmail,
  getCountNotificationByEmail,
  updateNotification,
  deleteNotificationByEmail,
  filterNotification,
};
