import React from 'react';
import { AppView } from '../../types';
import {
  MessageSquare,
  ShoppingBag,
  Settings,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface AppSidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalUnreadCount: number;
  totalOrdersCount: number;
  crmStatus: string;
  onOpenChannelsModal: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  totalUnreadCount,
  totalOrdersCount,
  crmStatus,
  onOpenChannelsModal
}) => {
  const navItems = [
    {
      id: 'inbox' as AppView,
      label: 'Hộp Thư Đa Kênh',
      icon: MessageSquare,
      badge: totalUnreadCount > 0 ? totalUnreadCount : null,
      badgeColor: 'bg-rose-500 text-white'
    }
  ];

  return (
    <aside
      className={`h-full bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-all duration-200 border-r border-slate-800 select-none z-20 ${
        isCollapsed ? 'w-16' : 'w-56 sm:w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white tracking-tight truncate">
                  PANCAKE XOĂN
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-semibold px-1 py-0.2 rounded border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Hộp thư & CRM POS</p>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        <div className={`px-2 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Phân Hệ'}
        </div>

        {navItems.map(item => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {!isCollapsed && item.badge !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge !== null && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}

        {/* Channels Configuration Button */}
        <button
          onClick={onOpenChannelsModal}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Cấu hình Fanpage & Webhook' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
          {!isCollapsed && <span className="truncate flex-1 text-left">Kết Nối Fanpage</span>}
        </button>

        <div className="pt-2">
          <div className={`px-2 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•••' : 'Liên Kết'}
          </div>

          {/* Direct link to CRM Xoan */}
          <a
            href="https://crm.xoanmedia.com"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Mở hệ thống quản trị CRM Xoăn Media"
          >
            <Building2 className="w-4 h-4 shrink-0 text-amber-400" />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">Mở CRM Xoăn</span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0" />
              </>
            )}
          </a>
        </div>
      </div>

      {/* Footer: User profile & CRM Backend Health */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 p-1.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0 border border-slate-600">
              DK
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-white truncate">Duy Kool</span>
                <span className="text-[9px] text-slate-400">Admin</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    crmStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className="text-[10px] text-slate-400 truncate">
                  CRM {crmStatus === 'connected' ? 'Kết nối OK' : 'Ngoại tuyến'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-1">
            <div
              className={`w-2 h-2 rounded-full ${
                crmStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              title={`CRM: ${crmStatus}`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
