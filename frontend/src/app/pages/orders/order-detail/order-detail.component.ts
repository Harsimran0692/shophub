import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.interface';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50" *ngIf="order">
      <div class="page-container py-8">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  Order #{{ order._id.slice(-8) }}
                </h1>
                <p class="text-gray-600">
                  Placed on {{ order.createdAt | date : 'full' }}
                </p>
              </div>
              <div class="text-right">
                <span
                  class="badge text-lg px-4 py-2"
                  [ngClass]="getStatusClass(order.status)"
                >
                  {{ order.status | titlecase }}
                </span>
                <p class="text-2xl font-bold text-primary-600 mt-2">
                  \${{ order.totalAmount }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Progress -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Order Status</h2>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <span class="ml-2 text-sm font-medium">Order Placed</span>
                </div>

                <div class="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    class="h-full bg-primary-600"
                    [style.width]="getProgressWidth()"
                  ></div>
                </div>

                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    [class.bg-primary-600]="order.status !== 'pending'"
                    [class.bg-gray-300]="order.status === 'pending'"
                  >
                    <svg
                      class="w-4 h-4"
                      [class.text-white]="order.status !== 'pending'"
                      [class.text-gray-500]="order.status === 'pending'"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                      />
                    </svg>
                  </div>
                  <span class="ml-2 text-sm font-medium">Shipped</span>
                </div>

                <div class="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    class="h-full bg-primary-600"
                    [style.width]="order.status === 'delivered' ? '100%' : '0%'"
                  ></div>
                </div>

                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    [class.bg-primary-600]="order.status === 'delivered'"
                    [class.bg-gray-300]="order.status !== 'delivered'"
                  >
                    <svg
                      class="w-4 h-4"
                      [class.text-white]="order.status === 'delivered'"
                      [class.text-gray-500]="order.status !== 'delivered'"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span class="ml-2 text-sm font-medium">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Order Items -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Order Items</h2>
              <div class="space-y-4">
                <div
                  *ngFor="let item of order.items"
                  class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div
                    class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">
                      Product {{ item.product }}
                    </h3>
                    <div class="text-sm text-gray-600">
                      <span *ngIf="item.color">Color: {{ item.color }}</span>
                      <span *ngIf="item.size && item.color"> • </span>
                      <span *ngIf="item.size">Size: {{ item.size }}</span>
                    </div>
                    <p class="text-sm text-gray-600">
                      Quantity: {{ item.quantity }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-primary-600">
                      \${{ item.price * item.quantity }}
                    </p>
                    <p class="text-sm text-gray-600">\${{ item.price }} each</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary & Details -->
            <div class="space-y-6">
              <!-- Shipping Address -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-semibold mb-4">Shipping Address</h2>
                <div class="text-gray-700">
                  <p class="font-medium">{{ order.address.name }}</p>
                  <p>{{ order.address.address }}</p>
                  <p>{{ order.address.phone }}</p>
                  <p *ngIf="order.address.email">{{ order.address.email }}</p>
                </div>
              </div>

              <!-- Payment Details -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-semibold mb-4">Payment Details</h2>
                <div class="text-gray-700">
                  <p class="font-medium">
                    {{ order.paymentDetails.cardholderName }}
                  </p>
                  <p>
                    **** **** **** {{ order.paymentDetails.cardNumberLast4 }}
                  </p>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal</span>
                    <span>\${{ getSubtotal() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tax</span>
                    <span>\${{ getTax() }}</span>
                  </div>
                  <div class="border-t pt-2">
                    <div class="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span class="text-primary-600"
                        >\${{ order.totalAmount }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div class="flex justify-between items-center">
              <a routerLink="/orders" class="btn-outline"> ← Back to Orders </a>

              <div class="flex space-x-3">
                <button
                  *ngIf="order.status === 'pending'"
                  (click)="cancelOrder()"
                  class="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cancel Order
                </button>
                <button
                  *ngIf="order.status === 'delivered'"
                  class="btn-primary"
                >
                  Reorder
                </button>
                <button class="btn-outline">Download Invoice</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="min-h-screen flex items-center justify-center">
      <div class="loading-spinner w-12 h-12"></div>
    </div>

    <!-- Error State -->
    <div
      *ngIf="error && !loading"
      class="min-h-screen flex items-center justify-center"
    >
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <p class="text-gray-600 mb-4">
          The order you're looking for doesn't exist.
        </p>
        <a routerLink="/orders" class="btn-primary">Back to Orders</a>
      </div>
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const orderId = params['id'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  private loadOrder(id: string): void {
    this.loading = true;
    this.error = false;

    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.error = true;
        this.loading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'shipped':
        return 'badge-info';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  }

  getProgressWidth(): string {
    if (!this.order) return '0%';

    switch (this.order.status) {
      case 'pending':
        return '0%';
      case 'shipped':
        return '50%';
      case 'delivered':
        return '100%';
      case 'cancelled':
        return '0%';
      default:
        return '0%';
    }
  }

  getSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0
    );
  }

  getTax(): number {
    const subtotal = this.getSubtotal();
    return Math.round(subtotal * 0.08 * 100) / 100;
  }

  cancelOrder(): void {
    if (!this.order) return;

    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(this.order._id).subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
        },
      });
    }
  }
}
