import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AddressService } from '../../services/address.service';
import {
  Address,
  CreateAddressRequest,
  UserAddresses,
} from '../../models/address.interface';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './addresses.component.html',
})
export class AddressesComponent implements OnInit {
  addresses: Address[] = [];
  loading = true;
  saving = false;
  showAddForm = false;
  editingAddress: Address | null = null;

  addressForm: FormGroup;

  // Sample region lists (extend as needed)
  canadianRegions = [
    'AB',
    'BC',
    'MB',
    'NB',
    'NL',
    'NS',
    'NT',
    'NU',
    'ON',
    'PE',
    'QC',
    'SK',
    'YT',
  ];
  usRegions = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private toast: ToastService
  ) {
    this.addressForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: [''],
        streetAddress: ['', Validators.required],
        postalCode: ['', Validators.required],
        region: [''],
        country: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
        phoneNumber: ['', Validators.pattern(/^\+?\d{10,15}$/)],
        email: ['', Validators.email],
        addressType: ['shipping', Validators.required],
        isDefault: [false],
      },
      { validators: this.regionValidator }
    );
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  // Custom validator for region (required for US/CA)
  regionValidator(form: FormGroup) {
    const country = form.get('country')?.value;
    const region = form.get('region')?.value;
    if (['US', 'CA'].includes(country) && !region) {
      form.get('region')?.setErrors({ required: true });
      return { regionRequired: true };
    }
    return null;
  }

  // Load addresses from API
  loadAddresses(): void {
    this.loading = true;
    this.addressService.getUserAddresses().subscribe({
      next: (response: UserAddresses) => {
        this.addresses = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.loading = false;
        alert(error.error?.message || 'Failed to load addresses');
      },
    });
  }

  // Save or update address
  saveAddress(): void {
    if (this.addressForm.invalid) return;

    this.saving = true;
    const addressData: CreateAddressRequest = { ...this.addressForm.value };
    if (!['US', 'CA'].includes(addressData.country)) {
      addressData.region = undefined; // Clear region for non-US/CA countries
    }

    const request = this.editingAddress
      ? this.addressService.updateAddress(this.editingAddress._id, addressData)
      : this.addressService.addAddress(addressData);

    request.subscribe({
      next: () => {
        this.loadAddresses();
        this.cancelForm();
        this.saving = false;
        this.toast.success('Address updated successfully');
      },
      error: (error) => {
        console.error('Error saving address:', error);
        this.saving = false;
        alert(error.error?.message || 'Failed to save address');
      },
    });
  }

  // Edit address
  editAddress(address: Address): void {
    this.editingAddress = address;
    this.showAddForm = true;
    this.addressForm.patchValue({
      firstName: address.firstName,
      lastName: address.lastName || '',
      streetAddress: address.streetAddress,
      postalCode: address.postalCode,
      region: address.region || '',
      country: address.country,
      phoneNumber: address.phoneNumber || '',
      email: address.email || '',
      addressType: address.addressType,
      isDefault: address.isDefault,
    });
  }

  // Delete address
  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          this.loadAddresses();
          this.toast.success('Address deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          this.toast.error('Failed to delete address');
        },
      });
    }
  }

  // Set default address
  setDefaultAddress(addressId: string): void {
    this.addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
      },
      error: (error) => {
        console.error('Error setting default address:', error);
        alert(error.error?.message || 'Failed to set default address');
      },
    });
  }

  // Cancel form
  cancelForm(): void {
    this.showAddForm = false;
    this.editingAddress = null;
    this.addressForm.reset({ addressType: 'shipping', isDefault: false });
  }

  // Custom pipe for region label (used in template)
  regionLabel(country: string): string {
    return ['US', 'CA'].includes(country) ? '*' : '(Optional)';
  }
}
