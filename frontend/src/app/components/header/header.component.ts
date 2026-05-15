import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  EMPTY,
  Subject,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../models/user.interface';
import { Category, Product } from '../../models/product.interface';
import { ClickOutsideDirective } from '../../directives/clickOutside';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ClickOutsideDirective],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  currentUser: User | null = null;
  cartItemCount = 0;
  searchQuery = '';
  selectedCategory = '';
  categories: Category[] = [];
  searchResults: Product[] = [];
  showDropdown = false;
  showUserMenu = false;
  showMobileMenu = false;
  showCrossIcon = false;
  searchLoading = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.currentUser = user));

    this.cartService.cartItemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => (this.cartItemCount = count));

    this.productService.getCategories().subscribe({
      next: (response) => (this.categories = response),
      error: (error) => console.error(error),
    });

    // search pipeline
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((query) => {
          if (!query.trim()) {
            this.searchResults = [];
            this.showDropdown = false;
            return EMPTY;
          }
          this.searchLoading = true;
          return this.productService.search(query, this.selectedCategory);
        })
      )
      .subscribe({
        next: (response) => {
          this.searchResults = response;
          console.log(this.searchResults);
          this.showDropdown = true;
          this.searchLoading = false;
        },
        error: () => (this.searchLoading = false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(): void {
    this.showCrossIcon = this.searchQuery.trim().length > 0;
    this.searchSubject.next(this.searchQuery);
  }

  onCategoryChange(): void {
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showCrossIcon = false;
    this.searchResults = [];
    this.showDropdown = false;
  }

  selectResult(product: Product): void {
    this.router.navigate(['/products', product._id]);
    this.showDropdown = false;
    this.searchQuery = '';
    this.showCrossIcon = false;
  }

  submitSearch(): void {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/products'], {
      queryParams: {
        q: this.searchQuery,
        category: this.selectedCategory || undefined,
      },
    });
    this.showDropdown = false;
  }

  closeDropdown(): void {
    setTimeout(() => (this.showDropdown = false), 150);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}
