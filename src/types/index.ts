export type PipelineStage =
  | 'New Lead'
  | 'Đã liên hệ'
  | 'Đang tư vấn'
  | 'Đã gửi báo giá'
  | 'Đang thương lượng'
  | 'Đã cọc'
  | 'Đã đặt cọc'
  | 'Book ngày'
  | 'Đã Booking'
  | 'Đã chụp'
  | 'Đang hậu kỳ'
  | 'Giao ảnh'
  | 'Đã bàn giao'
  | 'Hoàn thành'
  | 'Lost'
  | 'Chăm sóc lại'
  | 'Mới tiếp nhận';

export interface FacebookChatMessage {
  id: string;
  sender: 'customer' | 'sales';
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'file';
    url: string;
    name?: string;
  }>;
  cardType?: 'quote' | 'vietqr' | 'booking_success';
  cardData?: {
    packageName?: string;
    packagePrice?: number;
    studentCount?: number;
    totalAmount?: number;
    depositAmount?: number;
    shootDate?: string;
    location?: string;
    bankName?: string;
    accountNo?: string;
    accountHolder?: string;
    transferSyntax?: string;
    bookingCode?: string;
  };
}

export interface FacebookChatConversation {
  id: string;
  customerId?: string;
  customerName: string;
  customerAvatar: string;
  customerClass?: string;
  customerSchool?: string;
  customerPhone?: string;
  facebookUrl?: string;
  facebookPsid?: string;
  isLiveFacebook?: boolean;
  channel?: 'facebook' | 'zalo' | 'tiktok' | 'instagram';
  channelId?: string;
  pageName?: string;
  unreadCount: number;
  isReplied?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  assignedSalesName: string;
  assignedSalesId?: string;
  pipelineStage?: string;
  tags: string[];
  notes?: string;
  messages: FacebookChatMessage[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  className: string;
  schoolName: string;
  stage?: PipelineStage;
  notes?: string;
  assignedSalesId?: string;
  facebook?: string;
  createdAt?: string;
}

export interface Booking {
  id: string;
  code?: string;
  customerId: string;
  customerName: string;
  className: string;
  schoolName: string;
  shootDate: string;
  location?: string;
  studentCount: number;
  packageName: string;
  packagePrice?: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount?: number;
  paymentStatus: string;
  bookingStatus?: string;
  notes?: string;
  createdAt?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface SalesStaff {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}
