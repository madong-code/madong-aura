export interface MessageRow {
  id: string;
  title: string;
  type: number;
  content: any;
  enabled: number;
  sender_id: string;
  receiver_id: string;
  status: string;
  priority?: string;
  channel: string;
  related_id: string;
  related_type: string;
  action_url: string;
  action_params: string;
  created_by: null | string;
  created_at: null | string;
  created_date: null | string;
  expired_at: null | string;
  sender?: any;
}

export interface NotificationItem {
  id?: string;
  uid?: string;
  type?: string;
  avatar: string;
  date: string;
  isRead?: boolean;
  message: string;
  title: string;
  send?: any;
  related_id?: string;
  channel?: string;
}
