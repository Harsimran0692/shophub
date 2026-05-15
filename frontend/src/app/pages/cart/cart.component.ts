// cart.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartData, CartItem } from '../../models/cart.interface';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  // styles: [
  //   `
  //     .page-container {
  //       max-width: 1200px;
  //       margin: 0 auto;
  //       padding: 0 1rem;
  //     }
  //     .btn-primary {
  //       @apply bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors;
  //     }
  //     .btn-outline {
  //       @apply border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors;
  //     }
  //     .loading-spinner {
  //       @apply border-4 border-primary-600 border-t-transparent rounded-full animate-spin;
  //     }
  //   `,
  // ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  cart$: Observable<CartData | null>;
  cartItemCount$: Observable<number>;
  loading = true;
  errorMessage: string | null = null;
  totalCartItems: number = 0;
  private quantityUpdates = new Subject<{
    item: CartItem;
    newQuantity: number;
  }>();

  constructor(private cartService: CartService) {
    this.cart$ = this.cartService.cart$;
    this.cartItemCount$ = this.cartService.cartItemCount$;
    this.cart$.subscribe({
      next: (res) => {
        this.loading = false;
        this.errorMessage = null;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load cart';
      },
    });
    this.cartItemCount$.subscribe({
      next: (res) => {
        this.totalCartItems = res;
      },
    });

    // Debounce quantity updates
    this.quantityUpdates
      .pipe(
        debounceTime(500), // Wait 500ms after last click
        distinctUntilChanged(
          (prev, curr) =>
            prev.item._id === curr.item._id &&
            prev.newQuantity === curr.newQuantity
        ),
        switchMap(({ item, newQuantity }) =>
          this.cartService.updateCartItem({
            cartId: item._id,
            quantity: newQuantity,
          })
        )
      )
      .subscribe({
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update cart item';
          this.cartService.refreshCart(); // Revert to server state on error
        },
        complete: () => {
          this.cartService.refreshCart(); // Sync with server after update
        },
      });
  }

  ngOnInit(): void {
    this.cartService.refreshCart();
  }

  getTotalItems(cart: CartData | null): number {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item); // Remove item if quantity is 0
      return;
    }
    if (newQuantity > item.product.stock) return;

    // Optimistic update
    const currentCart = this.cartService.getCurrentCart();
    if (currentCart) {
      const updatedCart = {
        ...currentCart,
        items: currentCart.items.map((i) =>
          i._id === item._id ? { ...i, quantity: newQuantity } : i
        ),
        totalPrice: currentCart.items.reduce((sum, i) => {
          const price = i.product.discountedPrice || i.product.price;
          return (
            sum +
            (i._id === item._id ? price * newQuantity : price * i.quantity)
          );
        }, 0),
      };
      this.cartService.updateCartOptimistically(updatedCart);
    }
    // Queue API update with debouncing
    this.quantityUpdates.next({ item, newQuantity });

    this.cartService
      .updateCartItem({
        cartId: item._id,
        quantity: newQuantity,
      })
      .subscribe({
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update cart item';
          this.cartService.refreshCart();
        },
      });
  }

  removeItem(item: CartItem): void {
    // Optimistic update
    const currentCart = this.cartService.getCurrentCart();
    if (currentCart) {
      const updatedCart = {
        ...currentCart,
        items: currentCart.items.filter((i) => i._id !== item._id),
        totalPrice: currentCart.items
          .filter((i) => i._id !== item._id)
          .reduce((sum, i) => {
            const price = i.product.discountedPrice || i.product.price;
            return sum + price * i.quantity;
          }, 0),
      };
      this.cartService.updateCartOptimistically(updatedCart);
    }

    this.cartService.removeFromCart(item._id).subscribe({
      error: (error) => {
        this.errorMessage = error.message || 'Failed to remove cart item';
        this.cartService.refreshCart();
      },
    });
  }

  getTax(): number {
    const cart = this.cartService.getCurrentCart();
    if (!cart) return 0;
    return Math.round(cart.totalPrice * 0.08 * 100) / 100; // 8% tax
  }

  getTotal(): number {
    const cart = this.cartService.getCurrentCart();
    if (!cart) return 0;
    return Math.round((cart.totalPrice + this.getTax()) * 100) / 100;
  }

  retryLoadCart(): void {
    this.loading = true;
    this.errorMessage = null;
    this.cartService.refreshCart();
  }
}
