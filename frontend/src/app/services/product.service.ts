import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Product,
  Category,
  ApiResponse,
  CategorySpec,
  Review,
} from '../models/product.interface';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  isFeatured?: boolean;
  isDeal?: boolean;
  isAvailable?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'averageRating' | 'createdAt' | 'viewCount' | 'name';
  order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  status: string;
  data: {
    products: Product[];
    meta: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
    };
  };
  source: 'cache' | 'database';
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl;
  private searchSubject = new BehaviorSubject<string>('');
  private filtersSubject = new BehaviorSubject<Partial<ProductQueryParams>>({});

  searchQuery$ = this.searchSubject.asObservable();
  filters$ = this.filtersSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Product
  getProducts(params?: ProductQueryParams): Observable<ProductsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(`${this.apiUrl}/products`, {
      params: httpParams,
    });
  }
  getSearchedProducts(
    params?: ProductQueryParams
  ): Observable<ProductsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(
      `${this.apiUrl}/products/search-products`,
      {
        params: httpParams,
      }
    );
  }

  getProductName(inputValue: string): Observable<any> {
    return this.getProducts().pipe(map((res) => res.data.products));
  }

  getProduct(id: string): Observable<Product> {
    return this.http
      .get<{ status: string; data: Product; source: string }>(
        `${this.apiUrl}/products/${id}`
      )
      .pipe(map((response) => response.data));
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.getProducts({ isDeal: true, limit: 8 }).pipe(
      map((response) => response.data.products)
    );
  }

  getPopularProducts(): Observable<Product[]> {
    return this.getProducts({
      sort: 'averageRating', // Updated from 'rating'
      order: 'desc',
      limit: 8,
    }).pipe(map((response) => response.data.products));
  }

  addProduct(payload: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, payload);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http
      .get<any>(`${this.apiUrl}/categories`)
      .pipe(map((response) => response.data));
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  search(query: string, categoryId?: string): Observable<Product[]> {
    this.searchSubject.next(query);
    return this.getSearchedProducts({
      search: query,
      category: categoryId || undefined, // ← correct key, skip if empty string
      limit: 10,
    }).pipe(map((response) => response.data.products));
  }

  updateFilters(filters: Partial<ProductQueryParams>): void {
    this.filtersSubject.next(filters);
  }

  getFilters(): Partial<ProductQueryParams> {
    return this.filtersSubject.value;
  }

  addReview(
    productId: string,
    review: { rating: number; comment?: string }
  ): Observable<Product> {
    return this.http.post<Product>(
      `${this.apiUrl}/products/${productId}/reviews`,
      review
    );
  }

  getProductsByCategory(
    categoryId: string,
    params?: ProductQueryParams
  ): Observable<ProductsResponse> {
    const queryParams = { ...params, category: categoryId };
    return this.getProducts(queryParams);
  }

  getRelatedProducts(productId: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/products/${productId}/related`
    );
  }

  // get category based specs

  getCategorySpecs() {
    return this.http
      .get<ApiResponse<CategorySpec[] | any>>(
        `${this.apiUrl}/categories/category-specs`
      )
      .pipe(map((response) => response.data));
  }

  getCategorySpecsWithId(categoryId: string | null) {
    return this.http
      .get<ApiResponse<CategorySpec[] | any>>(
        `${this.apiUrl}/categories/category-specs/${categoryId}`
      )
      .pipe(map((response) => response));
  }

  // Reviews

  getReviews(productId: string | null) {
    return this.http.get<ApiResponse<Review[]>>(
      `${this.apiUrl}/reviews/${productId}/review`
    );
  }
  postReview(productId: string | null, rating: number, comment: string) {
    return this.http.post<ApiResponse<Review>>(
      `${this.apiUrl}/reviews/postReview`,
      {
        product: productId, // ← matches req.body.product in your controller
        rating,
        comment,
      }
    );
  }
}
