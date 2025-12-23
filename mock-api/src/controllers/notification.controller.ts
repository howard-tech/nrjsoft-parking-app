import { Request, Response } from 'express';
import { Notification } from '../types';
import { notificationStore } from '../services/data.store';

// Device tokens store (not persisted in generated data for now, runtime only)
const deviceTokenStore: Map<string, string[]> = new Map();

export class NotificationController {
    // GET /notifications
    getNotifications = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { page = 1, limit = 20, unreadOnly } = req.query;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let userNotifications = Array.from(notificationStore.values()).filter(
            (n) => n.userId === userId
        );

        // Filter unread only if requested
        if (unreadOnly === 'true') {
            userNotifications = userNotifications.filter((n) => !n.read);
        }

        // Sort by date descending
        userNotifications.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const paginated = userNotifications.slice(startIndex, endIndex);
        const unreadCount = userNotifications.filter((n) => !n.read).length;

        res.json({
            notifications: paginated,
            total: userNotifications.length,
            unreadCount,
            page: pageNum,
            totalPages: Math.ceil(userNotifications.length / limitNum),
            hasMore: endIndex < userNotifications.length,
        });
    };

    // PUT /notifications/:id/read
    markAsRead = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const notification = notificationStore.get(id);

        if (!notification || notification.userId !== userId) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }

        notification.read = true;
        notificationStore.set(id, notification);

        res.json(notification);
    };

    // PUT /notifications/read-all
    markAllAsRead = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userNotifications = Array.from(notificationStore.values()).filter(
            (n) => n.userId === userId
        );

        userNotifications.forEach((n) => {
            n.read = true;
            notificationStore.set(n.id, n);
        });

        res.json({ success: true, count: userNotifications.length });
    };

    // POST /devices/register
    registerDevice = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { token, platform } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!token || !platform) {
            res.status(400).json({ error: 'Token and platform required' });
            return;
        }

        // Store device token
        const userTokens = deviceTokenStore.get(userId) || [];
        if (!userTokens.includes(token)) {
            userTokens.push(token);
            deviceTokenStore.set(userId, userTokens);
        }

        console.log(`[FCM] Registered device for user ${userId}: ${platform}`);

        res.json({ success: true, message: 'Device registered' });
    };

    // DELETE /devices/unregister
    unregisterDevice = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { token } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!token) {
            res.status(400).json({ error: 'Token required' });
            return;
        }

        const userTokens = deviceTokenStore.get(userId) || [];
        const filteredTokens = userTokens.filter((t) => t !== token);
        deviceTokenStore.set(userId, filteredTokens);

        res.json({ success: true, message: 'Device unregistered' });
    };
}
