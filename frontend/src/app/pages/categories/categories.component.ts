import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Category } from '../../models/product.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="page-container py-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our wide range of products organized by categories to help
            you find exactly what you're looking for.
          </p>
        </div>

        <!-- Loading State -->
        <div
          *ngIf="loading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div
            *ngFor="let i of [1, 2, 3, 4, 5, 6, 7, 8]"
            class="card animate-pulse"
          >
            <div class="aspect-square bg-gray-300 rounded-t-lg"></div>
            <div class="p-6">
              <div class="h-6 bg-gray-300 rounded mb-3"></div>
              <div class="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div class="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Categories Grid -->
        <div
          *ngIf="!loading && categories.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div
            *ngFor="let category of categories"
            class="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
            (click)="navigateToCategory(category._id)"
          >
            <div class="aspect-square overflow-hidden">
              <img
                [src]="category.image"
                [alt]="category.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div class="p-6">
              <h3
                class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors"
              >
                {{ category.name }}
              </h3>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-sm text-gray-500">
                  Explore {{ category.name }}
                </span>
                <svg
                  class="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Categories Section -->
        <div *ngIf="!loading && categories.length > 0" class="mt-16">
          <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">
            Featured Categories
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              *ngFor="let category of getFeaturedCategories()"
              class="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
              (click)="navigateToCategory(category._id)"
            >
              <div class="aspect-[16/9] overflow-hidden">
                <img
                  [src]="category.image"
                  [alt]="category.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              ></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <h3 class="text-3xl font-bold text-white mb-2">
                  {{ category.name }}
                </h3>
                <p class="text-white/90 mb-4">
                  Discover our premium
                  {{ category.name.toLowerCase() }} collection
                </p>
                <button
                  class="btn-primary bg-white text-gray-900 hover:bg-gray-100"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!loading && categories.length === 0"
          class="text-center py-12"
        >
          <div class="text-gray-400 text-6xl mb-4">📂</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">
            No categories found
          </h3>
          <p class="text-gray-600 mb-8">
            Categories are being updated. Please check back later.
          </p>
          <a
            routerLink="/products"
            class="btn-primary inline-flex items-center px-6 py-3"
          >
            Browse All Products
          </a>
        </div>
      </div>
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading = true;
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

  navigateToCategory(categoryId: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category: categoryId },
    });
  }

  getFeaturedCategories(): Category[] {
    return this.categories.slice(0, 2);
  }
}
