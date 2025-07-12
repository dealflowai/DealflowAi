import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export class NotificationService {
  static async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<string | null> {
    try {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: data || null
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Helper method to create notifications for common events
  static async notifyBuyerAdded(userId: string, buyerName: string, budget: number) {
    return this.createNotification(
      userId,
      'buyer',
      'New buyer added',
      `${buyerName} added with $${budget.toLocaleString()} budget`,
      { buyerName, budget }
    );
  }

  static async notifyDealAnalyzed(userId: string, dealAddress: string, score: number) {
    return this.createNotification(
      userId,
      'deal',
      'Deal analysis complete',
      `Analysis for ${dealAddress} scored ${score}/100`,
      { dealAddress, score }
    );
  }

  static async notifyContractGenerated(userId: string, contractTitle: string) {
    return this.createNotification(
      userId,
      'contract',
      'Contract generated',
      `${contractTitle} is ready for review`,
      { contractTitle }
    );
  }

  static async notifyLowTokens(userId: string, remainingTokens: number) {
    return this.createNotification(
      userId,
      'system',
      'Low token balance',
      `You have ${remainingTokens} tokens remaining. Consider purchasing more.`,
      { remainingTokens }
    );
  }
}