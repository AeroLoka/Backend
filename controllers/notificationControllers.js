const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

const createNotification = async (req, res) => {
    const { userId, type, title, detail } = req.body
    const userIdNumber = Number(userId);
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userIdNumber
            }
        })

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        const notification = await prisma.notification.create({
            data: {
                userIdNumber,
                type,
                title,
                detail
            }
        });

        return res.status(201).json({
            status: 201,
            message: 'Notification created successfully',
            data: notification,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error creating notification',
            error: error.message,
        })
    }
}

const getAllNotificationByUserId = async (req, res) => {
    const { userId } = req.params
    const userIdNumber = Number(userId);
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userIdNumber
            }
        });

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Notifications not found',
            });
        }

        const notificationsWithoutUserId = notifications.map(notification => {
            const { userId, ...rest } = notification;
            return rest;
        });

        return res.status(200).json({
            status: 200,
            message: 'Notifications retrieved successfully',
            data: notificationsWithoutUserId,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error retrieving notifications',
            error: error.message,
        });
    }
}

const getCountNotificationByUserId = async (req, res) => {
    const { userId } = req.params
    const userIdNumber = Number(userId);
    try {
        const count = await prisma.notification.findMany({
            where: {
                userId: userIdNumber
            }
        });

        if (!count || count.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Notifications not found',
            });
        }

        const allNotifications = count.length
        const readNotifications = count.filter(notification => notification.isRead).length
        const unreadNotifications = count.filter(notification => !notification.isRead).length

        return res.status(200).json({
            status: 200,
            message: 'Notifications retrieved successfully',
            data: {
                allCount: allNotifications,
                readCount: readNotifications,
                unreadCount: unreadNotifications
            },
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error retrieving notifications',
            error: error.message,
        });
    }
}

const updateNotification = async (req, res) => {
    const notificationId = req.params
    const notificationIdNumber = Number(notificationId);
    try {
        const notification = await prisma.notification.update({
            where: {
                id: notificationIdNumber
            },
            data: {
                isRead: true
            }
        });

        return res.status(200).json({
            status: 200,
            message: 'Notification read successfully',
            data: notification,
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error reading notification',
            error: error.message,
        });
    }
}

const deleteNotificationByUserId = async (req, res) => {
    const userId = req.params
    const userIdNumber = Number(userId);
    try {
        const notification = await prisma.notification.deleteMany({
            where: {
                userId: userIdNumber,
                isRead: true
            }
        })

        return res.status(200).json({
            status: 200,
            message: 'Notification deleted successfully',
            data: {
                count: notification.count
            },
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error deleting notification',
            error: error.message,
        })
    }
}

const filterNotification = async (req, res) => {
    const { userId } = req.params;
    const { isread } = req.query
    const userIdNumber = Number(userId);
    if (!userId || isread === undefined) {
        return res.status(400).json({
            status: 400,
            message: 'UserId and isread filter are required',
        });
    }

    const isReadBoolean = isread === 'true';

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userIdNumber,
                isRead: isReadBoolean,
            }
        });

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Notifications not found',
            });
        }

        const notificationsWithoutUserId = notifications.map(notification => {
            const { userId, ...rest } = notification;
            return rest;
        });

        return res.status(200).json({
            status: 200,
            message: 'Notifications retrieved successfully',
            data: notificationsWithoutUserId,
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error filtering notifications',
            error: error.message,
        });
    }
};

module.exports = { createNotification, getAllNotificationByUserId, getCountNotificationByUserId, updateNotification, deleteNotificationByUserId, filterNotification }