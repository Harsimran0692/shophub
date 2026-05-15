import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest } from '.././models/order.interface';
import { environment } from '../../environments/environment';

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderResponse {
  data: Order[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    console.log('innn');
    return this.http.post<Order>(`${this.apiUrl}/order/create`, orderData);
  }

  getOrders(params?: OrderQueryParams): Observable<OrderResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof OrderQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<OrderResponse>(`${this.apiUrl}/order/get`, {
      params: httpParams,
    });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/order/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/order/${id}/status`, {
      status,
    });
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/order/cancel`, { id });
  }

  getOrderStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/order/statistics`);
  }
}
