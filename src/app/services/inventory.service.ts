import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryItem } from '../models/InventoryItem.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) { }
  url: string = "../assets/dataset.json";
  receiptsUrl: string = "../assets/receipts.json";
  //observable
  getData() {
    return this.http.get<InventoryItem[]>(this.url);
  }

  getReceipts() {
    return this.http.get<any>(this.receiptsUrl);
  }
}
