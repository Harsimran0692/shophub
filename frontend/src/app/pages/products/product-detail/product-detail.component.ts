import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product, Category, Review } from '../../../models/product.interface';
import { Store } from '@ngrx/store';
import { loadCategorySpecs } from '../store/product.actions';
import { selectAllCategorySpecs } from '../store/product.selectors';
import { EMPTY, filter, map, switchMap } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  categoryName: string | null = null;
  categoryId: string | null = null;
  loading = true;
  error = false;
  addingToCart = false;
  submittingReview = false;
  categorySpec: any = null;
  reviews: Review[] = [];
  reviewsLoading: boolean = false;
  math = Math;

  selectedColor = '';
  selectedSize = '';
  quantity = 1;
  selectedRating: number = 0;
  reviewComment: string = '';
  activeImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private store: Store,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // console.log(this.hasUserReviewed());
    this.store.dispatch(loadCategorySpecs());

    this.route.params
      .pipe(
        map((params) => params['id']),
        filter((id) => !!id),
        switchMap((id) => this.productService.getProduct(id)),
        switchMap((product) => {
          this.product = product;
          console.log(this.product);
          this.selectedColor = product.specs?.colors?.[0] || '';
          this.selectedSize = product.specs?.sizes?.[0] || '';
          this.loading = false;

          this.loadReviews(product._id);

          if (product?.category) {
            this.categoryName = product.category.name;
            this.categoryId = product.category._id;

            // Chain the second call using the category id
            return this.productService.getCategorySpecsWithId(this.categoryId);
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (categorySpec) => {
          this.categorySpec = categorySpec;
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = true;
          this.loading = false;
        },
      });
  }

  private loadReviews(productId: string): void {
    this.reviewsLoading = true;
    this.productService.getReviews(productId).subscribe({
      next: (response) => {
        this.reviews = response.data;
        console.log(this.reviews);
        this.reviewsLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviewsLoading = false;
      },
    });
  }

  private postReview() {
    if (!this.product || !this.selectedRating || !this.reviewComment.trim())
      return;
    this.submittingReview = true;
    this.productService
      .postReview(this.product._id, this.selectedRating, this.reviewComment)
      .subscribe({
        next: (response) => {
          this.reviews.unshift(response.data);
          this.selectedRating = 0;
          this.reviewComment = '';
          this.submittingReview = false;
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          this.submittingReview = false;
        },
      });
  }

  // Helper: get value from product.specs using the dynamic key
  getSpecValue(key: string): any {
    const val = (this.product?.specs as any)?.[key];
    // Return null for empty arrays, undefined, or empty strings
    if (val === undefined || val === null || val === '') return null;
    if (Array.isArray(val) && val.length === 0) return null;
    return val;
  }

  // Helper: check if value is array (used in template)
  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.error = false;

    this.productService.getProduct(id).subscribe({
      next: (product: Product) => {
        console.log(product);
        this.product = product;
        this.selectedColor = product.specs?.colors?.[0] || '';
        this.selectedSize = product.specs?.sizes?.[0] || '';
        this.loading = false;
        // Fetch category name
        if (product?.category) {
          this.categoryName = product.category.name;
          console.log(product.category._id);
          this.categoryId = product.category._id;
          console.log('two');
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = true;
        this.loading = false;
      },
    });
  }

  // Type guards for colors and sizes
  hasColors(): boolean {
    return (
      !!this.product?.specs?.colors && this.product.specs.colors.length > 0
    );
  }

  hasSizes(): boolean {
    return !!this.product?.specs?.sizes && this.product.specs.sizes.length > 0;
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  prevImage() {
    if (this.activeImageIndex > 0) this.activeImageIndex--;
  }

  nextImage() {
    if (this.activeImageIndex < (this.product?.images?.length ?? 0) - 1) {
      this.activeImageIndex++;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    this.addingToCart = true;

    this.cartService
      .addToCart({
        productId: this.product._id,
        quantity: this.quantity,
      })
      .subscribe({
        next: () => {
          this.addingToCart = false;
          this.toast.success('Product added to cart');
        },
        error: (error) => {
          this.addingToCart = false;
          this.toast.error('Failed to add product to cart');
          console.error('Error adding product to cart:', error);
        },
      });
  }

  submitReview(): void {
    this.postReview();
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
  get hasUserReviewed(): boolean {
    const currentUserId = this.authService.getCurrentUser(); // get current user's id
    return this.reviews.some(
      (review) => review.user._id === currentUserId?._id
    );
  }
}
