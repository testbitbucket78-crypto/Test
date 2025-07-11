import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrandServiceModel } from '../models/BrandService'; 

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private readonly storageKey = 'brandConfig';
  private brandConfig: BrandServiceModel | null = null;

  constructor(private http: HttpClient) {
    const stored = sessionStorage.getItem(this.storageKey);
    if (stored) {
      this.brandConfig = JSON.parse(stored);
    }
  }

  getBrandConfig(): BrandServiceModel | null {
    return this.brandConfig;
  }

  hasBrandConfig(): boolean {
    return !!this.brandConfig;
  }

  fetchAndStoreBrandConfig(): Promise<BrandServiceModel> {
    if (this.brandConfig) {
      return Promise.resolve(this.brandConfig);
    }

    const domain = window.location.hostname;
    // const domain = 'cipapp.stacknize.com'
    return this.http
      .get<BrandServiceModel>(`http://localhost:3004/getBrandConfig/${domain}`)
      .toPromise()
      .then((data: BrandServiceModel) => {
        this.brandConfig = data;
        sessionStorage.setItem(this.storageKey, JSON.stringify(data));
        return data;
      });
  }
}