import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  ProductService,
  ProductQueryParams,
} from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product, Category } from '../../../models/product.interface';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  pageSize = 12;

  // Filters
  searchQuery = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  dealsOnly = false;
  sortBy = 'createdAt';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.setupSearch();
    this.loadQueryParams();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  private loadQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.searchQuery = params['search'] || '';
        this.selectedCategory = params['category'] || '';
        this.minPrice = params['minPrice'] ? +params['minPrice'] : null;
        this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
        this.dealsOnly = params['isDeal'] === 'true'; // Changed from 'deals'
        this.sortBy = params['sort'] || 'createdAt';
        this.currentPage = params['page'] ? +params['page'] : 1;
      });
  }

  private loadProducts(): void {
    this.loading = true;

    const params: ProductQueryParams = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      category: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      isDeal: this.dealsOnly || undefined,
      sort: this.getSortField(),
      order: this.getSortOrder(),
    };

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data?.products;
        this.totalProducts = response.data?.meta?.totalCount;
        this.totalPages = response.data?.meta.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      },
    });
  }

  private getSortField(): 'price' | 'averageRating' | 'createdAt' {
    if (this.sortBy === 'price-desc') return 'price';
    if (this.sortBy === 'averageRating') return 'averageRating';
    return 'createdAt';
  }

  private getSortOrder(): 'asc' | 'desc' {
    if (this.sortBy === 'price-desc' || this.sortBy === 'averageRating')
      return 'desc';
    return 'asc';
  }

  private updateUrl(): void {
    const queryParams: any = {};

    if (this.searchQuery) queryParams.search = this.searchQuery;
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.minPrice) queryParams.minPrice = this.minPrice;
    if (this.maxPrice) queryParams.maxPrice = this.maxPrice;
    if (this.dealsOnly) queryParams.isDeal = 'true';
    if (this.sortBy !== 'createdAt') queryParams.sort = this.sortBy;
    if (this.currentPage > 1) queryParams.page = this.currentPage;

    this.router.navigate([], { queryParams, replaceUrl: true });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateUrl();
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.updateUrl();
    this.loadProducts();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateUrl();
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, this.currentPage - halfMaxPages);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.dealsOnly = false;
    this.sortBy = 'createdAt';
    this.currentPage = 1;
    this.updateUrl();
    this.loadProducts();
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();

    this.cartService
      .addToCart({
        productId: product._id,
        quantity: 1,
      })
      .subscribe({
        next: (res) => {
          this.toast.success('Product added to cart');
        },
        error: (error) => {
          this.toast.error('Failed to add product to cart');
          console.error('Error adding product to cart:', error);
        },
      });
  }
}
