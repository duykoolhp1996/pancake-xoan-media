// src/services/facebookApiService.ts
// Service tích hợp trực tiếp Facebook Graph API (Messenger Platform) cho CRM Xoăn Media

export interface FacebookApiResponse<T> {
  data: T[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface FbParticipant {
  name: string;
  email: string;
  id: string;
}

export interface FbRawMessage {
  id: string;
  message?: string;
  created_time: string;
  from: FbParticipant;
  attachments?: {
    data: Array<{
      id: string;
      mime_type?: string;
      name?: string;
      file_url?: string;
      image_data?: {
        url: string;
        preview_url?: string;
      };
    }>;
  };
}

export interface FbRawConversation {
  id: string;
  updated_time: string;
  unread_count: number;
  participants: {
    data: FbParticipant[];
  };
  messages?: {
    data: FbRawMessage[];
  };
}

// Token Page vĩnh viễn mới nhất của Fanpage Xoăn Media - Chụp Ảnh Kỷ Yếu (ID: 111065964964204)
export const DEFAULT_PAGE_TOKEN = 'EAAPYDkXqBPoBSnpggIUFsAOsa3lCelLpZB39R6bX0CMZCU1h9vEEjSL5btmlZAv0YE8eZCidwGGGXZBX1BpgjLLlcbNuc9MfKqWBqHPNjJQAOnUzjGOSdNfRWupq4tB7N68OnonZAxBCGRFQtoq6kLEmaFrneZCl1PIclZCulmfHutBGfWPXRzt79r1tOxMZCP4OQhkn5ZBBZCG2CScMB4zKHEZD';
export const DEFAULT_PAGE_ID = '111065964964204';
export const DEFAULT_APP_ID = '1081980744238330';

export class FacebookApiService {
  private static tokenKey = 'crm_xoan_fb_page_token';
  private static pageIdKey = 'crm_xoan_fb_page_id';
  private static appIdKey = 'crm_xoan_fb_app_id';

  public static getAppId(): string {
    return localStorage.getItem(this.appIdKey) || DEFAULT_APP_ID;
  }

  public static setAppId(appId: string): void {
    localStorage.setItem(this.appIdKey, appId.trim());
  }

  public static getPageToken(): string {
    const saved = localStorage.getItem(this.tokenKey);
    if (!saved || saved.length < 30) {
      localStorage.setItem(this.tokenKey, DEFAULT_PAGE_TOKEN);
      return DEFAULT_PAGE_TOKEN;
    }
    return saved;
  }

  public static setPageToken(token: string): void {
    localStorage.setItem(this.tokenKey, token.trim());
  }

  public static getPageId(): string {
    const saved = localStorage.getItem(this.pageIdKey);
    if (!saved || saved.length < 5) {
      localStorage.setItem(this.pageIdKey, DEFAULT_PAGE_ID);
      return DEFAULT_PAGE_ID;
    }
    return saved;
  }

  public static setPageId(pageId: string): void {
    localStorage.setItem(this.pageIdKey, pageId.trim());
  }

  /**
   * Tự động giải nén Page Access Token từ User Token hoặc Page Token
   */
  public static async resolvePageTokenIfUserToken(inputToken: string): Promise<{ pageToken: string; pageId: string; pageName: string } | null> {
    try {
      const token = inputToken.trim();
      if (!token) return null;

      // 1. Thử gọi /me/accounts để kiểm tra xem có phải là User Token quản lý trang không
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (data && Array.isArray(data.data) && data.data.length > 0) {
          const targetPage =
            data.data.find((p: any) => p.id === DEFAULT_PAGE_ID || p.name?.toLowerCase().includes('xoăn')) ||
            data.data[0];

          if (targetPage && targetPage.access_token) {
            return {
              pageToken: targetPage.access_token,
              pageId: targetPage.id,
              pageName: targetPage.name
            };
          }
        }
      } catch {}

      // 2. Nếu là trực tiếp Page Token, gọi /me để xác minh thông tin trang
      try {
        const pageRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`);
        const pageData = await pageRes.json();

        if (pageData && pageData.id && pageData.name) {
          return {
            pageToken: token,
            pageId: pageData.id,
            pageName: pageData.name
          };
        }
      } catch {}
    } catch (err) {
      console.warn('Lỗi phân giải token Facebook:', err);
    }
    return null;
  }

  /**
   * Lấy thông tin Fanpage hiện tại (id, name, link, pictureUrl)
   */
  public static async getPageInfo(inputToken?: string): Promise<{ id: string; name: string; link?: string; pictureUrl?: string }> {
    const token = inputToken || this.getPageToken();
    const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,link&access_token=${encodeURIComponent(token)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Không thể lấy thông tin Fanpage với Token này');
    }

    let pictureUrl: string | undefined;
    try {
      const picRes = await fetch(`https://graph.facebook.com/v19.0/me/picture?redirect=false&access_token=${encodeURIComponent(token)}`);
      const picData = await picRes.json();
      pictureUrl = picData?.data?.url;
    } catch {}

    return {
      id: data.id,
      name: data.name,
      link: data.link,
      pictureUrl
    };
  }

  /**
   * Lấy danh sách hội thoại từ Fanpage
   */
  public static async getConversations(): Promise<FbRawConversation[]> {
    const token = this.getPageToken();
    const pageId = this.getPageId();

    const fields = 'id,updated_time,unread_count,participants,messages.limit(25){id,message,created_time,from,attachments}';
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=${fields}&access_token=${token}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Không thể tải danh sách hội thoại Facebook');
    }

    return data.data || [];
  }

  /**
   * Lấy danh sách tin nhắn chi tiết trong 1 cuộc hội thoại
   */
  public static async getMessages(conversationId: string): Promise<FbRawMessage[]> {
    const token = this.getPageToken();
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,created_time,from,attachments&limit=40&access_token=${token}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Không thể tải tin nhắn cuộc hội thoại');
    }

    return data.data || [];
  }

  /**
   * Gửi tin nhắn từ Fanpage đến khách hàng (PSID)
   */
  public static async sendMessage(recipientPsid: string, text: string) {
    const token = this.getPageToken();

    let payload: Record<string, any> = {
      recipient: { id: recipientPsid },
      messaging_type: 'RESPONSE',
      message: { text }
    };

    let res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = await res.json();

    if (!res.ok) {
      if (data.error?.error_subcode === 2018278 || (data.error?.code === 10 && data.error?.message?.includes('khoảng thời gian'))) {
        throw new Error('Đã quá cửa sổ 24 giờ của Facebook (Khách chưa nhắn lại quá 24h). Khách chỉ cần nhắn 1 tin mới vào Page là chat lại được ngay.');
      }
      if (data.error?.error_subcode === 2018300 || (data.error?.code === 10 && data.error?.message?.includes('kiểm soát thread'))) {
        throw new Error('Fanpage đang bật "Tác nhân AI" (Meta AI Agent) kiểm soát hội thoại này. Bạn vào Hộp thư Meta Business Suite bấm "Tiếp quản cuộc trò chuyện" (Take over) là CRM gửi được ngay.');
      }
      throw new Error(data.error?.message || 'Lỗi gửi tin nhắn qua Facebook Graph API');
    }

    return data;
  }

  /**
   * Gửi hình ảnh từ Fanpage đến khách hàng (PSID)
   */
  public static async sendImageMessage(recipientPsid: string, imageSource: File | Blob | string) {
    const token = this.getPageToken();

    if (typeof imageSource === 'string') {
      const payload: Record<string, any> = {
        recipient: { id: recipientPsid },
        messaging_type: 'RESPONSE',
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: imageSource,
              is_reusable: true
            }
          }
        }
      };

      const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Lỗi gửi hình ảnh URL qua Facebook Graph API');
      }
      return data;
    } else {
      const formData = new FormData();
      formData.append('recipient', JSON.stringify({ id: recipientPsid }));
      formData.append(
        'message',
        JSON.stringify({
          attachment: {
            type: 'image',
            payload: {
              is_reusable: true
            }
          }
        })
      );
      formData.append('filedata', imageSource);

      const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Lỗi tải ảnh lên Facebook Graph API');
      }
      return data;
    }
  }
}
