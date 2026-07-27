class NotificationService {
  /**
   * Request browser notification permissions.
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support desktop notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Send a browser push notification for budget alert or milestone.
   */
  sendNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/pigeon-icon.png',
        badge: '/pigeon-icon.png',
        ...options,
      });
    }
  }

  /**
   * Check budget limits and notify user if threshold exceeded.
   */
  checkBudgetAlert(category: string, spentAmount: number, limitAmount: number, thresholdPercent: number = 80): void {
    if (!limitAmount || limitAmount <= 0) return;
    const usagePercent = (spentAmount / limitAmount) * 100;

    if (usagePercent >= 100) {
      this.sendNotification(`⚠️ Overbudget Alert: ${category}`, {
        body: `You have spent $${spentAmount.toFixed(2)} of your $${limitAmount} budget (${Math.round(usagePercent)}%). Consider pausing non-essential expenses!`,
        tag: `budget-over-${category}`
      });
    } else if (usagePercent >= thresholdPercent) {
      this.sendNotification(`⚡ Budget Warning: ${category}`, {
        body: `You have used ${Math.round(usagePercent)}% ($${spentAmount.toFixed(2)} / $${limitAmount}) of your ${category} budget.`,
        tag: `budget-warn-${category}`
      });
    }
  }
}

export const notificationService = new NotificationService();
