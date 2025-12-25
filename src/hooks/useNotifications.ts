import { useState } from 'react';

export const useNotifications = () => {
    const [unreadCount, setUnreadCount] = useState(3);

    return { unreadCount, setUnreadCount };
};
