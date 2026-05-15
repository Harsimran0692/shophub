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

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.updateItemsPerView();
    window.addEventListener('resize', () => this.updateItemsPerView());
  }

  private loadData(): void {
    // Load featured products
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
      },
    });

    // Load popular products
    this.productService.getPopularProducts().subscribe({
      next: (products) => {
        this.popularProducts = products;
      },
      error: (error) => {
        console.error('Error loading popular products:', error);
      },
    });

    // Load categories
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
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
