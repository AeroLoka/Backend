const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

const createNotification = async (req, res) => {
    const { userId, name, detail } = req.body
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                name,
                detail
            }
        });

        return res.status(201).json({
            status: 201,
            message: 'Resource created successfully',
            data: notification,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error creating resource',
            error: error.message,
        })
    }
}

const getNotificationByUserId = async (req, res) => {
    const { userId } = req.params
    const userIdNumber = Number(userId);
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userIdNumber
            }
        });

        const unRead = await prisma.notification.count({
            where: {
                userId: userIdNumber,
                isRead: false
            }
        })

        return res.status(200).json({
            status: 200,
            message: 'Notifications retrieved successfully',
            unread: unRead,
            data: notifications,
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

const getAllNotification = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany();
        return res.status(200).json({
            status: 200,
            message: 'Notifications retrieved successfully',
            data: notifications,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error retrieving notifications',
            error: error.message,
        });
    }
}


module.exports = { createNotification, getNotificationByUserId, updateNotification, deleteNotificationByUserId, getAllNotification }