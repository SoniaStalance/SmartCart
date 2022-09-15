import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InventoryItem } from '../../models/InventoryItem.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  @ViewChild('InventoryPaginator', {static: true}) inventoryPaginator!: MatPaginator;
  @ViewChild('InventorySort', {static: true}) inventorySort!: MatSort;
  inventoryDataSource!: MatTableDataSource<InventoryItem>;
  inventory: InventoryItem[] = [];

  @ViewChild('CartPaginator', {static: false}) cartPaginator!: MatPaginator;
  @ViewChild('CartSort', {static: false}) cartSort!: MatSort;
  cartDataSource!: MatTableDataSource<InventoryItem>;
  cart: InventoryItem[] = [];

  imgSrc = "";
  cartImgSrc = "";

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name'];

  constructor(private service: InventoryService) {

    this.inventoryDataSource = new MatTableDataSource;
    this.cartDataSource = new MatTableDataSource;
  }

  ngOnInit(): void {
    const observable = this.service.getData();
    observable.subscribe((dataArray: InventoryItem[])=>{
      for(var i=0; i<dataArray.length; i++){
        this.inventory.push(dataArray[i]);
      }
      this.inventoryDataSource.data = this.inventory;
      this.inventoryDataSource.sort = this.inventorySort;
      this.inventoryDataSource.paginator = this.inventoryPaginator;
    })
  }

  displayImg(imgName: string) {
    this.imgSrc = '../../assets/images/'+imgName;
  }

  displayCartImg(imgName: string) {
    this.cartImgSrc = '../../assets/images/'+imgName;
  }


  addToCart(item: InventoryItem) {
    this.cart.push(item);
    this.updateCart();
  }

  removeFromCart(id: number){
    for(var i=0; i<this.cart.length; i++)
    {
      if((this.cart[i]).id == id){
        let item = (this.cart[i].name);
        this.cartImgSrc = "";
        this.cart.splice(i,1);
        alert(item+" has been removed!");
        break;
      }
    }
    this.updateCart();
  }

  updateCart(){
    this.cartDataSource.data = this.cart;
    this.cartDataSource.sort = this.cartSort;
    this.cartDataSource.paginator = this.cartPaginator;
  }
}
