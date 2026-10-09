import React, { useState } from 'react';
import { FacebookApiService } from '../../services/facebookApiService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { MessengerIcon } from '../common/MessengerIcon';
import {
  Sparkles,
  RefreshCw,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy
} from 'lucide-react';

interface ChannelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncFacebookLive: () => void;
}

export const ChannelConfigModal: React.FC<ChannelConfigModalProps> = ({
  isOpen,
  onClose,
  onSyncFacebookLive
}) => {
  const toast = useToast();
  const [tokenInput, setTokenInput] = useState(FacebookApiService.getPageToken());
  const [pageIdInput, setPageIdInput] = useState(FacebookApiService.getPageId());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    name: string;
    id: string;
    pictureUrl?: string;
    isNeverExpires?: boolean;
    scopes?: string[];
  } | null>(null);

  // Test Facebook Token
  const handleTestConnection = async () => {
    if (!tokenInput.trim()) {
      toast.warning('Vui lòng nhập Page Access Token trước khi kiểm tra');
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      let activeToken = tokenInput.trim();
      let res = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,picture{url}&access_token=${activeToken}`
      );
      let data = await res.json();

      const pageExtraction = await FacebookApiService.resolvePageTokenIfUserToken(activeToken);
      if (pageExtraction) {
        activeToken = pageExtraction.pageToken;
        setTokenInput(activeToken);
        setPageIdInput(pageExtraction.pageId);
        FacebookApiService.setPageToken(activeToken);
        FacebookApiService.setPageId(pageExtraction.pageId);

        res = await fetch(
          `https://graph.facebook.com/v19.0/me?fields=id,name,picture{url}&access_token=${activeToken}`
        );
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error?.message || 'Token không hợp lệ hoặc đã hết hạn.');

      const debugData = await FacebookApiService.debugToken(activeToken).catch(() => null);
      const isNeverExpires = debugData ? debugData.expires_at === 0 : false;
      const scopes = debugData?.scopes || [];

      setTestResult({
        name: data.name,
        id: data.id,
        pictureUrl: data.picture?.data?.url,
        isNeverExpires,
        scopes
      });
      if (!pageIdInput) setPageIdInput(data.id);
      toast.success(`✅ Kết nối thành công tới Fanpage: "${data.name}"`);
    } catch (err: any) {
      toast.error(`Lỗi kiểm tra token: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Save config
  const handleSaveConfig = async () => {
    let token = tokenInput.trim();
    let pageId = pageIdInput.trim() || FacebookApiService.getPageId();

    const pageExtraction = await FacebookApiService.resolvePageTokenIfUserToken(token);
    if (pageExtraction) {
      token = pageExtraction.pageToken;
      pageId = pageExtraction.pageId;
      setTokenInput(token);
      setPageIdInput(pageId);
    }

    FacebookApiService.setPageToken(token);
    FacebookApiService.setPageId(pageId);
    toast.success('🎉 Đã lưu cài đặt Fanpage thành công!');

    onSyncFacebookLive();
    onClose();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kết Nối Fanpage Facebook & Meta Webhook"
      description="Đồng bộ tin nhắn hai chiều giữa Fanpage Xoăn Media và Pancake App"
      maxWidth="xl"
      footer={
        <>
          <Button variant="outline" size="md" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveConfig}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Lưu Cấu Hình
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Meta App Info */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">Meta App: Crm-xoan-media</span>
              <Badge variant="success" size="sm">
                ĐÃ XÁC THỰC
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              App ID: <code className="font-mono text-indigo-700 font-semibold">{FacebookApiService.getAppId()}</code>
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <Input
            label="1. ID Fanpage (Facebook Page ID)"
            required
            value={pageIdInput}
            onChange={e => setPageIdInput(e.target.value)}
            placeholder="Ví dụ: 111065964964204"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              2. Mã Truy Cập Trang (Page Access Token) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Dán chuỗi Token vĩnh viễn bắt đầu bằng EAAP..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none break-all"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            isLoading={isTesting}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          >
            Kiểm Tra & Tự Kích Hoạt Token Vĩnh Viễn
          </Button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-3">
              {testResult.pictureUrl ? (
                <img
                  src={testResult.pictureUrl}
                  alt={testResult.name}
                  className="w-10 h-10 rounded-full border border-emerald-300"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                  FB
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">{testResult.name}</p>
                <p className="text-[11px] text-emerald-700 font-mono">ID: {testResult.id}</p>
              </div>
              <Badge variant="success">Hợp lệ</Badge>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2 text-[10px]">
              <span className="font-medium text-emerald-800">
                {testResult.isNeverExpires ? '🕒 Hạn: Vĩnh viễn (Never Expires)' : '🕒 Hạn: Tạm thời'}
              </span>
            </div>
          </div>
        )}

        {/* Webhook Configuration */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs">Cấu Hình Meta Webhook (Tin Nhắn Realtime)</span>
            <a
              href="https://developers.facebook.com/docs/messenger-platform/webhooks"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 text-[11px]"
            >
              Tài liệu Webhook <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500 font-sans">Callback URL:</span>
              <div className="flex items-center gap-1">
                <code className="text-indigo-700 font-bold truncate max-w-xs">
                  https://crm.xoanmedia.com/api/facebook/webhook
                </code>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard('https://crm.xoanmedia.com/api/facebook/webhook', 'Callback URL')
                  }
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-500 font-sans">Verify Token:</span>
              <div className="flex items-center gap-1">
                <code className="text-emerald-700 font-bold">xoanmedia_meta_webhook_2026</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard('xoanmedia_meta_webhook_2026', 'Verify Token')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
