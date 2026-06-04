import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, Category } from '../../models/product.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef;
  featuredProducts: Product[] = [];
  popularProducts: Product[] = [];
  categories: Category[] = [];
  loading = true;
  currentIndex = 0;
  itemsPerView = 4;

  private readonly SLOW_THRESHOLD_MS = 10000;
  private categoriesTimer?: ReturnType<typeof setTimeout>;
  private featuredTimer?: ReturnType<typeof setTimeout>;
  private popularTimer?: ReturnType<typeof setTimeout>;

  isCategoriesLoading = true;
  isFeaturedLoading = true;
  isPopularLoading = true;

  showPopularSlowMsg = false;
  showFeaturedSlowMsg = false;
  showCategoriesSlowMsg = false;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }
  ngOnDestroy(): void {
    clearTimeout(this.categoriesTimer);
    clearTimeout(this.featuredTimer);
    clearTimeout(this.popularTimer);
  }

  ngAfterViewInit() {
    this.updateItemsPerView();
    window.addEventListener('resize', () => this.updateItemsPerView());
  }

  private loadData(): void {
    this.featuredTimer = setTimeout(() => {
      if (this.isFeaturedLoading) this.showFeaturedSlowMsg = true;
    }, this.SLOW_THRESHOLD_MS);

    // Load featured products
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.isFeaturedLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
      },
    });

    this.popularTimer = setTimeout(() => {
      if (this.isPopularLoading) this.showPopularSlowMsg = true;
    }, this.SLOW_THRESHOLD_MS);

    // Load popular products
    this.productService.getPopularProducts().subscribe({
      next: (products) => {
        this.popularProducts = products;
        this.isPopularLoading = false;
      },
      error: (error) => {
        console.error('Error loading popular products:', error);
      },
    });

    this.categoriesTimer = setTimeout(() => {
      if (this.isCategoriesLoading) this.showCategoriesSlowMsg = true;
    }, this.SLOW_THRESHOLD_MS);

    // Load categories
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isCategoriesLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      },
    });
  }

  updateItemsPerView() {
    const width = window.innerWidth;
    if (width <= 480) {
      this.itemsPerView = 1;
    } else if (width <= 768) {
      this.itemsPerView = 2;
    } else if (width <= 1024) {
      this.itemsPerView = 3;
    } else {
      this.itemsPerView = 4;
    }
    this.updateCarousel();
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  nextSlide() {
    if (this.currentIndex < this.categories.length - this.itemsPerView) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  updateCarousel() {
    const track = this.carouselTrack?.nativeElement;
    const itemWidth = track?.children[0].offsetWidth + 16;
    if (track)
      track.style.transform = `translateX(-${this.currentIndex * itemWidth}px)`;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  navigateToCategory(categoryId: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category: categoryId },
    });
  }
}
