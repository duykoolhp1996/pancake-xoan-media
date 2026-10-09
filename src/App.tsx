import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  PANCAKE_CHANNELS,
  PANCAKE_AVAILABLE_TAGS,
  PANCAKE_QUICK_SCRIPTS,
  INITIAL_PANCAKE_CONVERSATIONS,
  PancakeChannel,
  PancakeTagDef
} from './data/mockPancakeData';
import { FacebookApiService } from './services/facebookApiService';
import { CrmApiService } from './services/crmApiService';
import {
  FacebookChatConversation,
  FacebookChatMessage,
  Customer,
  Booking,
  ServicePackage,
  SalesStaff,
  PipelineStage
} from './types';
import { MessengerIcon } from './components/common/MessengerIcon';
import {
  Search,
  Send,
  Phone,
  ExternalLink,
  ThumbsUp,
  Image as ImageIcon,
  CheckCheck,
  User,
  Tag,
  DollarSign,
  Calendar,
  Sparkles,
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  PlusCircle,
  FileText,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  RefreshCw,
  Settings,
  Check,
  X,
  Share2,
  ShoppingBag,
  CreditCard,
  QrCode,
  Layers,
  ChevronDown,
  UserCheck,
  Camera
} from 'lucide-react';

const STAGE_COLORS: Partial<Record<string, { bg: string; text: string; border: string }>> = {
  'New Lead': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Đã liên hệ': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Đang tư vấn': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Đã gửi báo giá': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Đang thương lượng': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Đã cọc': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Đã đặt cọc': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Book ngày': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Đã Booking': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Đã chụp': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Đang hậu kỳ': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Giao ảnh': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Đã bàn giao': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Hoàn thành': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'Lost': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Chăm sóc lại': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Mới tiếp nhận': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
};

export default function App() {
  // State: Conversations
  const [conversations, setConversations] = useState<FacebookChatConversation[]>(() => {
    const saved = localStorage.getItem('pancake_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Xóa bỏ 100% data demo cũ VÀ dữ liệu kênh Duy Hiền Digital Marketing cũ
          const realOnly = parsed.filter(
            (c: any) =>
              c &&
              c.id &&
              !String(c.id).startsWith('pan-') &&
              !c.pageName?.includes('Duy Hiền') &&
              c.customerName !== 'Meta Business Agent' &&
              c.channelId !== 'fb-xoan-hn' &&
              c.channelId !== '411200738737677' &&
              (c.channelId === '111065964964204' || c.pageName?.includes('Xoăn Media'))
          );
          if (realOnly.length > 0) return realOnly;
        }
      } catch {}
    }
    return INITIAL_PANCAKE_CONVERSATIONS;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return INITIAL_PANCAKE_CONVERSATIONS[0]?.id || '';
  });

  // State: CRM API & Metadata
  const [crmUrl, setCrmUrl] = useState<string>(CrmApiService.getBaseUrl());
  const [crmStatus, setCrmStatus] = useState<string>('connected');
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([
    { id: 'pkg-1', name: 'Gói BASIC (299k/bạn)', price: 299000 },
    { id: 'pkg-2', name: 'Gói CONCEPT VIP (499k/bạn)', price: 499000 },
    { id: 'pkg-3', name: 'Gói ĐIỆN ẢNH THE TRIP (699k/bạn)', price: 699000 },
    { id: 'pkg-4', name: 'Gói PROM DẠ HỘI (399k/bạn)', price: 399000 }
  ]);
  const [salesStaff, setSalesStaff] = useState<SalesStaff[]>([
    { id: 'user-admin', name: 'Duy Kool (Admin)' },
    { id: 'sales-lananh', name: 'Lan Anh (Sales)' },
    { id: 'sales-hoanganh', name: 'Hoàng Anh (Sales)' }
  ]);

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('pancake_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Auto select active conversation if list changes
  useEffect(() => {
    if (conversations.length === 0) {
      if (INITIAL_PANCAKE_CONVERSATIONS.length > 0) {
        setConversations(INITIAL_PANCAKE_CONVERSATIONS);
        setActiveId(INITIAL_PANCAKE_CONVERSATIONS[0].id);
      } else {
        if (activeId !== '') setActiveId('');
      }
    } else if (!activeId || !conversations.some(c => c.id === activeId)) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // Xóa bỏ triệt để dữ liệu cũ của kênh Duy Hiền Digital Marketing khỏi state & localStorage
  useEffect(() => {
    const hasOldDuyHien = conversations.some(
      c =>
        c.pageName?.includes('Duy Hiền') ||
        c.customerName === 'Meta Business Agent' ||
        c.channelId === 'fb-xoan-hn' ||
        c.channelId === '411200738737677' ||
        (c.channelId !== '111065964964204' && !c.pageName?.includes('Xoăn Media'))
    );
    if (hasOldDuyHien || conversations.length === 0) {
      setConversations(INITIAL_PANCAKE_CONVERSATIONS);
      setActiveId(INITIAL_PANCAKE_CONVERSATIONS[0]?.id || '');
      localStorage.setItem('pancake_conversations', JSON.stringify(INITIAL_PANCAKE_CONVERSATIONS));
    }
  }, []);

  const handleForceResetToXoanMedia = () => {
    setConversations(INITIAL_PANCAKE_CONVERSATIONS);
    setActiveId(INITIAL_PANCAKE_CONVERSATIONS[0]?.id || '');
    localStorage.setItem('pancake_conversations', JSON.stringify(INITIAL_PANCAKE_CONVERSATIONS));
    setFbSyncError(null);
  };

  // Load CRM API data on startup
  useEffect(() => {
    CrmApiService.checkHealth()
      .then(() => setCrmStatus('connected'))
      .catch(() => setCrmStatus('offline'));

    CrmApiService.getServicePackages().then(pkgs => {
      if (pkgs && pkgs.length > 0) setServicePackages(pkgs);
    });

    CrmApiService.getSalesStaff().then(stf => {
      if (stf && stf.length > 0) setSalesStaff(stf);
    });

    // Tự động tải tin nhắn thật từ Fanpage khi vào ứng dụng
    handleSyncFacebookLive(false).catch(() => {});
  }, []);

  // Realtime Live Polling: Tự động quét và nhảy tin nhắn mới mỗi 3.5 giây
  useEffect(() => {
    const pollTimer = setInterval(() => {
      handleSyncFacebookLive(true).catch(() => {});
    }, 3500);

    return () => clearInterval(pollTimer);
  }, []);

  // Channel & Filter State
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'unreplied' | 'unread' | 'has_phone' | 'no_phone' | 'deposited'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile layout
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Right POS Panel
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'customer' | 'pos' | 'templates' | 'tags'>('customer');

  // Quick Reply dropdown / Slash shortcut popup
  const [inputText, setInputText] = useState('');
  const [showQuickReplyPopup, setShowQuickReplyPopup] = useState(false);
  const [quickReplyFilter, setQuickReplyFilter] = useState('');

  // Dropdown states
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showAssignStaffMenu, setShowAssignStaffMenu] = useState(false);

  // Editable Customer Info
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustClass, setEditCustClass] = useState('');
  const [editCustSchool, setEditCustSchool] = useState('');
  const [noteText, setNoteText] = useState('');

  // Pancake POS Quick Order State
  const [posSelectedPackage, setPosSelectedPackage] = useState(servicePackages[1]?.name || 'Gói CONCEPT VIP (499k/bạn)');
  const [posPackagePrice, setPosPackagePrice] = useState(servicePackages[1]?.price || 499000);
  const [posStudentCount, setPosStudentCount] = useState(40);
  const [posDepositAmount, setPosDepositAmount] = useState(2000000);
  const [posShootDate, setPosShootDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [posLocation, setPosLocation] = useState('Trường học + Phim trường');
  const [posNotes, setPosNotes] = useState('');
  const [posSuccessMsg, setPosSuccessMsg] = useState<string | null>(null);

  // Facebook & Webhook Config Modal State
  const [showFbConfigModal, setShowFbConfigModal] = useState(false);
  const [fbTokenInput, setFbTokenInput] = useState(FacebookApiService.getPageToken());
  const [fbPageIdInput, setFbPageIdInput] = useState(FacebookApiService.getPageId());
  const [fbConfigStatus, setFbConfigStatus] = useState<string | null>(null);
  const [isTestingFb, setIsTestingFb] = useState(false);
  const [isSyncingFb, setIsSyncingFb] = useState(false);
  const [fbTestSuccess, setFbTestSuccess] = useState<{
    name: string;
    id: string;
    pictureUrl?: string;
    isNeverExpires?: boolean;
    scopes?: string[];
  } | null>(null);
  const [fbSyncError, setFbSyncError] = useState<string | null>(null);

  // Active Conversation
  const activeConv = conversations.find(c => c.id === activeId) || conversations[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  useEffect(() => {
    if (activeConv) {
      if (activeConv.unreadCount > 0) {
        setConversations(prev =>
          prev.map(c => (c.id === activeConv.id ? { ...c, unreadCount: 0 } : c))
        );
      }
      setEditCustName(activeConv.customerName || '');
      setEditCustPhone(activeConv.customerPhone || '');
      setEditCustClass(activeConv.customerClass || '');
      setEditCustSchool(activeConv.customerSchool || '');
      setNoteText(activeConv.notes || '');
    }
  }, [activeConv?.id]);

  // Audio Ting Ting
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  // Filtered Conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (selectedChannelId !== 'all') {
        const selectedCh = PANCAKE_CHANNELS.find(ch => ch.id === selectedChannelId);
        const matchChannelId = c.channelId === selectedChannelId;
        const matchPlatform = selectedCh && c.channel === selectedCh.platform;
        if (!matchChannelId && !matchPlatform) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.customerName.toLowerCase().includes(q);
        const matchPhone = (c.customerPhone || '').includes(q);
        const matchClass = (c.customerClass || '').toLowerCase().includes(q);
        const matchSchool = (c.customerSchool || '').toLowerCase().includes(q);
        const matchNotes = (c.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchClass && !matchSchool && !matchNotes) return false;
      }
      if (filterTab === 'unreplied' && c.isReplied) return false;
      if (filterTab === 'unread' && (!c.unreadCount || c.unreadCount <= 0)) return false;
      if (filterTab === 'has_phone' && !c.customerPhone) return false;
      if (filterTab === 'no_phone' && c.customerPhone) return false;
      if (filterTab === 'deposited') {
        const hasDepTag = c.tags.some(t => t.includes('cọc') || t.includes('Cọc'));
        const hasDepStage = c.pipelineStage?.includes('cọc') || c.pipelineStage?.includes('Booking');
        if (!hasDepTag && !hasDepStage) return false;
      }
      if (selectedTagFilter && !c.tags.includes(selectedTagFilter)) return false;
      if (staffFilter !== 'all' && c.assignedSalesName !== staffFilter) return false;
      return true;
    });
  }, [conversations, selectedChannelId, searchQuery, filterTab, selectedTagFilter, staffFilter]);

  // Send message
  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content || !activeConv) return;

    const newMsg: FacebookChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'sales',
      senderName: 'Sales Tư Vấn',
      text: content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: content,
              lastMessageTime: newMsg.timestamp,
              isReplied: true,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );

    // Call Facebook API if connected
    if (activeConv.facebookPsid) {
      FacebookApiService.sendMessage(activeConv.facebookPsid, content)
        .then(() => {
          setTimeout(() => handleSyncFacebookLive(true), 800);
        })
        .catch(() => {});
    }

    if (textToSend === undefined) {
      setInputText('');
      setShowQuickReplyPopup(false);
    }
  };

  // Quick Card VietQR
  const handleSendVietQrCard = () => {
    if (!activeConv) return;
    const newMsg: FacebookChatMessage = {
      id: `msg-qr-${Date.now()}`,
      sender: 'sales',
      senderName: 'Sales Tư Vấn',
      text: '💳 Xoăn Media gửi bạn mã VietQR chuyển khoản cọc giữ lịch nhé:',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      cardType: 'vietqr',
      cardData: {
        bankName: 'MB Bank (Ngân Hàng Quân Đội)',
        accountNo: '09876543210',
        accountHolder: 'TA VAN DUY',
        depositAmount: 2000000,
        transferSyntax: `${(activeConv.customerClass || 'LOP').toUpperCase()} - COC KY YEU`
      }
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: '[Thẻ VietQR Chuyển Khoản Cọc]',
              lastMessageTime: newMsg.timestamp,
              isReplied: true,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );
  };

  // Quick Card Quote
  const handleSendQuoteCard = () => {
    if (!activeConv) return;
    const count = Number(posStudentCount) || 40;
    const price = Number(posPackagePrice) || 499000;
    const total = count * price;

    const newMsg: FacebookChatMessage = {
      id: `msg-q-${Date.now()}`,
      sender: 'sales',
      senderName: 'Sales Tư Vấn',
      text: '📸 Xoăn Media gửi bạn bảng báo giá chi tiết cho lớp:',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      cardType: 'quote',
      cardData: {
        packageName: posSelectedPackage,
        packagePrice: price,
        studentCount: count,
        totalAmount: total,
        depositAmount: 2000000,
        shootDate: posShootDate,
        location: posLocation
      }
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: `[Báo giá: ${posSelectedPackage}]`,
              lastMessageTime: newMsg.timestamp,
              isReplied: true,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );
  };

  // Save Customer Info to CRM API
  const handleSaveCustomerInfo = async () => {
    if (!activeConv) return;

    // Local update
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              customerName: editCustName || c.customerName,
              customerPhone: editCustPhone || c.customerPhone,
              customerClass: editCustClass || c.customerClass,
              customerSchool: editCustSchool || c.customerSchool,
              notes: noteText
            }
          : c
      )
    );

    // REST API call to CRM
    await CrmApiService.saveCustomer({
      id: activeConv.customerId,
      name: editCustName || activeConv.customerName,
      phone: editCustPhone || activeConv.customerPhone,
      className: editCustClass || activeConv.customerClass,
      schoolName: editCustSchool || activeConv.customerSchool,
      notes: noteText
    });

    setPosSuccessMsg('Đã lưu thông tin khách hàng vào CRM API!');
    setTimeout(() => setPosSuccessMsg(null), 3000);
  };

  // Pancake POS: Create Quick Booking to CRM
  const handleCreatePosBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv) return;

    const bookingCode = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const studentCount = Number(posStudentCount) || 40;
    const packagePrice = Number(posPackagePrice) || 499000;
    const totalAmount = studentCount * packagePrice;
    const depositAmount = Number(posDepositAmount) || 2000000;

    // 1. Send Booking Success Card to Chat
    const newMsg: FacebookChatMessage = {
      id: `msg-bk-${Date.now()}`,
      sender: 'sales',
      senderName: 'Pancake POS',
      text: `🎉 Đã tạo đơn thành công mã ${bookingCode}! Lịch chụp đã được khóa trên CRM.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      cardType: 'booking_success',
      cardData: {
        bookingCode,
        packageName: posSelectedPackage,
        packagePrice,
        studentCount,
        totalAmount,
        depositAmount,
        shootDate: posShootDate,
        location: posLocation
      }
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              pipelineStage: 'Đã Booking',
              tags: Array.from(new Set([...c.tags, '💰 Đã cọc VietQR'])),
              lastMessage: `[Chốt Đơn: ${bookingCode}]`,
              lastMessageTime: newMsg.timestamp,
              isReplied: true,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );

    // 2. Call CRM REST API
    await CrmApiService.createBooking({
      code: bookingCode,
      customerId: activeConv.customerId || `cust-${Date.now()}`,
      customerName: editCustName || activeConv.customerName,
      className: editCustClass || activeConv.customerClass || '',
      schoolName: editCustSchool || activeConv.customerSchool || '',
      shootDate: posShootDate,
      location: posLocation,
      studentCount,
      packageName: posSelectedPackage,
      packagePrice,
      totalAmount,
      depositAmount,
      paymentStatus: 'Đã cọc',
      bookingStatus: 'Chờ xếp ekip',
      notes: posNotes
    });

    setPosSuccessMsg(`🎉 Đã tạo đơn ${bookingCode} & đồng bộ thành công vào CRM!`);
    setTimeout(() => setPosSuccessMsg(null), 4000);
  };

  // Refs theo dõi tin nhắn cuối cùng để phát hiện tin nhắn mới Realtime
  const lastMessageIdMapRef = useRef<Map<string, string>>(new Map());
  const isFirstSyncRef = useRef<boolean>(true);

  // Sync Facebook Live Conversations (hỗ trợ silent mode cho auto-polling nền)
  const handleSyncFacebookLive = async (silent: boolean = false) => {
    if (!silent) setIsSyncingFb(true);
    try {
      const fbConvs = await FacebookApiService.getConversations();
      const pageId = FacebookApiService.getPageId();

      if (fbConvs && fbConvs.length > 0) {
        let hasNewIncomingFromCustomer = false;

        const mapped: FacebookChatConversation[] = fbConvs.map(fc => {
          const custPart = fc.participants?.data?.find(p => p.id !== pageId) || fc.participants?.data?.[0];
          const psid = custPart?.id || '';
          const custName = custPart?.name || 'Khách Hàng Facebook';
          const rawMsgs = (fc.messages?.data || []).slice().reverse();
          const lastRawMsg = rawMsgs[rawMsgs.length - 1];
          const msgTimestamp = lastRawMsg?.created_time
            ? new Date(lastRawMsg.created_time).getTime()
            : (fc.updated_time ? new Date(fc.updated_time).getTime() : Date.now());

          // Kiểm tra xem đây có phải là tin nhắn mới phát sinh hay không
          const prevMsgId = lastMessageIdMapRef.current.get(`fb-${fc.id}`);
          if (lastRawMsg?.id) {
            if (!isFirstSyncRef.current && prevMsgId && prevMsgId !== lastRawMsg.id) {
              // Có tin nhắn mới! Nếu người gửi là khách hàng -> bật cờ thông báo chuông
              if (lastRawMsg.from?.id !== pageId) {
                hasNewIncomingFromCustomer = true;
              }
            }
            lastMessageIdMapRef.current.set(`fb-${fc.id}`, lastRawMsg.id);
          }

          return {
            id: `fb-${fc.id}`,
            facebookPsid: psid,
            isLiveFacebook: true,
            customerName: custName,
            customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(custName)}&background=0084FF&color=fff&bold=true`,
            customerClass: 'Khách Fanpage Live',
            customerSchool: 'Facebook Messenger',
            channel: 'facebook',
            channelId: pageId,
            pageName: 'Xoăn Media - Chụp Ảnh Kỷ Yếu',
            unreadCount: fc.unread_count || 0,
            isReplied: false,
            lastMessage: lastRawMsg?.message || (lastRawMsg?.attachments ? '[Hình ảnh / Tệp]' : 'Tin nhắn Messenger'),
            lastMessageTime: lastRawMsg?.created_time
              ? new Date(lastRawMsg.created_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : 'Mới đây',
            lastMessageTimestamp: msgTimestamp,
            assignedSalesName: 'Duy Kool (Admin)',
            pipelineStage: 'Đang tư vấn',
            tags: ['Facebook Fanpage', 'Live Chat'],
            messages: rawMsgs.map(rm => ({
              id: rm.id,
              sender: rm.from?.id === pageId ? 'sales' : 'customer',
              senderName: rm.from?.name || (rm.from?.id === pageId ? 'Xoăn Media' : custName),
              text: rm.message || '[Hình ảnh]',
              timestamp: new Date(rm.created_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }))
          };
        });

        if (isFirstSyncRef.current) {
          isFirstSyncRef.current = false;
        }

        // Hợp nhất dữ liệu và sắp xếp cuộc trò chuyện có tin nhắn mới nhất lên ĐẦU DANH SÁCH
        setConversations(prev => {
          const prevMap = new Map(prev.map(c => [c.id, c]));
          const mergedList: FacebookChatConversation[] = mapped.map(newC => {
            const oldC = prevMap.get(newC.id);
            if (!oldC) return newC;

            // Giữ lại các metadata tùy chỉnh do sales gắn trên CRM (tag, pipeline, notes, phone...)
            return {
              ...oldC,
              ...newC,
              customerPhone: oldC.customerPhone || newC.customerPhone,
              customerClass: oldC.customerClass || newC.customerClass,
              customerSchool: oldC.customerSchool || newC.customerSchool,
              tags: Array.from(new Set([...oldC.tags, ...newC.tags])),
              pipelineStage: oldC.pipelineStage || newC.pipelineStage,
              notes: oldC.notes || newC.notes,
              // Nếu đang mở đúng cuộc chat này thì coi như đã đọc unreadCount = 0
              unreadCount: activeId === newC.id ? 0 : (newC.unreadCount || oldC.unreadCount)
            };
          });

          // Giữ các conversation khác không nằm trong đợt tải này
          prev.forEach(c => {
            if (!mapped.some(m => m.id === c.id)) {
              mergedList.push(c);
            }
          });

          // Tự động sắp xếp hội thoại có tin nhắn mới nhất lên đầu danh sách!
          mergedList.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

          return mergedList;
        });

        if (mapped.length > 0) {
          setActiveId(prev => prev || mapped[0].id);
        }

        if (hasNewIncomingFromCustomer) {
          playNotificationSound();
        }

        setFbSyncError(null);
      } else {
        setConversations(prev => (prev.length === 0 ? INITIAL_PANCAKE_CONVERSATIONS : prev));
      }
    } catch (err: any) {
      if (!silent) {
        console.warn('Lỗi đồng bộ Facebook:', err);
        const isExpired =
          err.message?.includes('expired') ||
          err.message?.includes('OAuthException') ||
          err.message?.includes('190') ||
          err.message?.includes('Session');
        if (isExpired) {
          setFbSyncError('⚠️ Token Facebook đã hết hạn. Hãy bấm nút "Cài Đặt Page" bên trên để dán Token mới nhé!');
        } else {
          setFbSyncError(`Lỗi đồng bộ: ${err.message || 'Không thể tải tin nhắn Facebook'}`);
        }
      }
      setConversations(prev => {
        const hasInvalid = prev.some(
          c =>
            c.pageName?.includes('Duy Hiền') ||
            c.customerName === 'Meta Business Agent' ||
            (c.channelId !== '111065964964204' && !c.pageName?.includes('Xoăn Media'))
        );
        return hasInvalid || prev.length === 0 ? INITIAL_PANCAKE_CONVERSATIONS : prev;
      });
    } finally {
      if (!silent) setIsSyncingFb(false);
    }
  };

  // Test Facebook Token
  const handleTestFbConnection = async () => {
    if (!fbTokenInput.trim()) {
      setFbConfigStatus('Vui lòng nhập Page Access Token trước khi kiểm tra.');
      return;
    }
    setIsTestingFb(true);
    setFbConfigStatus(null);
    try {
      let activeToken = fbTokenInput.trim();
      let res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture{url}&access_token=${activeToken}`);
      let data = await res.json();

      // Nếu token là User Token (tài khoản cá nhân quản trị viên), tự động trích xuất Page Token
      const pageExtraction = await FacebookApiService.resolvePageTokenIfUserToken(activeToken);
      if (pageExtraction) {
        activeToken = pageExtraction.pageToken;
        setFbTokenInput(activeToken);
        setFbPageIdInput(pageExtraction.pageId);
        FacebookApiService.setPageToken(activeToken);
        FacebookApiService.setPageId(pageExtraction.pageId);

        // Fetch lại thông tin của chính Fanpage
        res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture{url}&access_token=${activeToken}`);
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error?.message || 'Token không hợp lệ hoặc đã hết hạn.');

      const debugData = await FacebookApiService.debugToken(activeToken).catch(() => null);
      const isNeverExpires = debugData ? debugData.expires_at === 0 : false;
      const scopes = debugData?.scopes || [];

      setFbTestSuccess({
        name: data.name,
        id: data.id,
        pictureUrl: data.picture?.data?.url,
        isNeverExpires,
        scopes
      });
      if (!fbPageIdInput) setFbPageIdInput(data.id);
      setFbConfigStatus(`✅ Kết nối thành công tới Fanpage: "${data.name}" (ID: ${data.id})`);
    } catch (err: any) {
      setFbTestSuccess(null);
      setFbConfigStatus(`❌ Lỗi kiểm tra: ${err.message}`);
    } finally {
      setIsTestingFb(false);
    }
  };

  const handleSaveFbConfig = async () => {
    let token = fbTokenInput.trim();
    let pageId = fbPageIdInput.trim() || FacebookApiService.getPageId();

    // Tự động phân giải User Token sang Page Token nếu người dùng dán User Token
    const pageExtraction = await FacebookApiService.resolvePageTokenIfUserToken(token);
    if (pageExtraction) {
      token = pageExtraction.pageToken;
      pageId = pageExtraction.pageId;
      setFbTokenInput(token);
      setFbPageIdInput(pageId);
    }

    FacebookApiService.setPageToken(token);
    FacebookApiService.setPageId(pageId);
    setFbConfigStatus('🎉 Đã lưu cài đặt Fanpage thành công!');
    
    // Tự động đồng bộ ngay
    handleSyncFacebookLive().catch(() => {});

    setTimeout(() => {
      setShowFbConfigModal(false);
      setFbConfigStatus(null);
    }, 1200);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F0F2F5] overflow-hidden text-neutral-900 select-none">
      {/* ========================================================
          PANCAKE TOP BAR: BRAND, CRM API STATUS & TOOLS
          ======================================================== */}
      <div className="h-13 bg-neutral-900 text-white px-3 sm:px-5 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10 select-none">
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-xs font-black text-sm">
              🥞
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs tracking-tight text-white">PANCAKE XOĂN</span>
                <span className="bg-amber-400/20 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-amber-400/30">
                  STANDALONE APP
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 hidden sm:block">Hộp Thư Đa Kênh & Pancake POS</p>
            </div>
          </div>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          {/* CRM API Connection Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 border ${
                crmStatus === 'connected'
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
                  : 'text-amber-400 bg-amber-950/60 border-amber-500/40'
              }`}
              title={`Kết nối REST API máy chủ CRM: ${crmUrl}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${crmStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              CRM API {crmStatus === 'connected' ? 'Live' : 'Offline'}
            </span>

            {/* Meta Page Indicator */}
            <span className="text-neutral-400 text-[11px] truncate hidden md:inline">
              Page: <strong className="text-white">Xoăn Media - Chụp Ảnh Kỷ Yếu</strong>
            </span>

            <button
              onClick={() => setShowFbConfigModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-white/10 hover:bg-white/20 text-neutral-200 rounded-lg transition-colors border border-white/15 cursor-pointer ml-1"
              title="Cài đặt kết nối Fanpage & Webhook"
            >
              <Settings className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Cài Đặt Page</span>
            </button>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Live Auto-Polling Status Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-extrabold select-none shadow-2xs"
            title="Đang tự động quét và nhảy tin nhắn mới từ Fanpage mỗi 3.5 giây"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Tự Động Nhảy Tin (3.5s)</span>
            <span className="sm:hidden">Live 3s</span>
          </div>

          {/* Deep link button to CRM Xoan */}
          <a
            href="https://crm.xoanmedia.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 bg-[#B8F23D] hover:bg-[#a6de2f] text-neutral-950 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Mở ứng dụng CRM Xoăn Media trên tab mới"
          >
            <span>🏢 Mở CRM Xoăn</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Sync Facebook Live */}
          <button
            onClick={() => handleSyncFacebookLive(false)}
            disabled={isSyncingFb}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Bấm để làm mới tin nhắn ngay lập tức"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingFb ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncingFb ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* Facebook Token Error / Sync Warning Banner */}
      {fbSyncError && (
        <div className="bg-amber-400 text-neutral-950 px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-amber-500 shadow-xs shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-950" />
            <span className="truncate">{fbSyncError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={handleForceResetToXoanMedia}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-black transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              title="Khôi phục ngay danh sách 25 hội thoại kỷ yếu của Fanpage Xoăn Media"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Nạp Hội Thoại Xoăn Media</span>
            </button>
            <button
              onClick={() => setShowFbConfigModal(true)}
              className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-[11px] font-black transition-colors cursor-pointer"
            >
              Cập Nhật Token Mới
            </button>
            <button
              onClick={() => setFbSyncError(null)}
              className="p-1 hover:bg-amber-500 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-neutral-900" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PANCAKE WORKSPACE: 4 COLUMNS LAYOUT
          ======================================================== */}
      <div className="flex-1 flex min-h-0 overflow-hidden bg-[#F0F2F5]">
        {/* ----------------------------------------------------
            CỘT 1: DẢI KÊNH ĐA NỀN TẢNG (OMNICHANNEL RAIL)
            ---------------------------------------------------- */}
        <div className="w-14 sm:w-16 bg-[#18191A] flex flex-col items-center py-3 space-y-3 shrink-0 border-r border-black/20 select-none z-10">
          <span className="text-[8px] font-black tracking-widest text-neutral-500 uppercase">KÊNH</span>

          <div className="flex-1 w-full overflow-y-auto space-y-2.5 px-2 scrollbar-none flex flex-col items-center">
            {PANCAKE_CHANNELS.map(ch => {
              const isActive = selectedChannelId === ch.id;
              const chUnread =
                ch.id === 'all'
                  ? conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
                  : conversations
                      .filter(c => c.channelId === ch.id || c.channel === ch.platform)
                      .reduce((sum, c) => sum + (c.unreadCount || 0), 0);

              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`relative group w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'ring-2 ring-amber-400 bg-white/20 shadow-md scale-105'
                      : 'hover:bg-white/10 opacity-75 hover:opacity-100'
                  }`}
                  title={`${ch.name} (${ch.badge})`}
                >
                  {ch.id === 'all' ? (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      ALL
                    </div>
                  ) : ch.platform === 'facebook' ? (
                    <div className="w-full h-full rounded-2xl bg-[#0084FF] flex items-center justify-center text-white shadow-xs">
                      <MessengerIcon size={20} />
                    </div>
                  ) : ch.platform === 'zalo' ? (
                    <div className="w-full h-full rounded-2xl bg-[#0068FF] flex items-center justify-center text-white font-black text-xs shadow-xs">
                      Zalo
                    </div>
                  ) : ch.platform === 'tiktok' ? (
                    <div className="w-full h-full rounded-2xl bg-[#000000] border border-white/20 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      🎵
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      📷
                    </div>
                  )}

                  {chUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#18191A] shadow-xs">
                      {chUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 w-full flex flex-col items-center">
            <button
              onClick={() => setShowFbConfigModal(true)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Cài đặt kết nối Fanpage Facebook & Webhook"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            CỘT 2: DANH SÁCH HỘI THOẠI & BỘ LỌC PANCAKE
            ---------------------------------------------------- */}
        <div
          className={`${
            mobileView === 'list' ? 'flex' : 'hidden'
          } md:flex w-full md:w-80 lg:w-88 xl:w-96 bg-white border-r border-black/[0.08] flex-col shrink-0 h-full select-none`}
        >
          {/* Header & Filter Controls */}
          <div className="p-3 border-b border-black/[0.06] space-y-2.5 bg-neutral-50/70">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, trường, lớp, nội dung..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
              <button
                onClick={() => { setFilterTab('all'); setSelectedTagFilter(null); }}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'all' && !selectedTagFilter
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-black/[0.06]'
                }`}
              >
                Tất cả ({conversations.length})
              </button>
              <button
                onClick={() => setFilterTab('unreplied')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'unreplied'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
                }`}
              >
                Chưa trả lời
              </button>
              <button
                onClick={() => setFilterTab('has_phone')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'has_phone'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                Có SĐT
              </button>
              <button
                onClick={() => setFilterTab('deposited')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'deposited'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
                }`}
              >
                Đã cọc
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 space-y-3 my-auto">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs">
                  💬
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-700">Chưa có hội thoại nào</p>
                  <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Dữ liệu demo đã được xóa sạch. Bấm để tải tin nhắn thật từ Fanpage.
                  </p>
                </div>
                <button
                  onClick={() => handleSyncFacebookLive(false)}
                  disabled={isSyncingFb}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <RefreshCw size={12} className={isSyncingFb ? 'animate-spin' : ''} />
                  <span>{isSyncingFb ? 'Đang đồng bộ...' : 'Đồng bộ Facebook'}</span>
                </button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 space-y-2">
                <p className="text-2xl">🥞</p>
                <p className="text-xs font-bold">Không tìm thấy hội thoại phù hợp</p>
                <p className="text-[11px] text-neutral-400">Thử xóa bộ lọc hoặc tìm từ khóa khác</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = activeId === conv.id;
                const stageStyle = conv.pipelineStage ? STAGE_COLORS[conv.pipelineStage] : null;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveId(conv.id);
                      setMobileView('chat');
                    }}
                    className={`p-3 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-blue-600 shadow-2xs'
                        : 'bg-white hover:bg-neutral-50/80 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={conv.customerAvatar}
                          alt={conv.customerName}
                          className="w-10 h-10 rounded-full object-cover border border-black/10"
                        />
                        {conv.channel === 'facebook' && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0084FF] text-white flex items-center justify-center p-0.5 border border-white">
                            <MessengerIcon size={10} />
                          </span>
                        )}
                        {conv.channel === 'zalo' && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0068FF] text-white font-black text-[7px] flex items-center justify-center border border-white">
                            Z
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-black text-neutral-900 truncate">
                            {conv.customerName}
                          </h4>
                          <span className="text-[10px] text-neutral-400 font-medium shrink-0 ml-1">
                            {conv.lastMessageTime}
                          </span>
                        </div>

                        {/* Class / School */}
                        {(conv.customerClass || conv.customerSchool) && (
                          <p className="text-[10px] text-neutral-500 font-medium truncate mb-1">
                            {conv.customerClass} {conv.customerSchool ? `• ${conv.customerSchool}` : ''}
                          </p>
                        )}

                        {/* Last message snippet */}
                        <p className={`text-[11px] truncate mb-1.5 ${conv.unreadCount > 0 ? 'font-bold text-neutral-900' : 'text-neutral-600'}`}>
                          {conv.lastMessage}
                        </p>

                        {/* Tags & Badges */}
                        <div className="flex flex-wrap items-center gap-1">
                          {stageStyle && conv.pipelineStage && (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}>
                              {conv.pipelineStage}
                            </span>
                          )}

                          {conv.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Unread dot */}
                      {conv.unreadCount > 0 && (
                        <div className="shrink-0 flex flex-col items-end">
                          <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ----------------------------------------------------
            CỘT 3: KHUNG CHAT CHI TIẾT (CHAT ENGINE)
            ---------------------------------------------------- */}
        <div
          className={`${
            mobileView === 'chat' ? 'flex' : 'hidden'
          } md:flex flex-1 flex-col h-full bg-[#F0F2F5] min-w-0 border-r border-black/[0.08]`}
        >
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="h-14 bg-white border-b border-black/[0.08] px-4 flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={activeConv.customerAvatar}
                    alt={activeConv.customerName}
                    className="w-9 h-9 rounded-full object-cover border border-black/10 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-xs text-neutral-900 truncate">
                        {activeConv.customerName}
                      </h3>
                      {activeConv.customerPhone && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-mono">
                          {activeConv.customerPhone}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 truncate">
                      Kênh: {activeConv.pageName || 'Fanpage Xoăn Media'} • Phụ trách: {activeConv.assignedSalesName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                    title={showRightPanel ? 'Thu gọn panel POS' : 'Mở panel POS & Khách hàng'}
                  >
                    {showRightPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeConv.messages.map((msg, index) => {
                  const isSales = msg.sender === 'sales';

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isSales ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%]">
                        {!isSales && (
                          <img
                            src={activeConv.customerAvatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
                          />
                        )}

                        <div
                          className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                            isSales
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-white text-neutral-900 border border-black/[0.06] rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {/* Card: Quote */}
                          {msg.cardType === 'quote' && msg.cardData && (
                            <div className="mt-2.5 p-3 rounded-xl bg-white text-neutral-900 border border-blue-200 shadow-xs space-y-2">
                              <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                                <span className="font-black text-xs text-blue-700">📸 BÁO GIÁ KỶ YẾU</span>
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.5 rounded">
                                  {msg.cardData.studentCount} Học Sinh
                                </span>
                              </div>
                              <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Gói chụp:</span>
                                  <span className="font-bold">{msg.cardData.packageName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Tổng chi phí:</span>
                                  <span className="font-black text-blue-700">
                                    {(msg.cardData.totalAmount || 0).toLocaleString('vi-VN')} đ
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Card: VietQR */}
                          {msg.cardType === 'vietqr' && msg.cardData && (
                            <div className="mt-2.5 p-3 rounded-xl bg-white text-neutral-900 border border-emerald-200 shadow-xs space-y-2">
                              <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                                <span className="font-black text-xs text-emerald-700">💳 VIETQR CHUYỂN KHOẢN CỌC</span>
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded">
                                  MB BANK
                                </span>
                              </div>
                              <div className="flex items-center justify-center p-2 bg-neutral-50 rounded-lg">
                                <img
                                  src={`https://img.vietqr.io/image/MB-09876543210-compact2.png?amount=${msg.cardData.depositAmount}&addInfo=${encodeURIComponent(msg.cardData.transferSyntax || '')}&accountName=TA%20VAN%20DUY`}
                                  alt="VietQR"
                                  className="w-40 h-auto rounded border"
                                />
                              </div>
                              <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Tiền cọc:</span>
                                  <span className="font-black text-emerald-700">
                                    {(msg.cardData.depositAmount || 0).toLocaleString('vi-VN')} đ
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">Nội dung CK:</span>
                                  <code className="font-bold text-neutral-800">{msg.cardData.transferSyntax}</code>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Card: Booking Success */}
                          {msg.cardType === 'booking_success' && msg.cardData && (
                            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 text-neutral-900 border border-emerald-300 shadow-xs space-y-1.5">
                              <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>ĐƠN BOOKING ĐÃ KHÓA TRÊN CRM</span>
                              </div>
                              <p className="text-[11px] font-mono text-emerald-900">
                                Mã đơn: <strong>{msg.cardData.bookingCode}</strong> • Ngày chụp: <strong>{msg.cardData.shootDate}</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] text-neutral-400 mt-0.5 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Toolbar & Action Buttons */}
              <div className="p-3 bg-white border-t border-black/[0.08] space-y-2">
                {/* 1-Tap Action Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <button
                    onClick={handleSendQuoteCard}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors shrink-0 cursor-pointer"
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>Báo giá nhanh</span>
                  </button>

                  <button
                    onClick={handleSendVietQrCard}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Gửi VietQR cọc</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickReplyPopup(!showQuickReplyPopup);
                      setQuickReplyFilter('');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition-colors shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Kịch bản (/)</span>
                  </button>
                </div>

                {/* Input Text Form */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn tư vấn... (gõ / để mở mẫu kịch bản nhanh)"
                    value={inputText}
                    onChange={e => {
                      setInputText(e.target.value);
                      if (e.target.value.startsWith('/')) {
                        setShowQuickReplyPopup(true);
                        setQuickReplyFilter(e.target.value.slice(1).toLowerCase());
                      } else {
                        setShowQuickReplyPopup(false);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-neutral-400"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>

                {/* Slash Popup */}
                {showQuickReplyPopup && (
                  <div className="p-2 bg-white rounded-2xl shadow-xl border border-black/10 max-h-56 overflow-y-auto space-y-1">
                    <p className="text-[10px] font-black text-neutral-400 px-2 py-0.5 uppercase tracking-wider">
                      MẪU TIN NHẮN NHANH ({PANCAKE_QUICK_SCRIPTS.length})
                    </p>
                    {PANCAKE_QUICK_SCRIPTS.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setInputText(s.text);
                          setShowQuickReplyPopup(false);
                        }}
                        className="p-2 hover:bg-neutral-50 rounded-xl cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-blue-700">{s.title}</span>
                          <code className="text-[10px] text-neutral-400 font-mono">{s.code}</code>
                        </div>
                        <p className="text-[11px] text-neutral-600 line-clamp-1">{s.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-neutral-50/40 select-none">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                <MessengerIcon size={32} />
              </div>
              <h3 className="text-base font-bold text-neutral-800 mb-1">Pancake Xoăn Media</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-5 leading-relaxed">
                Toàn bộ dữ liệu demo mẫu đã được dọn sạch. Bạn hãy đồng bộ để tải các cuộc trò chuyện thực tế từ Fanpage Facebook hoặc cấu hình kênh.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSyncFacebookLive(false)}
                  disabled={isSyncingFb}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} className={isSyncingFb ? 'animate-spin' : ''} />
                  <span>{isSyncingFb ? 'Đang tải tin nhắn...' : '⚡ Đồng bộ tin nhắn Fanpage'}</span>
                </button>
                <button
                  onClick={() => setShowFbConfigModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Settings size={14} />
                  <span>Cài đặt Fanpage</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------
            CỘT 4: PANCAKE POS & HỒ SƠ KHÁCH HÀNG (RIGHT PANEL)
            ---------------------------------------------------- */}
        {showRightPanel && activeConv && (
          <div className="w-80 lg:w-96 bg-white border-l border-black/[0.08] flex flex-col h-full shrink-0 select-none">
            {/* Tab Header */}
            <div className="p-2 bg-neutral-50 border-b border-black/[0.06] flex items-center gap-1 text-[11px] font-bold">
              <button
                onClick={() => setRightPanelTab('customer')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  rightPanelTab === 'customer'
                    ? 'bg-white text-neutral-900 shadow-2xs font-black'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Hồ Sơ Khách
              </button>
              <button
                onClick={() => setRightPanelTab('pos')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  rightPanelTab === 'pos'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-black'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                🛒 Pancake POS
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4">
              {posSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{posSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: CUSTOMER PROFILE */}
              {rightPanelTab === 'customer' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Tên khách hàng</label>
                      <input
                        type="text"
                        value={editCustName}
                        onChange={e => setEditCustName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl font-bold text-neutral-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        value={editCustPhone}
                        onChange={e => setEditCustPhone(e.target.value)}
                        placeholder="Chưa có SĐT"
                        className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl font-mono text-neutral-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">Lớp</label>
                        <input
                          type="text"
                          value={editCustClass}
                          onChange={e => setEditCustClass(e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-neutral-600 block mb-1">Trường học</label>
                        <input
                          type="text"
                          value={editCustSchool}
                          onChange={e => setEditCustSchool(e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Ghi chú tư vấn</label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl text-neutral-900 focus:bg-white focus:outline-none text-[11px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveCustomerInfo}
                      className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Lưu Hồ Sơ Khách Hàng Vào CRM
                    </button>
                  </div>

                  {/* Deep link button to CRM */}
                  <div className="pt-3 border-t space-y-2">
                    <a
                      href="https://crm.xoanmedia.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-blue-200"
                    >
                      <span>🏢 Mở Khách Hàng Trên CRM 360°</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 2: PANCAKE POS */}
              {rightPanelTab === 'pos' && (
                <form onSubmit={handleCreatePosBooking} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Chọn gói kỷ yếu</label>
                    <select
                      value={posSelectedPackage}
                      onChange={e => {
                        setPosSelectedPackage(e.target.value);
                        const match = servicePackages.find(p => p.name === e.target.value);
                        if (match) setPosPackagePrice(match.price);
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 border rounded-xl font-bold text-xs"
                    >
                      {servicePackages.map(p => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Sĩ số (bạn)</label>
                      <input
                        type="number"
                        min={1}
                        value={posStudentCount}
                        onChange={e => setPosStudentCount(Number(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Đơn giá/bạn</label>
                      <input
                        type="number"
                        step={1000}
                        value={posPackagePrice}
                        onChange={e => setPosPackagePrice(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl font-bold text-right"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-800 font-bold">Tổng doanh thu dự kiến:</span>
                      <span className="font-black text-amber-900 text-sm">
                        {(posStudentCount * posPackagePrice).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Tiền cọc (đ)</label>
                      <input
                        type="number"
                        step={100000}
                        value={posDepositAmount}
                        onChange={e => setPosDepositAmount(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl font-bold font-mono text-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-600 block mb-1">Ngày chụp</label>
                      <input
                        type="date"
                        value={posShootDate}
                        onChange={e => setPosShootDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 block mb-1">Địa điểm chụp</label>
                    <input
                      type="text"
                      value={posLocation}
                      onChange={e => setPosLocation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-50 border rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    ⚡ TẠO BOOKING & CHỐT LỊCH TRÊN CRM
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL CÀI ĐẶT KẾT NỐI FANPAGE FACEBOOK & WEBHOOK
          ======================================================== */}
      {showFbConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-xs">
                  <MessengerIcon size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-2">
                    Kết Nối Fanpage Facebook & Webhook
                    <span className="text-[10px] bg-amber-400 text-neutral-900 font-extrabold px-1.5 py-0.5 rounded">
                      Meta Graph API
                    </span>
                  </h3>
                  <p className="text-xs text-blue-100">Đồng bộ tin nhắn & khách hàng tự động với Pancake</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFbConfigModal(false);
                  setFbConfigStatus(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Meta App Info */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-neutral-900 text-xs">Meta App: Crm-xoan-media</span>
                    <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                      ĐÃ KẾT NỐI
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    App ID: <code className="font-mono text-blue-700 font-bold">{FacebookApiService.getAppId()}</code> • Khóa bí mật: <code className="font-mono text-neutral-500">aea735...83be</code>
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" /> Xác Thực OK
                </span>
              </div>

              {/* Form Input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1">
                    1. ID Fanpage (Facebook Page ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fbPageIdInput}
                    onChange={e => setFbPageIdInput(e.target.value)}
                    placeholder="Ví dụ: 100083303952726"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-neutral-50 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-800 mb-1">
                    2. Mã Truy Cập Trang (Page Access Token) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={fbTokenInput}
                    onChange={e => setFbTokenInput(e.target.value)}
                    placeholder="Dán chuỗi Token vĩnh viễn bắt đầu bằng EAA..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-neutral-50 font-mono text-[11px] resize-none break-all"
                  />
                </div>
              </div>

              {/* Test Result */}
              {fbTestSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-3">
                    {fbTestSuccess.pictureUrl ? (
                      <img src={fbTestSuccess.pictureUrl} alt={fbTestSuccess.name} className="w-10 h-10 rounded-full border border-emerald-300 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shrink-0">FB</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-neutral-900 text-xs truncate">{fbTestSuccess.name}</p>
                      <p className="text-[11px] text-emerald-700 font-mono truncate">ID: {fbTestSuccess.id} • Đã kết nối hợp lệ</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-black shrink-0">
                      Live OK
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 font-bold">
                      {fbTestSuccess.isNeverExpires ? '🕒 Hạn: Vĩnh viễn (Never Expires)' : '🕒 Hạn: Tạm thời'}
                    </span>
                    {fbTestSuccess.scopes && fbTestSuccess.scopes.map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {fbConfigStatus && (
                <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  fbConfigStatus.includes('Lỗi') || fbConfigStatus.includes('❌')
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fbConfigStatus}</span>
                </div>
              )}

              {/* Webhook Configuration Info */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-neutral-800 text-xs">⚡ Cấu Hình Webhook (Tin Nhắn Realtime)</span>
                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">TỨC THÌ</span>
                  </div>
                  <a
                    href="https://developers.facebook.com/docs/messenger-platform/webhooks"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    Tài liệu Webhook <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-black/5 font-mono text-[11px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-neutral-500 font-sans">Callback URL:</span>
                    <code className="text-blue-700 font-bold select-all break-all">https://crm.xoanmedia.com/api/facebook/webhook</code>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-neutral-500 font-sans">Verify Token:</span>
                    <code className="text-emerald-700 font-bold select-all">xoanmedia_meta_webhook_2026</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-sans">Trường đăng ký:</span>
                    <span className="text-neutral-700 font-sans font-semibold">messages, messaging_postbacks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-neutral-50 border-t border-black/[0.06] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleTestFbConnection}
                disabled={isTestingFb}
                className="px-3.5 py-2 text-xs font-bold text-neutral-800 bg-white hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingFb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                <span>⚡ Kiểm Tra & Tự Kích Hoạt Token Vĩnh Viễn</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFbConfigModal(false);
                    setFbConfigStatus(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveFbConfig}
                  className="px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu Cấu Hình</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
