import React, { useState, useRef, useEffect } from 'react';
import {
  FacebookChatConversation,
  FacebookChatMessage,
  SalesStaff
} from '../../types';
import { PANCAKE_QUICK_SCRIPTS } from '../../data/mockPancakeData';
import {
  Send,
  Image as ImageIcon,
  QrCode,
  DollarSign,
  FileText,
  Bot,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  ChevronDown,
  Check,
  User,
  Copy,
  Phone,
  X,
  ExternalLink,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface ChatMessageStreamProps {
  activeConv: FacebookChatConversation | null;
  salesStaff: SalesStaff[];
  onSendMessage: (text: string, imageFile: File | null) => Promise<void>;
  onSendQuoteCard: () => void;
  onSendVietQrCard: () => void;
  onAssignStaff: (convId: string, staffName: string) => void;
  showRightPanel: boolean;
  onToggleRightPanel: () => void;
  onMobileBack: () => void;
  onOpenAiTab: () => void;
  onOpenLightbox: (url: string) => void;
  drafts: Record<string, string>;
  onSaveDraft: (convId: string, text: string) => void;
}

export const ChatMessageStream: React.FC<ChatMessageStreamProps> = ({
  activeConv,
  salesStaff,
  onSendMessage,
  onSendQuoteCard,
  onSendVietQrCard,
  onAssignStaff,
  showRightPanel,
  onToggleRightPanel,
  onMobileBack,
  onOpenAiTab,
  onOpenLightbox,
  drafts,
  onSaveDraft
}) => {
  const toast = useToast();
  const [inputText, setInputText] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [showAssignStaffMenu, setShowAssignStaffMenu] = useState(false);
  const [showQuickScriptsPopup, setShowQuickScriptsPopup] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft when activeConv changes
  useEffect(() => {
    if (activeConv) {
      setInputText(drafts[activeConv.id] || '');
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
      setShowQuickScriptsPopup(false);
    }
  }, [activeConv?.id]);

  // Save draft on change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (activeConv) {
      onSaveDraft(activeConv.id, val);
    }
    if (val.startsWith('/')) {
      setShowQuickScriptsPopup(true);
    } else {
      setShowQuickScriptsPopup(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Handle Send
  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImageFile) || isSending || !activeConv) return;
    setIsSending(true);

    const text = inputText;
    const img = selectedImageFile;

    // Reset input states
    setInputText('');
    onSaveDraft(activeConv.id, '');
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setShowQuickScriptsPopup(false);

    try {
      await onSendMessage(text, img);
    } finally {
      setIsSending(false);
    }
  };

  // Image file picker
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImageFile(file);
      setSelectedImagePreview(URL.createObjectURL(file));
    }
    if (e.target) e.target.value = '';
  };

  // Paste image clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          setSelectedImageFile(file);
          setSelectedImagePreview(URL.createObjectURL(file));
          toast.info('Đã đính kèm ảnh từ Clipboard');
          break;
        }
      }
    }
  };

  // Copy phone number
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success(`Đã sao chép SĐT: ${phone}`);
  };

  if (!activeConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 select-none">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <Bot className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Chưa chọn cuộc trò chuyện</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Hãy chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu tư vấn khách hàng.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/50 min-w-0 border-r border-slate-200/90 relative">
      {/* 1. Chat Header */}
      <div className="h-14 bg-white border-b border-slate-200/90 px-4 flex items-center justify-between shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMobileBack}
            className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative shrink-0">
            <img
              src={activeConv.customerAvatar}
              alt={activeConv.customerName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {activeConv.customerName}
              </h3>

              {activeConv.customerPhone && (
                <button
                  onClick={() => handleCopyPhone(activeConv.customerPhone!)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
                  title="Bấm để sao chép số điện thoại"
                >
                  <Phone className="w-2.5 h-2.5" />
                  <span>{activeConv.customerPhone}</span>
                  <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
              <span className="truncate">{activeConv.pageName || 'Fanpage Kỷ Yếu'}</span>
              <span>•</span>
              <span className="shrink-0">Phụ trách:</span>

              {/* Assign staff dropdown */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowAssignStaffMenu(!showAssignStaffMenu)}
                  className={`font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    activeConv.assignedSalesName?.includes('AI')
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {activeConv.assignedSalesName?.includes('AI') && (
                    <Bot className="w-3 h-3 text-purple-600" />
                  )}
                  <span>{activeConv.assignedSalesName || 'Chưa gán'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showAssignStaffMenu && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Phân công tư vấn
                    </p>
                    {salesStaff.map(s => {
                      const isCurrent = activeConv.assignedSalesName === s.name;
                      const isAi = s.name.includes('AI');
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            onAssignStaff(activeConv.id, s.name);
                            setShowAssignStaffMenu(false);
                            toast.success(`Đã gán cuộc trò chuyện cho ${s.name}`);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span
                            className={`flex items-center gap-1.5 ${
                              isAi ? 'text-purple-700 font-semibold' : ''
                            }`}
                          >
                            {isAi ? (
                              <Bot className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {s.name}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Toggle Panel */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRightPanel}
            title={showRightPanel ? 'Thu gọn thông tin khách' : 'Mở thông tin khách & POS'}
          >
            {showRightPanel ? (
              <PanelRightClose className="w-4 h-4 text-slate-600" />
            ) : (
              <PanelRightOpen className="w-4 h-4 text-slate-600" />
            )}
          </Button>
        </div>
      </div>

      {/* 2. Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {activeConv.messages.map((msg, index) => {
          const isSales = msg.sender === 'sales';

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isSales ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                {!isSales && (
                  <img
                    src={activeConv.customerAvatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                  />
                )}

                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs transition-all ${
                    isSales
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`flex flex-wrap gap-2 ${msg.text ? 'mt-2' : ''}`}>
                      {msg.attachments.map((att, attIdx) => (
                        <div
                          key={attIdx}
                          className="relative rounded-xl overflow-hidden border border-black/10 cursor-pointer"
                          onClick={() => onOpenLightbox(att.url)}
                        >
                          <img
                            src={att.url}
                            alt="Ảnh đính kèm"
                            className="max-h-56 max-w-full sm:max-w-xs object-cover hover:opacity-90 transition-opacity"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Card: VietQR */}
                  {msg.cardType === 'vietqr' && msg.cardData && (
                    <div className="mt-2.5 p-3 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs border-b border-slate-100 pb-1.5">
                        <CreditCard className="w-4 h-4" />
                        <span>MÃ VIETQR CHUYỂN KHOẢN CỌC</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p>
                          Ngân hàng: <strong>{msg.cardData.bankName}</strong>
                        </p>
                        <p>
                          STK: <strong className="font-mono text-indigo-700">{msg.cardData.accountNo}</strong>
                        </p>
                        <p>
                          Chủ TK: <strong>{msg.cardData.accountHolder}</strong>
                        </p>
                        <p>
                          Số tiền cọc:{' '}
                          <strong className="text-emerald-700 font-mono">
                            {(msg.cardData.depositAmount || 2000000).toLocaleString('vi-VN')} đ
                          </strong>
                        </p>
                        <p className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono">
                          Nội dung: {msg.cardData.transferSyntax}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card: Quote */}
                  {msg.cardType === 'quote' && msg.cardData && (
                    <div className="mt-2.5 p-3 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs border-b border-slate-100 pb-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>BẢNG BÁO GIÁ KỶ YẾU TRỌN GÓI</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p>
                          Gói:{' '}
                          <strong className="text-indigo-800">{msg.cardData.packageName}</strong>
                        </p>
                        <p>
                          Sĩ số: <strong>{msg.cardData.studentCount} bạn</strong>
                        </p>
                        <p>
                          Tổng tiền:{' '}
                          <strong className="font-mono text-slate-900">
                            {(msg.cardData.totalAmount || 0).toLocaleString('vi-VN')} đ
                          </strong>
                        </p>
                        <p>
                          Địa điểm: <span>{msg.cardData.location}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card: Booking Success */}
                  {msg.cardType === 'booking_success' && msg.cardData && (
                    <div className="mt-2.5 p-3 bg-emerald-50 text-slate-900 rounded-xl border border-emerald-200 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                        <span>XÁC NHẬN CHỐT ĐƠN: {msg.cardData.bookingCode}</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Đã khóa lịch chụp ngày <strong>{msg.cardData.shootDate}</strong> vào hệ thống CRM.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Action Pills Toolbar */}
      <div className="px-4 py-1.5 bg-white border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-medium"
        >
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Gửi ảnh</span>
        </button>

        <button
          type="button"
          onClick={onSendQuoteCard}
          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-medium border border-indigo-200/60"
        >
          <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
          <span>Báo giá</span>
        </button>

        <button
          type="button"
          onClick={onSendVietQrCard}
          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-medium border border-emerald-200/60"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gửi QR Cọc</span>
        </button>

        <button
          type="button"
          onClick={() => setShowQuickScriptsPopup(!showQuickScriptsPopup)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-medium"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Kịch bản</span>
        </button>

        <button
          type="button"
          onClick={onOpenAiTab}
          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 font-medium border border-purple-200/60"
        >
          <Bot className="w-3.5 h-3.5 text-purple-600" />
          <span>Trợ Lý AI</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* 4. Composer Box */}
      <div className="p-3 bg-white border-t border-slate-200/90 relative">
        {/* Image Attachment Preview */}
        {selectedImagePreview && (
          <div className="mb-2 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={selectedImagePreview}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-cover border border-slate-300"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Hình ảnh đính kèm</p>
                <p className="text-[10px] text-slate-500">{selectedImageFile?.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedImageFile(null);
                setSelectedImagePreview(null);
              }}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập tin nhắn... (gõ / để mở mẫu nhanh, dán ảnh Ctrl+V)"
            value={inputText}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (e.nativeEvent.isComposing) return;
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
          />

          <Button
            variant="primary"
            size="md"
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedImageFile}
            isLoading={isSending}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Gửi</span>
          </Button>
        </div>

        {/* Quick Scripts Popup */}
        {showQuickScriptsPopup && (
          <div className="absolute bottom-full left-3 right-3 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto space-y-1 z-30 animate-in fade-in">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mẫu kịch bản nhanh ({PANCAKE_QUICK_SCRIPTS.length})
              </span>
              <button
                onClick={() => setShowQuickScriptsPopup(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            {PANCAKE_QUICK_SCRIPTS.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setInputText(s.text);
                  if (activeConv) onSaveDraft(activeConv.id, s.text);
                  setShowQuickScriptsPopup(false);
                }}
                className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-indigo-700">{s.title}</span>
                  <code className="text-[10px] text-slate-400 font-mono">{s.code}</code>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1">{s.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
