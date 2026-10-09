import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  FacebookChatConversation,
  FacebookChatMessage,
  Booking,
  ServicePackage,
  SalesStaff,
  AppView
} from './types';
import {
  PANCAKE_CHANNELS,
  INITIAL_PANCAKE_CONVERSATIONS
} from './data/mockPancakeData';
import { FacebookApiService } from './services/facebookApiService';
import { CrmApiService } from './services/crmApiService';
import { AiChatService, AiConversationAnalysis } from './services/aiChatService';
import { ToastProvider, useToast } from './components/ui/Toast';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { ChatConversationList } from './components/chat/ChatConversationList';
import { ChatMessageStream } from './components/chat/ChatMessageStream';
import { ChatRightPanel } from './components/chat/ChatRightPanel';
import { OrdersView } from './components/orders/OrdersView';
import { ChannelConfigModal } from './components/settings/ChannelConfigModal';
import { X } from 'lucide-react';

function PancakeAppContent() {
  const toast = useToast();

  // Navigation State
  const [activeView, setActiveView] = useState<AppView>('inbox');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pancake_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('pancake_sidebar_collapsed', String(next));
      return next;
    });
  };

  // State: Conversations
  const [conversations, setConversations] = useState<FacebookChatConversation[]>(() => {
    const saved = localStorage.getItem('pancake_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

  // State: Draft messages per conversation
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pancake_drafts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const handleSaveDraft = useCallback((convId: string, text: string) => {
    setDrafts(prev => {
      const next = { ...prev, [convId]: text };
      localStorage.setItem('pancake_drafts', JSON.stringify(next));
      return next;
    });
  }, []);

  // State: Orders & Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('pancake_bookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [
      {
        id: 'bk-1001',
        code: 'BK-849201',
        customerId: 'cust-1',
        customerName: 'Bạn Thu Thảo (Lớp Trưởng)',
        className: '12A1',
        schoolName: 'THPT Đông Hải',
        shootDate: '2026-10-25',
        location: 'Trường học + Phim trường Smiley Ville',
        studentCount: 42,
        packageName: 'Gói CONCEPT VIP (499k/bạn)',
        packagePrice: 499000,
        totalAmount: 20958000,
        depositAmount: 2000000,
        paymentStatus: 'Đã cọc',
        bookingStatus: 'Chờ xếp ekip',
        notes: 'Chụp concept Retro Hongkong 90s + Prom dạ hội',
        createdAt: '09/10/2026 10:30'
      },
      {
        id: 'bk-1002',
        code: 'BK-519284',
        customerId: 'cust-2',
        customerName: 'Hoàng Minh Tuấn',
        className: '12 Tin',
        schoolName: 'THPT Chuyên Trần Phú',
        shootDate: '2026-11-02',
        location: 'Vịnh Lan Hạ & Bãi biển',
        studentCount: 38,
        packageName: 'Gói ĐIỆN ẢNH THE TRIP (699k/bạn)',
        packagePrice: 699000,
        totalAmount: 26562000,
        depositAmount: 3000000,
        paymentStatus: 'Đã cọc',
        bookingStatus: 'Đã xếp Ekip',
        notes: 'Chụp 2 ngày 1 đêm, có quay flycam 4K',
        createdAt: '08/10/2026 15:45'
      }
    ];
  });

  const handleAddBooking = useCallback((booking: Booking) => {
    setBookings(prev => {
      const next = [booking, ...prev];
      localStorage.setItem('pancake_bookings', JSON.stringify(next));
      return next;
    });
  }, []);

  // State: CRM Metadata
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
    { id: 'sales-hoanganh', name: 'Hoàng Anh (Sales)' },
    { id: 'sales-ai', name: '🤖 Bot AI Tư Vấn (Auto)' }
  ]);

  // Filters State
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'unreplied' | 'unread' | 'has_phone' | 'deposited'>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Panels & Views
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [rightPanelTab, setRightPanelTab] = useState<'customer' | 'ai' | 'pos'>('customer');
  const [mobileChatView, setMobileChatView] = useState<'list' | 'chat'>('list');
  const [showChannelModal, setShowChannelModal] = useState<boolean>(false);
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);

  // Sync state
  const [isSyncingFb, setIsSyncingFb] = useState(false);

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('pancake_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Auto select active conversation
  useEffect(() => {
    if (conversations.length === 0) {
      if (INITIAL_PANCAKE_CONVERSATIONS.length > 0) {
        setConversations(INITIAL_PANCAKE_CONVERSATIONS);
        setActiveId(INITIAL_PANCAKE_CONVERSATIONS[0].id);
      }
    } else if (!activeId || !conversations.some(c => c.id === activeId)) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

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

    // Auto sync on start
    handleSyncFacebookLive(true).catch(() => {});
  }, []);

  // Polling Live Facebook Messages (every 2.5s)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      handleSyncFacebookLive(true).catch(() => {});
    }, 2500);

    const handleFocus = () => {
      handleSyncFacebookLive(true).catch(() => {});
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Sound ting ting
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

  // Active Conversation
  const activeConv = useMemo(() => {
    return conversations.find(c => c.id === activeId) || conversations[0] || null;
  }, [conversations, activeId]);

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
      if (filterTab === 'deposited') {
        const hasDepTag = c.tags.some(t => t.includes('cọc') || t.includes('Cọc'));
        const hasDepStage = c.pipelineStage?.includes('cọc') || c.pipelineStage?.includes('Booking');
        if (!hasDepTag && !hasDepStage) return false;
      }
      if (staffFilter !== 'all' && c.assignedSalesName !== staffFilter) return false;
      return true;
    });
  }, [conversations, selectedChannelId, searchQuery, filterTab, staffFilter]);

  // AI Realtime Analysis
  const aiAnalysis = useMemo<AiConversationAnalysis>(() => {
    if (!activeConv) {
      return {
        customerIntent: 'Đang chờ hội thoại...',
        customerPersonality: 'Bình thường',
        interestLevel: 'Mới tìm hiểu (Cold)',
        suggestedReplies: []
      };
    }
    return AiChatService.analyze(activeConv.customerName, activeConv.messages);
  }, [activeConv?.id, activeConv?.messages, activeConv?.customerName]);

  // Total Unread Count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  // Refs for realtime deduplication & tracking
  const lastMessageIdMapRef = useRef<Map<string, string>>(new Map());
  const isFirstSyncRef = useRef<boolean>(true);

  // Sync Facebook Live
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

          // Realtime new incoming detector
          const prevMsgId = lastMessageIdMapRef.current.get(`fb-${fc.id}`);
          if (lastRawMsg?.id) {
            if (!isFirstSyncRef.current && prevMsgId && prevMsgId !== lastRawMsg.id) {
              if (lastRawMsg.from?.id !== pageId) {
                hasNewIncomingFromCustomer = true;
              }
            }
            lastMessageIdMapRef.current.set(`fb-${fc.id}`, lastRawMsg.id);
          }

          const existing = conversations.find(c => c.id === `fb-${fc.id}`);

          return {
            id: `fb-${fc.id}`,
            customerId: existing?.customerId || `cust-fb-${fc.id}`,
            customerName: existing?.customerName || custName,
            customerAvatar:
              existing?.customerAvatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(custName)}&background=0084FF&color=fff&bold=true`,
            customerClass: existing?.customerClass,
            customerSchool: existing?.customerSchool,
            customerPhone: existing?.customerPhone,
            facebookPsid: psid,
            isLiveFacebook: true,
            channel: 'facebook',
            channelId: '111065964964204',
            pageName: 'Xoăn Media - Chụp Ảnh Kỷ Yếu',
            unreadCount: fc.unread_count || 0,
            isReplied: existing ? existing.isReplied : (lastRawMsg ? lastRawMsg.from?.id === pageId : true),
            lastMessage: lastRawMsg?.message || '[Tin nhắn hình ảnh / tệp]',
            lastMessageTime: lastRawMsg?.created_time
              ? new Date(lastRawMsg.created_time).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Gần đây',
            assignedSalesName: existing?.assignedSalesName || 'Duy Kool (Admin)',
            pipelineStage: existing?.pipelineStage || 'New Lead',
            tags: existing?.tags || ['Facebook Live'],
            notes: existing?.notes,
            messages: rawMsgs.map(rm => ({
              id: rm.id,
              sender: rm.from?.id === pageId ? 'sales' : 'customer',
              senderName: rm.from?.id === pageId ? 'Xoăn Media' : custName,
              text: rm.message || '',
              timestamp: new Date(rm.created_time).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              attachments: rm.attachments?.data?.map(att => ({
                type: 'image',
                url: att.image_data?.url || att.file_url || ''
              }))
            }))
          };
        });

        isFirstSyncRef.current = false;
        setConversations(mapped);

        if (hasNewIncomingFromCustomer) {
          playNotificationSound();
          toast.info('🔔 Có tin nhắn mới từ khách hàng trên Fanpage!');
        }
      }
    } catch (err: any) {
      if (!silent) {
        toast.error(`Lỗi đồng bộ: ${err.message || 'Không thể tải tin nhắn Facebook'}`);
      }
    } finally {
      if (!silent) setIsSyncingFb(false);
    }
  };

  // Send message
  const handleSendMessage = async (content: string, imageFile: File | null) => {
    if (!activeConv) return;
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let previewUrl: string | undefined = undefined;
    if (imageFile) {
      previewUrl = URL.createObjectURL(imageFile);
    }

    const newMsg: FacebookChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'sales',
      senderName: activeConv.assignedSalesName || 'Sales Tư Vấn',
      text: content,
      timestamp: nowTime,
      attachments: previewUrl ? [{ type: 'image', url: previewUrl }] : undefined
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: content || '[Hình ảnh]',
              lastMessageTime: nowTime,
              isReplied: true,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );

    // Call Facebook API if live
    if (activeConv.facebookPsid) {
      try {
        if (imageFile) {
          await FacebookApiService.sendImageMessage(activeConv.facebookPsid, imageFile);
          if (content) {
            await FacebookApiService.sendMessage(activeConv.facebookPsid, content);
          }
        } else {
          await FacebookApiService.sendMessage(activeConv.facebookPsid, content);
        }
        setTimeout(() => handleSyncFacebookLive(true), 800);
      } catch (err: any) {
        toast.error(`Lỗi gửi Facebook API: ${err.message}`);
      }
    }
  };

  // Send Quote Card
  const handleSendQuoteCard = () => {
    if (!activeConv) return;
    const newMsg: FacebookChatMessage = {
      id: `msg-q-${Date.now()}`,
      sender: 'sales',
      senderName: 'Sales Tư Vấn',
      text: '📸 Xoăn Media gửi bạn bảng báo giá chi tiết cho lớp:',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      cardType: 'quote',
      cardData: {
        packageName: servicePackages[1]?.name || 'Gói CONCEPT VIP (499k/bạn)',
        packagePrice: servicePackages[1]?.price || 499000,
        studentCount: 40,
        totalAmount: 19960000,
        depositAmount: 2000000,
        location: 'Trường học + Phim trường'
      }
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: `[Báo giá kỷ yếu]`,
              lastMessageTime: newMsg.timestamp,
              isReplied: true,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );
    toast.success('Đã gửi Thẻ Báo Giá vào khung chat');
  };

  // Send VietQR Card
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
    toast.success('Đã gửi Thẻ VietQR chuyển khoản vào khung chat');
  };

  // AI Send Reply
  const handleAiSendReply = async (replyText: string) => {
    if (!activeConv || !replyText.trim()) return;
    await handleSendMessage(replyText.trim(), null);
    toast.success('🤖 AI đã phản hồi tin nhắn thành công!');
  };

  // Assign Staff
  const handleAssignStaff = (convId: string, staffName: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, assignedSalesName: staffName } : c))
    );
  };

  // Update Conversation
  const handleUpdateConversation = (updated: Partial<FacebookChatConversation>) => {
    if (!activeConv) return;
    setConversations(prev =>
      prev.map(c => (c.id === activeConv.id ? { ...c, ...updated } : c))
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden text-slate-900 select-none font-sans">
      {/* 1. App Header */}
      <AppHeader
        activeView={activeView}
        isSyncingFb={isSyncingFb}
        onRefreshFb={() => handleSyncFacebookLive(false)}
        crmStatus={crmStatus}
        onOpenConfigModal={() => setShowChannelModal(true)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Collapsible Sidebar */}
        <AppSidebar
          activeView={activeView}
          onSelectView={view => {
            setActiveView(view);
            if (view === 'channels') {
              setShowChannelModal(true);
            }
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          totalUnreadCount={totalUnreadCount}
          totalOrdersCount={bookings.length}
          crmStatus={crmStatus}
          onOpenChannelsModal={() => setShowChannelModal(true)}
        />

        {/* 3. Main Content Router */}
        {activeView === 'inbox' && (
          <div className="flex-1 flex min-h-0 overflow-hidden bg-white">
            {/* Region A: Conversation List */}
            <ChatConversationList
              conversations={filteredConversations}
              activeId={activeId}
              onSelectConversation={id => {
                setActiveId(id);
                setMobileChatView('chat');
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterTab={filterTab}
              onFilterTabChange={setFilterTab}
              staffFilter={staffFilter}
              onStaffFilterChange={setStaffFilter}
              salesStaff={salesStaff}
              selectedChannelId={selectedChannelId}
              onSelectChannelId={setSelectedChannelId}
              isMobileListVisible={mobileChatView === 'list'}
            />

            {/* Region B: Chat History & Composer */}
            <div
              className={`flex-1 flex flex-col h-full min-w-0 ${
                mobileChatView === 'chat' ? 'flex' : 'hidden'
              } md:flex`}
            >
              <ChatMessageStream
                activeConv={activeConv}
                salesStaff={salesStaff}
                onSendMessage={handleSendMessage}
                onSendQuoteCard={handleSendQuoteCard}
                onSendVietQrCard={handleSendVietQrCard}
                onAssignStaff={handleAssignStaff}
                showRightPanel={showRightPanel}
                onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
                onMobileBack={() => setMobileChatView('list')}
                onOpenAiTab={() => {
                  setShowRightPanel(true);
                  setRightPanelTab('ai');
                }}
                onOpenLightbox={setPreviewLightboxUrl}
                drafts={drafts}
                onSaveDraft={handleSaveDraft}
              />
            </div>

            {/* Region C: Customer Profile, AI Co-pilot & POS */}
            {showRightPanel && activeConv && (
              <div className="hidden lg:flex h-full">
                <ChatRightPanel
                  activeConv={activeConv}
                  servicePackages={servicePackages}
                  aiAnalysis={aiAnalysis}
                  onUpdateConversation={handleUpdateConversation}
                  onAiSendReply={handleAiSendReply}
                  onAddBooking={handleAddBooking}
                  initialTab={rightPanelTab}
                />
              </div>
            )}
          </div>
        )}

        {/* 4. Orders View */}
        {activeView === 'orders' && (
          <OrdersView
            bookings={bookings}
            servicePackages={servicePackages}
            onAddBooking={handleAddBooking}
            onOpenCustomerChat={() => {
              setActiveView('inbox');
            }}
          />
        )}
      </div>

      {/* 5. Modal Cài Đặt Fanpage & Webhook */}
      <ChannelConfigModal
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        onSyncFacebookLive={() => handleSyncFacebookLive(false)}
      />

      {/* 6. Lightbox Preview Hình Ảnh */}
      {previewLightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-zoom-out"
          onClick={() => setPreviewLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={previewLightboxUrl}
              alt="Phóng to ảnh"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl select-none"
              onClick={e => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setPreviewLightboxUrl(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PancakeAppContent />
    </ToastProvider>
  );
}
