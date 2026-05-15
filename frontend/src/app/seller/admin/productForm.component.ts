import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Category, CategorySpec } from '../../models/product.interface';

function discountLessThanPrice(
  group: AbstractControl
): ValidationErrors | null {
  const price = group.get('price')?.value;
  const discounted = group.get('discountedPrice')?.value;
  if (discounted !== null && discounted !== '' && discounted > price) {
    return { discountExceedsPrice: true };
  }
  return null;
}

interface FilteredSpec {
  category: string;
  createdAt: string;
  updatedAt: string;
  specField: any;
  version: number;
}

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './productForm.component.html',
  standalone: true,
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  activeSection = 'basic';
  selectedCategory: string = '';
  filteredSpec: Partial<FilteredSpec> = {};

  sections = [
    { id: 'basic', label: 'Basic Info', icon: '📦' },
    { id: 'specs', label: 'Specs', icon: '📐' },
    { id: 'inventory', label: 'Inventory', icon: '🗃️' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
  ];
  categorySpecs: CategorySpec[] = [];

  categories: Category[] = [];
  dimensionUnits = ['cm', 'm', 'in', 'ft'];
  weightUnits = ['g', 'kg', 'lb', 'oz'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: [
          'Test Product',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(200),
          ],
        ],
        description: [
          'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Mollitia tempore debitis perspiciatis sapiente illo cupiditate aperiam! Facere dignissimos commodi quasi. Nam ipsam consectetur, animi quam quo delectus doloribus! Illum, libero',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(2000),
          ],
        ],
        category: ['', Validators.required],
        price: [null, [Validators.required, Validators.min(0)]],
        discountedPrice: [0, [Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]],
        isFeatured: [false],
        isDeal: [false],
        isAvailable: [true],
        specs: this.fb.group({
          material: ['', Validators.maxLength(100)],
          dimensions: this.fb.group({
            length: [null, Validators.min(0)],
            width: [null, Validators.min(0)],
            height: [null, Validators.min(0)],
            unit: [null],
          }),
          weight: this.fb.group({
            value: [null, Validators.min(0)],
            unit: [null],
          }),
          colors: this.fb.array([]),
          sizes: this.fb.array([]),
        }),
        images: this.fb.array([]),
        reviews: this.fb.array([]),
      },
      { validators: discountLessThanPrice }
    );
    this.productService.getCategories().subscribe((data) => {
      this.categories = data;
    });
    this.productService.getCategorySpecs().subscribe((data) => {
      this.categorySpecs = data;
      console.log(this.categorySpecs);
    });
  }

  buildDynamicSpecs(fields: any[]) {
    const specsGroup = this.fb.group({});

    fields.forEach((field) => {
      const validators = [];

      if (field.required) validators.push(Validators.required);
      if (field.min !== undefined) validators.push(Validators.min(field.min));
      if (field.max !== undefined) validators.push(Validators.max(field.max));

      specsGroup.addControl(field.key, this.fb.control('', validators));
    });

    // Replace entire specs group
    this.form.setControl('specs', specsGroup);
  }

  // ─── Images ──────────────────────────────────────────────
  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  addImage(): void {
    this.images.push(
      this.fb.group({
        url: ['', Validators.required],
        altText: ['Product Image', Validators.maxLength(100)],
      })
    );
  }

  removeImage(i: number): void {
    this.images.removeAt(i);
  }

  // ─── Colors ──────────────────────────────────────────────
  get colors(): FormArray {
    return this.form.get('specs.colors') as FormArray;
  }

  addColor(): void {
    this.colors.push(this.fb.control('', Validators.maxLength(50)));
  }

  removeColor(i: number): void {
    this.colors.removeAt(i);
  }

  // ─── Sizes ───────────────────────────────────────────────
  get sizes(): FormArray {
    return this.form.get('specs.sizes') as FormArray;
  }

  addSize(): void {
    this.sizes.push(this.fb.control('', Validators.maxLength(50)));
  }

  removeSize(i: number): void {
    this.sizes.removeAt(i);
  }

  // ─── Reviews ─────────────────────────────────────────────
  get reviews(): FormArray {
    return this.form.get('reviews') as FormArray;
  }

  addReview(): void {
    this.reviews.push(
      this.fb.group({
        user: ['', Validators.required],
        rating: [
          null,
          [Validators.required, Validators.min(0), Validators.max(5)],
        ],
        comment: ['', Validators.maxLength(1000)],
      })
    );
  }

  removeReview(i: number): void {
    this.reviews.removeAt(i);
  }

  // ─── Helpers ─────────────────────────────────────────────
  isInvalid(path: string): boolean {
    const ctrl = this.form.get(path);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
  }

  getError(path: string): string {
    const ctrl = this.form.get(path);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['maxlength'])
      return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters.`;
    if (ctrl.errors['min'])
      return `Minimum value is ${ctrl.errors['min'].min}.`;
    if (ctrl.errors['max'])
      return `Maximum value is ${ctrl.errors['max'].max}.`;
    return 'Invalid value.';
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Hand off to caller — emit or inject your service here
    console.log('Product payload:', this.form.value);
    this.productService.addProduct(this.form.getRawValue()).subscribe({
      next: (product) => {
        console.log('Product created:', product);
      },
      error: (err) => {
        console.error('Failed to create product:', err.error.message);
      },
    });
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset({
      stock: 0,
      isFeatured: false,
      isDeal: false,
      isAvailable: true,
    });
    (this.form.get('images') as FormArray).clear();
    (this.form.get('reviews') as FormArray).clear();
    (this.form.get('specs.colors') as FormArray).clear();
    (this.form.get('specs.sizes') as FormArray).clear();
  }
  onCategoryChange(event: any) {
    const categoryId = event.target.value;
    const spec = this.categorySpecs.find((s) => s.category === categoryId);
    if (!spec) return;
    console.log('here');
    this.filteredSpec = spec;
    this.buildDynamicSpecs(spec.specField);
  }
}
