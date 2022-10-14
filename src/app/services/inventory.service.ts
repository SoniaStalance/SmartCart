import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InventoryItem } from '../models/InventoryItem.model';
import { Users } from '../models/Users.model';
import { UsersShoppingData } from '../models/UsersShoppingData.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) { }
  url: string = "../assets/data/dataset.json";
  usersShoppingDataUrl: string = "../assets/data/usersShoppingData.json";
  usersUrl: string = "../assets/data/users.json";
  
  getData() {
    return this.http.get<InventoryItem[]>(this.url);
  }

  getUsersShoppingData() {
    //receipts & wishlist
    return this.http.get<UsersShoppingData[]>(this.usersShoppingDataUrl);
  }

  getUsers() {
    return this.http.get<Users[]>(this.usersUrl);
  }
}
