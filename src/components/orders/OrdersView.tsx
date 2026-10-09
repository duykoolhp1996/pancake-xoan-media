import React, { useState, useMemo } from 'react';
import { Booking, ServicePackage } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';
import { CrmApiService } from '../../services/crmApiService';
import {
  Search,
  Plus,
  ShoppingBag,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  FileSpreadsheet,
  Printer,
  X,
  CreditCard,
  User,
  MapPin,
  Sparkles
} from 'lucide-react';

interface OrdersViewProps {
  bookings: Booking[];
  servicePackages: ServicePackage[];
  onAddBooking: (booking: Booking) => void;
  onOpenCustomerChat?: (customerName: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  bookings,
  servicePackages,
  onAddBooking,
  onOpenCustomerChat
}) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state tạo đơn mới
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custClass, setCustClass] = useState('');
  const [custSchool, setCustSchool] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(
    servicePackages[1]?.name || 'Gói CONCEPT VIP (499k/bạn)'
  );
  const [packagePrice, setPackagePrice] = useState(servicePackages[1]?.price || 499000);
  const [studentCount, setStudentCount] = useState(40);
  const [depositAmount, setDepositAmount] = useState(2000000);
  const [shootDate, setShootDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [location, setLocation] = useState('Trường học + Phim trường');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = (b.code || '').toLowerCase().includes(q);
        const matchName = b.customerName.toLowerCase().includes(q);
        const matchClass = (b.className || '').toLowerCase().includes(q);
        const matchSchool = (b.schoolName || '').toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchClass && !matchSchool) return false;
      }
      if (filterPayment !== 'all' && b.paymentStatus !== filterPayment) return false;
      return true;
    });
  }, [bookings, searchQuery, filterPayment]);

  // Statistics
  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }, [bookings]);

  const totalDeposit = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);
  }, [bookings]);

  // Handle Form Submit
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) {
      toast.error('Vui lòng nhập họ tên khách hàng');
      return;
    }

    setIsSubmitting(true);
    const code = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const count = Number(studentCount) || 1;
    const price = Number(packagePrice) || 0;
    const total = count * price;
    const deposit = Number(depositAmount) || 0;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      code,
      customerId: `cust-${Date.now()}`,
      customerName: custName.trim(),
      className: custClass.trim(),
      schoolName: custSchool.trim(),
      shootDate,
      location,
      studentCount: count,
      packageName: selectedPackage,
      packagePrice: price,
      totalAmount: total,
      depositAmount: deposit,
      paymentStatus: 'Đã cọc',
      bookingStatus: 'Chờ xếp ekip',
      notes,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    try {
      // Lưu vào máy chủ CRM REST API
      await CrmApiService.createBooking(newBooking);
      onAddBooking(newBooking);
      toast.success(`🎉 Đã tạo đơn thành công mã ${code} và bắn vào CRM!`);
      setShowCreateModal(false);

      // Reset form
      setCustName('');
      setCustPhone('');
      setCustClass('');
      setCustSchool('');
      setNotes('');
    } catch (err: any) {
      toast.error(`Lỗi tạo đơn: ${err.message || 'Không thể lưu vào CRM'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden select-none">
      {/* Top Banner & Stats Overview */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200/80 shrink-0 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Quản Lý Đơn Hàng & Booking POS
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ đơn booking chụp kỷ yếu đã chốt cọc và đồng bộ dữ liệu với CRM Xoăn Media
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Tạo Booking Mới
            </Button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Tổng Số Đơn
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                {bookings.length} <span className="text-xs font-normal text-slate-500">hợp đồng</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Tổng Cọc Đã Thu
              </p>
              <p className="text-base sm:text-lg font-bold text-emerald-700 font-mono">
                {totalDeposit.toLocaleString('vi-VN')} <span className="text-xs font-normal">đ</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Doanh Thu Dự Kiến
              </p>
              <p className="text-base sm:text-lg font-bold text-blue-700 font-mono">
                {totalRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal">đ</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, khách, trường, lớp..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilterPayment('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterPayment === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
            }`}
          >
            Tất cả ({bookings.length})
          </button>
          <button
            onClick={() => setFilterPayment('Đã cọc')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterPayment === 'Đã cọc'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50 bg-white border border-emerald-200'
            }`}
          >
            Đã cọc VietQR
          </button>
          <button
            onClick={() => setFilterPayment('Hoàn thành')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterPayment === 'Hoàn thành'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
            }`}
          >
            Đã thanh toán đủ
          </button>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredBookings.length === 0 ? (
          <div className="h-full bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-8">
            <EmptyState
              icon={<ShoppingBag className="w-6 h-6 text-slate-400" />}
              title="Chưa có đơn hàng nào"
              description={
                searchQuery
                  ? 'Không tìm thấy đơn hàng nào khớp với từ khóa tìm kiếm.'
                  : 'Chưa có booking nào được tạo từ khung chat hoặc bảng POS.'
              }
              actionText="Tạo Booking Mới Ngay"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng & Trường Lớp</th>
                  <th className="py-3 px-4">Gói Chụp</th>
                  <th className="py-3 px-4">Ngày Chụp</th>
                  <th className="py-3 px-4 text-right">Tổng Tiền</th>
                  <th className="py-3 px-4 text-right">Đã Cọc</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBookings.map(b => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedBookingDetail(b)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {b.code || b.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{b.customerName}</p>
                      <p className="text-[11px] text-slate-500">
                        {b.className ? `Lớp ${b.className}` : ''}
                        {b.schoolName ? ` • ${b.schoolName}` : ''}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{b.packageName}</span>
                      <span className="text-[11px] text-slate-400 block">
                        ({b.studentCount} bạn)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.shootDate || 'Chưa định'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {(b.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {(b.depositAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success" size="sm">
                        {b.paymentStatus || 'Đã cọc'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBookingDetail(b)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Chi Tiết Đơn Hàng (Invoice Summary) */}
      {selectedBookingDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBookingDetail(null)}
          title={`Chi Tiết Đơn Hàng: ${selectedBookingDetail.code || selectedBookingDetail.id}`}
          description="Thông tin hợp đồng kỷ yếu đã đồng bộ với CRM Xoăn Media"
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                In Phiếu Thu
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedBookingDetail(null)}
              >
                Đóng
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Info Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedBookingDetail.customerName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedBookingDetail.className && `Lớp ${selectedBookingDetail.className}`}
                    {selectedBookingDetail.schoolName && ` • Trường ${selectedBookingDetail.schoolName}`}
                  </p>
                </div>
                <Badge variant="success">
                  {selectedBookingDetail.paymentStatus || 'Đã cọc'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block">Gói dịch vụ:</span>
                  <strong className="text-slate-800">{selectedBookingDetail.packageName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Sĩ số lớp:</span>
                  <strong className="text-slate-800">{selectedBookingDetail.studentCount} bạn</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày chụp dự kiến:</span>
                  <strong className="text-slate-800">{selectedBookingDetail.shootDate || 'Chưa định'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Địa điểm:</span>
                  <strong className="text-slate-800">{selectedBookingDetail.location || 'Tại trường'}</strong>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Tổng giá trị hợp đồng:</span>
                <span className="font-bold font-mono text-slate-900">
                  {(selectedBookingDetail.totalAmount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-medium">Đã thanh toán cọc VietQR:</span>
                <span className="font-bold font-mono text-emerald-700">
                  -{(selectedBookingDetail.depositAmount || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="border-t border-indigo-200/60 pt-1.5 flex justify-between font-bold text-sm">
                <span className="text-slate-900">Còn lại cần thu:</span>
                <span className="font-mono text-indigo-700">
                  {Math.max(
                    0,
                    (selectedBookingDetail.totalAmount || 0) - (selectedBookingDetail.depositAmount || 0)
                  ).toLocaleString('vi-VN')}{' '}
                  đ
                </span>
              </div>
            </div>

            {selectedBookingDetail.notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Ghi chú: </strong>
                <span>{selectedBookingDetail.notes}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Tạo Booking Mới POS */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Tạo Booking Mới & Đồng Bộ Vào CRM"
          description="Khởi tạo đơn đặt lịch chụp kỷ yếu mới từ máy tính POS"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateOrder} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tên khách hàng"
                required
                value={custName}
                onChange={e => setCustName(e.target.value)}
                placeholder="VD: Bạn Thu Thảo"
              />
              <Input
                label="Số điện thoại"
                value={custPhone}
                onChange={e => setCustPhone(e.target.value)}
                placeholder="VD: 0987654321"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Lớp"
                value={custClass}
                onChange={e => setCustClass(e.target.value)}
                placeholder="VD: 12A1"
              />
              <Input
                label="Trường học"
                value={custSchool}
                onChange={e => setCustSchool(e.target.value)}
                placeholder="VD: THPT Đông Hải"
              />
            </div>

            {/* Service Package */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gói chụp kỷ yếu
              </label>
              <select
                value={selectedPackage}
                onChange={e => {
                  setSelectedPackage(e.target.value);
                  const found = servicePackages.find(p => p.name === e.target.value);
                  if (found) setPackagePrice(found.price);
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

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Sĩ số học sinh"
                type="number"
                min={1}
                value={studentCount}
                onChange={e => setStudentCount(Number(e.target.value) || 1)}
              />
              <Input
                label="Đơn giá / bạn (đ)"
                type="number"
                step={1000}
                value={packagePrice}
                onChange={e => setPackagePrice(Number(e.target.value) || 0)}
              />
            </div>

            {/* Financial auto calculated preview */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
              <span className="text-amber-800 font-semibold">Tổng doanh thu dự kiến:</span>
              <span className="font-bold font-mono text-amber-900 text-sm">
                {(studentCount * packagePrice).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tiền cọc trước (đ)"
                type="number"
                step={100000}
                value={depositAmount}
                onChange={e => setDepositAmount(Number(e.target.value) || 0)}
              />
              <Input
                label="Ngày chụp dự kiến"
                type="date"
                value={shootDate}
                onChange={e => setShootDate(e.target.value)}
              />
            </div>

            <Input
              label="Địa điểm chụp"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="VD: Trường học + Hoàng Thành Thăng Long"
            />

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Tạo Đơn & Lưu Vào CRM
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
