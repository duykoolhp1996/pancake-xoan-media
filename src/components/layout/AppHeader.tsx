import React from 'react';
import { AppView } from '../../types';
import { RefreshCw, Settings, Building2, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface AppHeaderProps {
  activeView: AppView;
  isSyncingFb: boolean;
  onRefreshFb: () => void;
  crmStatus: string;
  onOpenConfigModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeView,
  isSyncingFb,
  onRefreshFb,
  crmStatus,
  onOpenConfigModal
}) => {
  const titles: Record<AppView, { title: string; subtitle: string }> = {
    inbox: {
      title: 'Hộp Thư Đa Kênh',
      subtitle: 'Đồng bộ tin nhắn Fanpage Facebook Live & Zalo'
    },
    orders: {
      title: 'Quản Lý Đơn Hàng & POS',
      subtitle: 'Danh sách booking kỷ yếu & đơn chốt cọc CRM'
    },
    channels: {
      title: 'Cài Đặt Kênh',
      subtitle: 'Quản lý Fanpage & Meta Webhook'
    }
  };

  const current = titles[activeView] || titles.inbox;

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs select-none z-10">
      {/* Left: View title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
              {current.title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Live (2.5s)</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions & Indicators */}
      <div className="flex items-center gap-2">
        {/* Meta Page Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate max-w-[180px] font-medium text-slate-700">
            Xoăn Media - Kỷ Yếu
          </span>
        </div>

        {/* Refresh Live Messages */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshFb}
          disabled={isSyncingFb}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncingFb ? 'animate-spin text-indigo-600' : 'text-slate-600'}`} />}
        >
          <span className="hidden sm:inline">{isSyncingFb ? 'Đang đồng bộ...' : 'Làm mới'}</span>
        </Button>

        {/* Config Modal button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenConfigModal}
          leftIcon={<Settings className="w-3.5 h-3.5 text-slate-600" />}
          title="Cài đặt Fanpage & Webhook"
        >
          <span className="hidden sm:inline">Cài đặt kênh</span>
        </Button>

        {/* External CRM button */}
        <a
          href="https://crm.xoanmedia.com"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex"
        >
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ExternalLink className="w-3 h-3 text-indigo-200" />}
          >
            Mở CRM Xoăn
          </Button>
        </a>
      </div>
    </header>
  );
};
