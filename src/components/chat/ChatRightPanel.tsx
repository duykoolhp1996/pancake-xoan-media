import React, { useState, useEffect } from 'react';
import {
  FacebookChatConversation,
  ServicePackage,
  Booking,
  PipelineStage
} from '../../types';
import { AiConversationAnalysis } from '../../services/aiChatService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { CrmApiService } from '../../services/crmApiService';
import {
  User,
  Bot,
  ShoppingBag,
  Sparkles,
  Check,
  Send,
  Calendar,
  DollarSign,
  Phone,
  School,
  Save,
  MessageSquare
} from 'lucide-react';

interface ChatRightPanelProps {
  activeConv: FacebookChatConversation | null;
  servicePackages: ServicePackage[];
  aiAnalysis: AiConversationAnalysis;
  onUpdateConversation: (updated: Partial<FacebookChatConversation>) => void;
  onAiSendReply: (replyText: string) => Promise<void>;
  onAddBooking: (booking: Booking) => void;
  initialTab?: 'customer' | 'ai' | 'pos';
}

export const ChatRightPanel: React.FC<ChatRightPanelProps> = ({
  activeConv,
  servicePackages,
  aiAnalysis,
  onUpdateConversation,
  onAiSendReply,
  onAddBooking,
  initialTab = 'customer'
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'customer' | 'ai' | 'pos'>(initialTab);

  // Sync initial tab if changed from outside
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Form Profile State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custClass, setCustClass] = useState('');
  const [custSchool, setCustSchool] = useState('');
  const [stage, setStage] = useState<string>('New Lead');
  const [notes, setNotes] = useState('');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Form POS State
  const [posPackage, setPosPackage] = useState(servicePackages[1]?.name || 'Gói CONCEPT VIP (499k/bạn)');
  const [posPrice, setPosPrice] = useState(servicePackages[1]?.price || 499000);
  const [posStudentCount, setPosStudentCount] = useState(40);
  const [posDeposit, setPosDeposit] = useState(2000000);
  const [posShootDate, setPosShootDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [posLocation, setPosLocation] = useState('Trường học + Phim trường');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Sync fields when activeConv changes
  useEffect(() => {
    if (activeConv) {
      setCustName(activeConv.customerName || '');
      setCustPhone(activeConv.customerPhone || '');
      setCustClass(activeConv.customerClass || '');
      setCustSchool(activeConv.customerSchool || '');
      setStage(activeConv.pipelineStage || 'New Lead');
      setNotes(activeConv.notes || '');
    }
  }, [activeConv?.id]);

  if (!activeConv) return null;

  // Save Customer Profile to CRM API
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCustomer(true);

    try {
      // 1. Update local conversation
      onUpdateConversation({
        customerName: custName,
        customerPhone: custPhone,
        customerClass: custClass,
        customerSchool: custSchool,
        pipelineStage: stage,
        notes
      });

      // 2. Call CRM REST API
      await CrmApiService.saveCustomer({
        id: activeConv.customerId,
        name: custName,
        phone: custPhone,
        className: custClass,
        schoolName: custSchool,
        stage: stage as PipelineStage,
        notes
      });

      toast.success('Đã lưu thông tin khách hàng vào CRM!');
    } catch (err: any) {
      toast.error(`Lỗi lưu CRM: ${err.message}`);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // 1-Click apply AI Insights to Profile
  const handleApplyAiInsights = () => {
    if (aiAnalysis.detectedSchool) setCustSchool(aiAnalysis.detectedSchool);
    if (aiAnalysis.detectedClass) setCustClass(aiAnalysis.detectedClass);
    if (aiAnalysis.detectedPhone) setCustPhone(aiAnalysis.detectedPhone);

    const newNote = notes
      ? `${notes}\n[AI Phân Tích]: ${aiAnalysis.customerPersonality}`
      : `[AI Phân Tích]: ${aiAnalysis.customerPersonality}`;
    setNotes(newNote);

    toast.success('Đã điền thông tin AI phân tích vào Hồ sơ!');
  };

  // Toggle AI Auto-pilot
  const handleToggleAiAuto = () => {
    const isAi = activeConv.assignedSalesName?.includes('AI');
    const newStaff = isAi ? 'Duy Kool (Admin)' : '🤖 Bot AI Tư Vấn (Auto)';
    onUpdateConversation({ assignedSalesName: newStaff });
    if (!isAi) {
      toast.success('Đã bật AI Auto-pilot tự động tư vấn 24/7!');
    } else {
      toast.info('Đã chuyển sang chế độ nhân sự tư vấn thủ công.');
    }
  };

  // Quick POS Create Booking
  const handleCreatePosBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingBooking(true);

    const bookingCode = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const count = Number(posStudentCount) || 1;
    const price = Number(posPrice) || 0;
    const total = count * price;
    const deposit = Number(posDeposit) || 0;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      code: bookingCode,
      customerId: activeConv.customerId || `cust-${Date.now()}`,
      customerName: custName || activeConv.customerName,
      className: custClass || activeConv.customerClass || '',
      schoolName: custSchool || activeConv.customerSchool || '',
      shootDate: posShootDate,
      location: posLocation,
      studentCount: count,
      packageName: posPackage,
      packagePrice: price,
      totalAmount: total,
      depositAmount: deposit,
      paymentStatus: 'Đã cọc',
      bookingStatus: 'Chờ xếp ekip',
      notes: `Tạo từ Pancake POS chat - ${activeConv.customerName}`,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    try {
      await CrmApiService.createBooking(newBooking);
      onAddBooking(newBooking);

      // Add booking success card to chat
      onUpdateConversation({
        pipelineStage: 'Đã Booking',
        tags: Array.from(new Set([...activeConv.tags, '💰 Đã cọc VietQR'])),
        lastMessage: `[Chốt Đơn: ${bookingCode}]`,
        lastMessageTime: 'Vừa xong'
      });

      toast.success(`🎉 Đã tạo booking ${bookingCode} và đồng bộ vào CRM!`);
    } catch (err: any) {
      toast.error(`Lỗi tạo đơn: ${err.message}`);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="w-80 lg:w-88 xl:w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 select-none z-10">
      {/* Tab Switcher Header */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80 shrink-0">
        <div className="p-1 bg-slate-200/70 rounded-xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Hồ Sơ</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow-2xs font-bold'
                : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Trợ Lý AI</span>
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* ====================================================
            TAB 1: HỒ SƠ CRM KHÁCH HÀNG
            ==================================================== */}
        {activeTab === 'customer' && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5 animate-in fade-in">
            <Input
              label="Họ tên khách hàng"
              value={custName}
              onChange={e => setCustName(e.target.value)}
              placeholder="VD: Nguyễn Thị Trang"
            />

            <Input
              label="Số điện thoại"
              value={custPhone}
              onChange={e => setCustPhone(e.target.value)}
              placeholder="VD: 0987654321"
              leftIcon={<Phone className="w-3.5 h-3.5" />}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="Lớp"
                value={custClass}
                onChange={e => setCustClass(e.target.value)}
                placeholder="VD: 12A1"
              />
              <Input
                label="Trường"
                value={custSchool}
                onChange={e => setCustSchool(e.target.value)}
                placeholder="VD: THPT Đông Hải"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giai đoạn Pipeline (CRM)
              </label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="New Lead">New Lead (Mới tiếp nhận)</option>
                <option value="Đã liên hệ">Đã liên hệ</option>
                <option value="Đang tư vấn">Đang tư vấn</option>
                <option value="Đã gửi báo giá">Đã gửi báo giá</option>
                <option value="Đang thương lượng">Đang thương lượng</option>
                <option value="Đã cọc">Đã cọc (VietQR)</option>
                <option value="Đã Booking">Đã Booking khóa lịch</option>
                <option value="Đã chụp">Đã chụp</option>
                <option value="Đang hậu kỳ">Đang hậu kỳ</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Lost">Lost (Khách từ chối)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú tư vấn
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Nhu cầu concept, ngày dự kiến, yêu cầu makeup..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isSavingCustomer}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Lưu Thông Tin Vào CRM
            </Button>
          </form>
        )}

        {/* ====================================================
            TAB 2: TRỢ LÝ AI (AI CO-PILOT & AUTO-PILOT)
            ==================================================== */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Auto-Pilot Switch Card */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                activeConv.assignedSalesName?.includes('AI')
                  ? 'bg-purple-50/70 border-purple-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                      activeConv.assignedSalesName?.includes('AI')
                        ? 'bg-purple-600'
                        : 'bg-slate-400'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">AI Auto-Pilot 24/7</p>
                    <p className="text-[10px] text-slate-500">
                      {activeConv.assignedSalesName?.includes('AI')
                        ? '🤖 Đang bật tự động trả lời'
                        : 'Chế độ nhân sự thủ công'}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={activeConv.assignedSalesName?.includes('AI') ? 'primary' : 'outline'}
                  className={activeConv.assignedSalesName?.includes('AI') ? 'bg-purple-600 hover:bg-purple-700' : ''}
                  onClick={handleToggleAiAuto}
                >
                  {activeConv.assignedSalesName?.includes('AI') ? 'Đang Bật' : 'Bật AI'}
                </Button>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-bold text-xs text-slate-900">
                    Thấu Hiểu Khách Hàng (Insights)
                  </span>
                </div>
                <Badge
                  variant={
                    aiAnalysis.interestLevel.includes('Hot')
                      ? 'danger'
                      : aiAnalysis.interestLevel.includes('Warm')
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {aiAnalysis.interestLevel}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ý định:</span>
                  <strong className="text-slate-800 text-right">{aiAnalysis.customerIntent}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trường học:</span>
                  <strong className="text-slate-800">{aiAnalysis.detectedSchool || 'Chưa rõ'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lớp:</span>
                  <strong className="text-slate-800">{aiAnalysis.detectedClass || 'Chưa rõ'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SĐT bóc tách:</span>
                  <strong className="font-mono text-emerald-700">
                    {aiAnalysis.detectedPhone || 'Chưa có'}
                  </strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-purple-700 border-purple-200 hover:bg-purple-50"
                  onClick={handleApplyAiInsights}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Đồng Bộ Sang Hồ Sơ CRM
                </Button>
              </div>
            </div>

            {/* Suggested Smart Replies */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gợi Ý Câu Trả Lời Thông Minh (3 Gợi Ý)
              </p>

              {aiAnalysis.suggestedReplies.map((reply, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 hover:border-purple-300 transition-colors shadow-2xs"
                >
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{reply}"
                  </p>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAiSendReply(reply)}
                      rightIcon={<Send className="w-3 h-3" />}
                    >
                      Gửi ngay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 3: PANCAKE POS NHANH (QUICK BOOKING)
            ==================================================== */}
        {activeTab === 'pos' && (
          <form onSubmit={handleCreatePosBooking} className="space-y-3.5 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gói dịch vụ kỷ yếu
              </label>
              <select
                value={posPackage}
                onChange={e => {
                  setPosPackage(e.target.value);
                  const pkg = servicePackages.find(p => p.name === e.target.value);
                  if (pkg) setPosPrice(pkg.price);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {servicePackages.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="Sĩ số (bạn)"
                type="number"
                min={1}
                value={posStudentCount}
                onChange={e => setPosStudentCount(Number(e.target.value) || 1)}
              />
              <Input
                label="Đơn giá / bạn (đ)"
                type="number"
                step={1000}
                value={posPrice}
                onChange={e => setPosPrice(Number(e.target.value) || 0)}
              />
            </div>

            {/* Total Preview */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
              <span className="text-amber-800 font-semibold">Tổng doanh thu dự kiến:</span>
              <span className="font-bold font-mono text-amber-900 text-sm">
                {(posStudentCount * posPrice).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="Tiền cọc (đ)"
                type="number"
                step={100000}
                value={posDeposit}
                onChange={e => setPosDeposit(Number(e.target.value) || 0)}
              />
              <Input
                label="Ngày chụp"
                type="date"
                value={posShootDate}
                onChange={e => setPosShootDate(e.target.value)}
              />
            </div>

            <Input
              label="Địa điểm chụp"
              value={posLocation}
              onChange={e => setPosLocation(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isCreatingBooking}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Tạo Booking & Bắn Vào CRM
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
