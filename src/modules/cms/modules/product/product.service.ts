import { Injectable } from "@nestjs/common";
import { AxiosRequestConfig } from "axios";
import { ApiService } from "src/modules/api/api.service";
import { HTTPS_METHODS } from "src/shared/enum";

@Injectable()
export class ProductService {
  constructor(private apiService: ApiService) {}

  async inventoryProducts(
    token: string,
    base_url: string,
    query?: any,
  ): Promise<any> {
    const config: AxiosRequestConfig = this.apiService.getConfig(
      `${base_url}api/data/v9.1/products`,
      HTTPS_METHODS.GET,
      token,
      query,
    );
    try {
      return await this.apiService.request(config);
    } catch (error) {
      throw error;
    }
  }
  async getProduct(token: string, base_url: string, query?: any): Promise<any> {
    const config: AxiosRequestConfig = this.apiService.getConfig(
      `${base_url}api/data/v9.1/products?`,
      HTTPS_METHODS.GET,
      token,
      query,
    );
    try {
      return await this.apiService.request(config);
    } catch (error) {
      throw error;
    }
  }

  async getProductWithId(
    token: string,
    base_url: string,
    productId: string,
    query?: any,
  ): Promise<any> {
    const config: AxiosRequestConfig = this.apiService.getConfig(
      `${base_url}api/data/v9.1/products(${productId})?`,
      HTTPS_METHODS.GET,
      token,
      query,
    );
    try {
      return await this.apiService.request(config);
    } catch (error) {
      throw error;
    }
  }

  async productPriceLevels(
    token: string,
    base_url: string,
    query?: any,
  ): Promise<any> {
    const config: AxiosRequestConfig = this.apiService.getConfig(
      `${base_url}api/data/v9.1/productpricelevels?`,
      HTTPS_METHODS.GET,
      token,
      query,
    );
    try {
      return await this.apiService.request(config);
    } catch (error) {
      throw error;
    }
  }

  async productPriceLevelsWithId(
    token: string,
    base_url: string,
    product_id: string,
    query?: any,
  ): Promise<any> {
    const config: AxiosRequestConfig = this.apiService.getConfig(
      `${base_url}api/data/v9.1/productpricelevels(${product_id})?`,
      HTTPS_METHODS.GET,
      token,
      query,
    );
    try {
      return await this.apiService.request(config);
    } catch (error) {
      throw error;
    }
  }
}
