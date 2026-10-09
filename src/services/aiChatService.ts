import { FacebookChatMessage } from '../types';

export interface AiConversationAnalysis {
  customerIntent: string;
  detectedSchool?: string;
  detectedClass?: string;
  detectedPhone?: string;
  customerPersonality: string;
  interestLevel: 'Cao (Hot)' | 'Đang cân nhắc (Warm)' | 'Mới tìm hiểu (Cold)';
  suggestedReplies: string[];
}

export class AiChatService {
  /**
   * Phân tích ngữ cảnh đoạn hội thoại và đưa ra insight về khách hàng
   */
  public static analyze(customerName: string, messages: FacebookChatMessage[]): AiConversationAnalysis {
    const textAll = messages.map(m => m.text || '').join(' ').toLowerCase();
    const customerMsgs = messages.filter(m => m.sender === 'customer').map(m => m.text || '');
    const lastCustomerMsg = customerMsgs[customerMsgs.length - 1] || '';
    const lastMsgLower = lastCustomerMsg.toLowerCase();

    // 1. Nhận diện trường học
    let detectedSchool: string | undefined;
    const schools = [
      'đông hải', 'ngô quyền', 'trần phú', 'lê hồng phong', 'thái phiên',
      'hải an', 'an dương', 'hồng bàng', 'bạch đằng', 'chuyên trần phú',
      'marie curie', 'nguyễn trãi', 'vinschool', 'đại học hàng hải', 'đh y hải phòng'
    ];
    for (const s of schools) {
      if (textAll.includes(s)) {
        detectedSchool = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // 2. Nhận diện lớp
    let detectedClass: string | undefined;
    const classMatch = textAll.match(/\b(12[a-z0-9]|9[a-z0-9]|11[a-z0-9]|k[0-9]+)\b/i);
    if (classMatch) {
      detectedClass = classMatch[1].toUpperCase();
    }

    // 3. Nhận diện số điện thoại
    let detectedPhone: string | undefined;
    const phoneMatch = textAll.match(/(0[3|5|7|8|9][0-9]{8})/);
    if (phoneMatch) {
      detectedPhone = phoneMatch[1];
    }

    // 4. Nhận diện tính cách & tâm lý
    let customerPersonality = 'Thân thiện, trẻ trung';
    if (textAll.includes('hướng nội') || textAll.includes('ngại') || textAll.includes('ít nói')) {
      customerPersonality = 'Hướng nội, thích phong cách tự nhiên, không gượng gạo';
    } else if (textAll.includes('quẩy') || textAll.includes('cháy') || textAll.includes('sung') || textAll.includes('đông')) {
      customerPersonality = 'Năng động, thích concept độc lạ, quẩy tiệc đêm Prom';
    } else if (textAll.includes('tiết kiệm') || textAll.includes('rẻ') || textAll.includes('giá') || textAll.includes('bao nhiêu')) {
      customerPersonality = 'Quan tâm đến chi phí và tối ưu ngân sách lớp';
    }

    // 5. Cấp độ quan tâm
    let interestLevel: 'Cao (Hot)' | 'Đang cân nhắc (Warm)' | 'Mới tìm hiểu (Cold)' = 'Đang cân nhắc (Warm)';
    if (detectedPhone || textAll.includes('cọc') || textAll.includes('đặt lịch') || textAll.includes('chốt ngày')) {
      interestLevel = 'Cao (Hot)';
    } else if (messages.length <= 3) {
      interestLevel = 'Mới tìm hiểu (Cold)';
    }

    // 6. Tóm tắt ý định
    let customerIntent = 'Đang tìm hiểu các gói chụp kỷ yếu và phong cách chụp của Xoăn Media';
    if (textAll.includes('lớp trưởng') || textAll.includes('rải bom') || textAll.includes('khóa dưới')) {
      customerIntent = 'Đang kết nối các lớp khóa dưới để gom chụp chung kỷ yếu hoặc nhận ưu đãi nhóm';
    } else if (textAll.includes('giá') || textAll.includes('gói')) {
      customerIntent = 'Hỏi chi tiết báo giá và quyền lợi các gói kỷ yếu';
    } else if (textAll.includes('concept') || textAll.includes('đồ') || textAll.includes('trang phục')) {
      customerIntent = 'Muốn xem ảnh mẫu các concept (Thanh xuân, Cổ phục, Prom, Thái Lan...)';
    }

    // 7. Sinh 3 gợi ý phản hồi theo ngữ cảnh
    const suggestedReplies = this.generateSuggestions(customerName, lastMsgLower, textAll, detectedSchool);

    return {
      customerIntent,
      detectedSchool,
      detectedClass,
      detectedPhone,
      customerPersonality,
      interestLevel,
      suggestedReplies
    };
  }

  /**
   * Sinh các câu trả lời thông minh dựa trên tin nhắn gần nhất
   */
  public static generateSuggestions(
    customerName: string,
    lastMsg: string,
    textAll: string,
    school?: string
  ): string[] {
    const namePart = customerName ? customerName.split(' ').pop() : 'bạn';

    // Trường hợp khách nhắn ngắn gọn / đồng ý (okayy, kk, dạ, vâng, ok)
    if (
      lastMsg.includes('okay') ||
      lastMsg.includes('ok') ||
      lastMsg.includes('kk') ||
      lastMsg.includes('dạ') ||
      lastMsg.includes('vâng') ||
      lastMsg.length < 10
    ) {
      return [
        `Dạ vâng ${namePart} ơi, lớp mình dự kiến chụp khoảng bao nhiêu bạn để anh/chị gửi bảng concept và ưu đãi tốt nhất cho lớp nè? 🥰`,
        `Thế để anh/chị gửi cho ${namePart} xem trước bộ ảnh kỷ yếu các lớp ${school ? school : 'khóa trước'} chụp bên Xoăn nhé, cực kỳ hợp gu lớp luôn! 📸✨`,
        `${namePart} cho anh/chị xin số Zalo của bạn phụ trách lớp nhé, bên anh sẽ gửi trọn bộ file PDF báo giá + video review concept cho tiện xem nha! 💌`
      ];
    }

    // Trường hợp khách hỏi giá / chi phí
    if (lastMsg.includes('giá') || lastMsg.includes('bao nhiêu') || lastMsg.includes('chi phí') || lastMsg.includes('gói')) {
      return [
        `Dạ bên Xoăn hiện có 3 gói cực hot: Gói Basic (299k/bạn), Gói Concept VIP (499k/bạn - đủ trang phục & makeup) và Gói Điện Ảnh The Trip (699k). Lớp mình đang thích phong cách nào hơn nè?`,
        `Dạ chi phí kỷ yếu bên em đã bao trọn gói toàn bộ trang phục, thợ chụp xịn sò, flycam và photoshop không giới hạn ảnh luôn ạ. Lớp mình có khoảng bao nhiêu bạn để em tính giá ưu đãi nhất nha?`,
        `Em gửi ${namePart} bảng báo giá chi tiết từng gói nha. Đợt này đặt lịch sớm bên em đang tặng thêm gói quay clip highlight lớp trị giá 2.500.000đ nữa đó ạ! ✨`
      ];
    }

    // Trường hợp khách hỏi concept / trang phục
    if (lastMsg.includes('concept') || lastMsg.includes('trang phục') || lastMsg.includes('áo dài') || lastMsg.includes('đồ')) {
      return [
        `Dạ bên Xoăn có hơn 20 concept hot trend: Thanh Xuân Vườn Trường, Vintage Hàn Quốc, Dạ Hội Prom Night, Cổ Phục, Thái Lan... Lớp mình thích phong cách ngọt ngào thanh xuân hay cá tính sang chảnh nè?`,
        `Toàn bộ trang phục vest, áo dài, cử nhân và concept bên em đều chuẩn bị sẵn từ A-Z, có stylist chỉnh dáng từng bạn luôn nha ${namePart} ơi!`,
        `Em gửi ${namePart} link album ảnh mẫu các concept mới nhất năm nay lớp mình tham khảo nha, xem xong mê liền luôn á! 😍`
      ];
    }

    // Trường hợp mặc định
    return [
      `Dạ Xoăn Media chào ${namePart} ạ! Lớp mình dự kiến chụp vào khoảng tháng mấy và đang quan tâm concept nào để bên em tư vấn chi tiết nhất nha? ✨`,
      `Dạ bên em đang có ưu đãi tặng trọn gói quay Flycam 4K và clip TikTok cho các lớp đăng ký sớm trong tuần này nè ${namePart} ơi!`,
      `Nếu cần tư vấn nhanh, ${namePart} cho em xin số điện thoại Zalo để bên em gửi báo giá và bộ ảnh mẫu mới nhất qua nha! 💌`
    ];
  }

  /**
   * Sinh câu trả lời tự động cho chế độ Auto-pilot
   */
  public static generateAutoReply(customerName: string, messages: FacebookChatMessage[]): string {
    const analysis = this.analyze(customerName, messages);
    return analysis.suggestedReplies[0] || `Dạ Xoăn Media xin chào bạn! Bạn đang quan tâm đến gói chụp kỷ yếu nào để bên em tư vấn chi tiết cho lớp mình nha 🥰`;
  }
}
