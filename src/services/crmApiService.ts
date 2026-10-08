// src/services/crmApiService.ts
// Service kết nối REST API trực tiếp giữa Pancake App độc lập và Máy chủ CRM Xoăn Media

import { Customer, Booking, ServicePackage, SalesStaff } from '../types';

const DEFAULT_CRM_API = 'https://crm.xoanmedia.com/api';
const LOCAL_STORAGE_KEY_CRM_API = 'pancake_crm_api_url';

export class CrmApiService {
  public static getBaseUrl(): string {
    return localStorage.getItem(LOCAL_STORAGE_KEY_CRM_API) || DEFAULT_CRM_API;
  }

  public static setBaseUrl(url: string): void {
    localStorage.setItem(LOCAL_STORAGE_KEY_CRM_API, url.trim().replace(/\/$/, ''));
  }

  /**
   * Kiểm tra kết nối Health check tới máy chủ CRM
   */
  public static async checkHealth(): Promise<{ status: string; version?: string }> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      throw new Error(`Không thể kết nối máy chủ CRM: ${err.message}`);
    }
  }

  /**
   * Lấy danh sách khách hàng từ CRM
   */
  public static async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/customers`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch {
      return [];
    }
  }

  /**
   * Tạo hoặc cập nhật khách hàng vào CRM
   */
  public static async saveCustomer(cust: Partial<Customer>): Promise<Customer | null> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cust)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.warn('Lỗi lưu khách hàng vào CRM API:', err);
      return null;
    }
  }

  /**
   * Pancake POS: Tạo Booking chốt cọc kỷ yếu từ khung chat vào thẳng CRM
   */
  public static async createBooking(booking: Partial<Booking>): Promise<Booking | null> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.warn('Lỗi tạo booking vào CRM API:', err);
      return null;
    }
  }

  /**
   * Lấy danh sách các gói dịch vụ kỷ yếu
   */
  public static async getServicePackages(): Promise<ServicePackage[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/service-packages`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch {
      return [];
    }
  }

  /**
   * Lấy danh sách nhân viên Sales tư vấn
   */
  public static async getSalesStaff(): Promise<SalesStaff[]> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/sales-staff`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch {
      return [];
    }
  }
}
