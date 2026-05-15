export interface Address {
  _id: string;
  user: { _id: string; name?: string; email?: string };
  firstName: string;
  lastName?: string;
  streetAddress: string;
  postalCode: string;
  region?: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  addressType: 'billing' | 'shipping';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddresses {
  status: string;
  data: Address[];
}

export interface CreateAddressRequest {
  firstName: string;
  lastName?: string;
  streetAddress: string;
  postalCode: string;
  region?: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  addressType?: 'billing' | 'shipping';
  isDefault?: boolean;
}
