import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Address,
  UserAddresses,
  CreateAddressRequest,
} from '../models/address.interface';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserAddresses(): Observable<UserAddresses> {
    return this.http.get<UserAddresses>(`${this.apiUrl}/address`).pipe(
      tap((response) => {
        console.log('Fetched address:', response);
      })
    );
  }

  addAddress(
    address: CreateAddressRequest
  ): Observable<{ status: string; data: Address }> {
    return this.http
      .post<{ status: string; data: Address }>(
        `${this.apiUrl}/address/add`,
        address
      )
      .pipe(
        tap((response) => {
          console.log('Added address:', response);
        })
      );
  }

  updateAddress(
    addressId: string,
    address: CreateAddressRequest
  ): Observable<{ status: string; data: Address }> {
    return this.http
      .put<{ status: string; data: Address }>(
        `${this.apiUrl}/address/update/${addressId}`,
        address
      )
      .pipe(
        tap((response) => {
          console.log('Updated address:', response);
        })
      );
  }

  deleteAddress(
    addressId: string
  ): Observable<{ status: string; message: string }> {
    return this.http
      .delete<{ status: string; message: string }>(
        `${this.apiUrl}/address/delete/${addressId}`
      )
      .pipe(
        tap((response) => {
          console.log('Deleted address:', response);
        })
      );
  }

  setDefaultAddress(
    addressId: string
  ): Observable<{ status: string; data: Address }> {
    return this.http
      .patch<{ status: string; data: Address }>(
        `${this.apiUrl}/address/patch/${addressId}`,
        { isDefault: true }
      )
      .pipe(
        tap((response) => {
          console.log('Set default address:', response);
        })
      );
  }

  getAddress(addressId: string): Observable<{ status: string; data: Address }> {
    return this.http
      .get<{ status: string; data: Address }>(
        `${this.apiUrl}/address/${addressId}`
      )
      .pipe(
        tap((response) => {
          console.log('Fetched address:', response);
        })
      );
  }
}
