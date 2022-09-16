import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryItem } from '../models/InventoryItem.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) { }
  url: string = "../assets/dataset.json"
  //observable
  getData() {
    return this.http.get<InventoryItem[]>(this.url);
  }
}
