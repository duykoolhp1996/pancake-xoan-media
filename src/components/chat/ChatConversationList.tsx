import React from 'react';
import { FacebookChatConversation, SalesStaff } from '../../types';
import { PANCAKE_CHANNELS, PancakeChannel } from '../../data/mockPancakeData';
import { MessengerIcon } from '../common/MessengerIcon';
import { Search, X, Bot, Filter, User, CheckCheck, Clock } from 'lucide-react';

interface ChatConversationListProps {
  conversations: FacebookChatConversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterTab: 'all' | 'unreplied' | 'unread' | 'has_phone' | 'deposited';
  onFilterTabChange: (tab: 'all' | 'unreplied' | 'unread' | 'has_phone' | 'deposited') => void;
  staffFilter: string;
  onStaffFilterChange: (staff: string) => void;
  salesStaff: SalesStaff[];
  selectedChannelId: string;
  onSelectChannelId: (chId: string) => void;
  isMobileListVisible: boolean;
}

const STAGE_BADGES: Record<string, { bg: string; text: string }> = {
  'New Lead': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  'Đã liên hệ': { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  'Đang tư vấn': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  'Đã gửi báo giá': { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  'Đã cọc': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  'Đã đặt cọc': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  'Đã Booking': { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
  'Hoàn thành': { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800' },
  'Lost': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' }
};

export const ChatConversationList: React.FC<ChatConversationListProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  filterTab,
  onFilterTabChange,
  staffFilter,
  onStaffFilterChange,
  salesStaff,
  selectedChannelId,
  onSelectChannelId,
  isMobileListVisible
}) => {
  return (
    <div
      className={`${
        isMobileListVisible ? 'flex' : 'hidden'
      } md:flex w-full md:w-80 lg:w-84 xl:w-92 bg-white border-r border-slate-200/90 flex-col shrink-0 h-full select-none z-10`}
    >
      {/* Search & Channel Selection Header */}
      <div className="p-3 border-b border-slate-200/80 space-y-2.5 bg-slate-50/60">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên, SĐT, trường, lớp..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px] font-medium">
          <button
            onClick={() => onFilterTabChange('all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            Tất cả ({conversations.length})
          </button>
          <button
            onClick={() => onFilterTabChange('unreplied')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
              filterTab === 'unreplied'
                ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            Chưa trả lời
          </button>
          <button
            onClick={() => onFilterTabChange('has_phone')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
              filterTab === 'has_phone'
                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            Có SĐT
          </button>
          <button
            onClick={() => onFilterTabChange('unread')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
              filterTab === 'unread'
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
            }`}
          >
            Chưa đọc
          </button>
        </div>

        {/* Staff Filter Dropdown */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">
            Phụ trách:
          </span>
          <select
            value={staffFilter}
            onChange={e => onStaffFilterChange(e.target.value)}
            className="flex-1 py-1 px-2 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Tất cả nhân sự</option>
            {salesStaff.map(s => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/90">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Không tìm thấy hội thoại phù hợp
          </div>
        ) : (
          conversations.map(conv => {
            const isActive = conv.id === activeId;
            const isUnread = conv.unreadCount > 0;
            const stageBadge = conv.pipelineStage ? STAGE_BADGES[conv.pipelineStage] : null;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-3 transition-colors cursor-pointer relative group flex items-start gap-3 ${
                  isActive
                    ? 'bg-indigo-50/50 border-l-3 border-indigo-600'
                    : 'hover:bg-slate-50/80 bg-white border-l-3 border-transparent'
                }`}
              >
                {/* Avatar with Platform Badge */}
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={conv.customerAvatar}
                    alt={conv.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                    <MessengerIcon size={9} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-xs truncate tracking-tight ${
                        isUnread || isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-800'
                      }`}
                    >
                      {conv.customerName}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {conv.lastMessageTime}
                    </span>
                  </div>

                  {/* School/Class or Phone badge */}
                  {(conv.customerSchool || conv.customerClass || conv.customerPhone) && (
                    <div className="text-[10px] text-slate-500 truncate mb-1">
                      {conv.customerClass && <span className="font-semibold text-slate-700">Lớp {conv.customerClass} </span>}
                      {conv.customerSchool && <span>• {conv.customerSchool}</span>}
                    </div>
                  )}

                  {/* Last Message Snippet */}
                  <p
                    className={`text-[11px] truncate leading-normal mb-1.5 ${
                      isUnread ? 'font-semibold text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {conv.lastMessage || 'Chưa có tin nhắn'}
                  </p>

                  {/* Badges: Stage, AI auto, Tags */}
                  <div className="flex flex-wrap items-center gap-1">
                    {stageBadge && conv.pipelineStage && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${stageBadge.bg} ${stageBadge.text}`}
                      >
                        {conv.pipelineStage}
                      </span>
                    )}

                    {conv.assignedSalesName?.includes('AI') && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                        <Bot className="w-2.5 h-2.5 text-purple-600" />
                        <span>AI Auto</span>
                      </span>
                    )}

                    {conv.customerPhone && (
                      <span className="text-[9px] font-medium font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {conv.customerPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Unread indicator dot */}
                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
