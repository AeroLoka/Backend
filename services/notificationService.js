const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendMail } = require('../services/mail');
const {
    generateBookingEmailTemplate,
    generateSimpleEmailTemplate
} = require('../services/emailService');


const notificationService = async ({ email, type, title, detail, detailMessage }) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const notification = await prisma.notification.create({
            data: {
                userId: user.id,
                type,
                title,
                detail,
            },
        });

        if (detailMessage) {
            const emailTemplate = generateBookingEmailTemplate(detailMessage);
            await sendMail(email, title, emailTemplate);
        } else {
            const emailTemplate = generateSimpleEmailTemplate(detail);
            await sendMail(email, title, emailTemplate);
        }

        return notification;;
    } catch (error) {
        console.error('Error in createNotification service:', error.message);
        throw error;
    }
};

module.exports = { notificationService };
