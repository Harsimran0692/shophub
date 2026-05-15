import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { OrderService } from '../../services/order.service';
import { Cart, CartData } from '../../models/cart.interface';
import { Address, UserAddresses } from '../../models/address.interface';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cart: CartData | null = null;
  userAddresses: UserAddresses | null = null;
  selectedAddressId: string | null = '';
  showNewAddressForm = false;
  placingOrder = false;
  productImage: string = '';
  selectedPaymentMethod!: 'card' | 'cash_on_delivery' | 'wallet';
  walletBalance: number = 1000;

  addressForm: FormGroup;
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router,
    private productService: ProductService
  ) {
    this.addressForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
    });

    this.paymentForm = this.fb.group({
      cardholderName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.minLength(19)]],
      expiryDate: [
        '',
        [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses();
  }

  private loadCart(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      console.log(this.cart);
    });
  }

  private loadAddresses(): void {
    this.addressService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.userAddresses = addresses;
        // if (addresses.data.length > 0) {
        //   addresses.data.map((address) => {
        //     console.log(address.isDefault);
        //     this.selectedAddressId = address.isDefault
        //       ? address._id
        //       : addresses.data[0]._id;
        //   });
        // }
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
      },
    });
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length > 19) {
      formattedValue = formattedValue.substring(0, 19);
    }
    this.paymentForm.patchValue({ cardNumber: formattedValue });
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentForm.patchValue({ expiryDate: value });
  }

  getTax(): number {
    if (!this.cart) return 0;
    return Math.round(this.cart.totalPrice * 0.08 * 100) / 100;
  }

  getTotal(): number {
    if (!this.cart) return 0;
    return Math.round((this.cart.totalPrice + this.getTax()) * 100) / 100;
  }

  getProductImage(item: any): string {
    return (
      (this.productImage = item.product.images[0].url) ||
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400'
    );
  }

  isFormValid(): boolean {
    const hasValidAddress = !!this.selectedAddressId || this.addressForm.valid;
    return (
      hasValidAddress &&
      this.paymentForm.valid &&
      !!this.cart?.items.length &&
      !this.isPaymentMethodSelected()
    );
  }
  isPaymentMethodSelected(): boolean {
    const hasValidAddress = !!this.selectedAddressId;

    if (!hasValidAddress) return false;

    switch (this.selectedPaymentMethod) {
      case 'cash_on_delivery':
      case 'wallet':
        return true;
      case 'card':
        return this.isFormValid();

      default:
        return false;
    }
  }

  placeOrder(): void {
    console.log(this.getTotal());
    if (!this.selectedAddressId) {
      return;
    }
    this.placingOrder = true;
    // Prepare order data
    const orderData = {
      addressId: this.selectedAddressId,
      paymentMethod: this.selectedPaymentMethod,
      items: this.cart!.items.map((item) => ({
        _id: item._id,
        product: item.product._id,
        quantity: item.quantity,
        price:
          (item.product?.discountedPrice ?? 0) > 0
            ? item.product?.discountedPrice ?? 0
            : item.product?.price ?? 0,
      })),
    };
    console.log(orderData.items);

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log(order);
        this.placingOrder = false;
        this.router.navigate(['/orders', order._id]);
      },
      error: (error) => {
        this.placingOrder = false;
        console.error('Error placing order:', error);
      },
    });
  }
}
