// cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import {
  Cart,
  CartData,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  Product,
} from '../models/cart.interface';
import { environment } from '../../environment/environment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = environment.apiUrl;
  private cartSubject = new BehaviorSubject<CartData | null>(null);
  private cartItemCountSubject = new BehaviorSubject<number>(0);

  cart$ = this.cartSubject.asObservable();
  cartItemCount$ = this.cartSubject.pipe(
    map(
      (cart) => cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
    )
  );

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize cart
    this.loadCart();

    // Subscribe to auth state changes
    // this.authService.authState$.subscribe((isAuthenticated) => {
    //   if (isAuthenticated) {
    //     // User logged in: merge temp cart with server cart
    //     const tempCart = this.getTempCart();
    //     if (tempCart?.items.length) {
    //       this.mergeCart(tempCart).subscribe({
    //         next: (cart) => {
    //           this.updateCartOptimistically(cart.data);
    //           this.clearTempCart();
    //         },
    //         error: (error) => {
    //           console.error('Failed to merge cart:', error);
    //           this.loadCart(); // Fallback to server cart
    //         },
    //       });
    //     } else {
    //       this.loadCart();
    //     }
    //   } else {
    //     // User logged out: revert to temp cart
    //     const tempCart = this.getTempCart();
    //     this.updateCartOptimistically(tempCart);
    //   }
    // });
  }

  // Public method for optimistic updates
  updateCartOptimistically(updatedCart: CartData | null): void {
    this.cartSubject.next(updatedCart);
  }

  private loadCart(): void {
    // if (!this.authService.isAuthenticated()) {
    //   const tempCart = this.getTempCart();
    //   if (tempCart) {
    //     this.loadTempCartProductDetails(tempCart).subscribe({
    //       next: (cart) => this.updateCartOptimistically(cart),
    //       error: () => this.updateCartOptimistically(tempCart), // Fallback to partial data
    //     });
    //   } else {
    //     this.updateCartOptimistically(null);
    //   }
    //   return;
    // }

    this.getCart().subscribe({
      next: (cart) => {
        // console.log(cart);
        this.updateCartOptimistically(cart.data);
      },
      error: (error) => {
        // console.error('Failed to load cart:', error);
        this.updateCartOptimistically(null);
      },
    });
  }

  getCart(): Observable<Cart> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('User must be logged in to view cart'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    return this.http.get<Cart>(`${this.apiUrl}/cart`, { headers }).pipe(
      tap((response) => response),
      catchError((error) => {
        return throwError(
          () => new Error(error.error.message || 'Failed to fetch cart')
        );
      })
    );
  }

  // if (!this.authService.isAuthenticated()) {
  //   const tempCart = this.getTempCart() || {
  //     _id: 'temp',
  //     user: '',
  //     items: [],
  //     totalPrice: 0,
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };
  //   const existingItem = tempCart.items.find(
  //     (item) => item.product._id === request.productId
  //   );
  //   if (existingItem) {
  //     existingItem.quantity += request.quantity;
  //   } else {
  //     tempCart.items.push({
  //       _id: `temp-${request.productId}`,
  //       product: { _id: request.productId } as Product,
  //       quantity: request.quantity,
  //     });
  //   }
  //   tempCart.totalPrice = tempCart.items.reduce((sum, item) => {
  //     const price = item.product.discountedPrice || item.product.price || 0;
  //     return sum + price * item.quantity;
  //   }, 0);
  //   this.saveTempCart(tempCart);
  //   this.updateCartOptimistically(tempCart);
  //   return new Observable((observer) => {
  //     observer.next({ status: 'success', data: tempCart });
  //     observer.complete();
  //   });
  // }
  addToCart(request: AddToCartRequest): Observable<Cart> {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error());
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    return this.http
      .post<Cart>(`${this.apiUrl}/cart/add`, request, { headers })
      .pipe(
        tap((cart) => {
          this.updateCartOptimistically(cart.data);
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error.message || 'Failed to add to cart')
          );
        })
      );
  }

  updateCartItem(request: UpdateCartItemRequest): Observable<Cart> {
    if (!this.authService.isAuthenticated()) {
      return throwError(
        () => new Error('User must be logged in to update cart')
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    return this.http
      .put<Cart>(`${this.apiUrl}/cart/update`, request, { headers })
      .pipe(
        tap((cart) => {
          this.updateCartOptimistically(cart.data);
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error.message || 'Failed to update cart')
          );
        })
      );
  }

  removeFromCart(itemId: string): Observable<Cart> {
    if (!this.authService.isAuthenticated()) {
      const tempCart = this.getTempCart();
      if (tempCart) {
        tempCart.items = tempCart.items.filter((item) => item._id !== itemId);
        tempCart.totalPrice = tempCart.items.reduce((sum, item) => {
          const price = item.product.discountedPrice || item.product.price || 0;
          return sum + price * item.quantity;
        }, 0);
        this.saveTempCart(tempCart);
        this.updateCartOptimistically(tempCart);
        return new Observable((observer) => {
          observer.next({ status: 'success', data: tempCart });
          observer.complete();
        });
      }
      return throwError(() => new Error('No temporary cart found'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    return this.http
      .delete<Cart>(`${this.apiUrl}/cart/remove/${itemId}`, { headers })
      .pipe(
        tap((cart) => {
          this.updateCartOptimistically(cart.data);
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error.message || 'Failed to remove from cart')
          );
        })
      );
  }

  clearCart(): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      this.saveTempCart(null);
      this.updateCartOptimistically(null);
      return new Observable((observer) => {
        observer.next();
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    return this.http
      .delete<void>(`${this.apiUrl}/cart/clear`, { headers })
      .pipe(
        tap(() => {
          this.updateCartOptimistically(null);
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error.message || 'Failed to clear cart')
          );
        })
      );
  }

  mergeCart(tempCart: CartData): Observable<Cart> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    return this.http
      .post<Cart>(
        `${this.apiUrl}/cart/merge`,
        { items: tempCart.items },
        { headers }
      )
      .pipe(
        catchError((error) => {
          return throwError(
            () => new Error(error.error.message || 'Failed to merge cart')
          );
        })
      );
  }

  private loadTempCartProductDetails(cart: CartData): Observable<CartData> {
    const productIds = cart.items.map((item) => item.product._id);
    return this.http
      .post<Product[]>(`${this.apiUrl}/products/multiple`, { ids: productIds })
      .pipe(
        map((products) => {
          cart.items = cart.items.map((item) => {
            const product = products.find((p) => p._id === item.product._id);
            return { ...item, product: product || item.product };
          });
          cart.totalPrice = cart.items.reduce((sum, item) => {
            const price =
              item.product.discountedPrice || item.product.price || 0;
            return sum + price * item.quantity;
          }, 0);
          return cart;
        })
      );
  }

  private getTempCart(): CartData | null {
    const tempCart = localStorage.getItem('tempCart');
    return tempCart ? JSON.parse(tempCart) : null;
  }

  private saveTempCart(cart: CartData | null): void {
    if (cart) {
      localStorage.setItem('tempCart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('tempCart');
    }
  }

  private clearTempCart(): void {
    localStorage.removeItem('tempCart');
  }

  getCurrentCart(): CartData | null {
    return this.cartSubject.value;
  }

  refreshCart(): void {
    this.loadCart();
  }
}
