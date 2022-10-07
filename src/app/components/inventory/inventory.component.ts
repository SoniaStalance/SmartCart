import { Component, OnInit, ViewChild } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';

import { InventoryItem } from '../../models/InventoryItem.model';
import { CartItem } from 'src/app/models/CartItem.model';
import { BillItem } from 'src/app/models/BillItem.model';

import { DialogComponent } from '../dialog/dialog.component';

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

  @ViewChild('OffersPaginator', {static: true}) offersPaginator!: MatPaginator;
  @ViewChild('OffersSort', {static: true}) offersSort!: MatSort;
  offersDataSource!: MatTableDataSource<InventoryItem>;
  offers: InventoryItem[] = [];

  @ViewChild('WishlistPaginator', {static: true}) wishlistPaginator!: MatPaginator;
  @ViewChild('WishlistSort', {static: true}) wishlistSort!: MatSort;
  wishlistDataSource!: MatTableDataSource<InventoryItem>;

  @ViewChild('CartPaginator', {static: false}) cartPaginator!: MatPaginator;
  @ViewChild('CartSort', {static: false}) cartSort!: MatSort;
  cartDataSource!: MatTableDataSource<CartItem>;
  cart: CartItem[] = [];

  @ViewChild('BillPaginator', {static: false}) billPaginator!: MatPaginator;
  @ViewChild('BillSort', {static: false}) billSort!: MatSort;
  billDataSource!: MatTableDataSource<BillItem>;
  bill: BillItem[] = [];

  selectedRowId!: number;

  imgSrc = "";
  description = "";
  shelf = 0;
  lane = 0;
  totalBill = 0;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name','price', 'discount'];
  displayedColumnsCart = ['name'];
  displayedColumnsBill = ['name','price','quantity','total'];

  constructor(
    private service: InventoryService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
    ) {
    this.inventoryDataSource = new MatTableDataSource;
    this.offersDataSource = new MatTableDataSource;
    this.wishlistDataSource = new MatTableDataSource;
    this.cartDataSource = new MatTableDataSource;
    this.billDataSource = new MatTableDataSource;
  }

  ngOnInit(): void {
    const observable = this.service.getData();
    observable.subscribe((dataArray: InventoryItem[])=>{
      for(var i=0; i<dataArray.length; i++){
        this.inventory.push(dataArray[i]);
        if(dataArray[i].discount > 0) this.offers.push(dataArray[i]);
      }
      this.inventoryDataSource.data = this.inventory;
      this.inventoryDataSource.sort = this.inventorySort;
      this.inventoryDataSource.paginator = this.inventoryPaginator;

      this.offersDataSource.data = this.offers;
      this.offersDataSource.sort = this.offersSort;
      this.offersDataSource.paginator = this.offersPaginator;
    })
  }

  playSound(filename: string){
    var audio = new Audio();
    audio.src = "../../assets/sounds/"+filename;
    audio.load();
    audio.play();
  }

  addToCart(item: InventoryItem) {
    this.playSound("add.wav");
    let suffix = "1";   //by default 1 for 1st occurance of given item id
    for(var i=this.cart.length-1; i>=0; i--){
      if(this.cart[i].id == item.id){
        suffix = (this.cart[i].uid%10 + 1).toString();
        break;
      }
    }
    //unique id for every cart element
    let uid: number = parseInt(item.id+suffix);
    let newCartItem: CartItem = {"uid": uid,"id": item.id, "name": item.name};
    this.cart.push(newCartItem);
    this.updateCart();
    
    this.addToBill(item);
    this.openSnackBar(item.name+" was added to cart", "green");
  }

  removeFromCart(id:number, uid: number){
    this.playSound("remove.wav");
    var item;
    for(var i=0; i<this.cart.length; i++)
    {
      if((this.cart[i]).uid == uid){
        item = (this.cart[i].name);
        this.imgSrc = "";
        this.cart.splice(i,1);
        break;
      }
    }
    this.updateCart();
    this.removeFromBill(id);
    this.openSnackBar(item+" was removed from cart", "red");
  }

  updateCart(){
    this.cartDataSource.data = this.cart;
    this.cartDataSource.sort = this.cartSort;
    this.cartDataSource.paginator = this.cartPaginator;
  }

  addToBill(item: InventoryItem){
    var addedToBill = false;
    var discount = 0;
    if(item.discount > 0)
    {
      discount = item.price * item.discount;
    }

    var priceAfterDiscount = item.price - discount;

    if(this.bill.length > 0){
      for(let i=0; i<this.bill.length; i++)
      {
        if(this.bill[i].id == item.id){
          this.bill[i].quantity += 1;
          this.bill[i].total = priceAfterDiscount * this.bill[i].quantity;
          addedToBill = true;
          break;
        }
      }
    }
    
    if(!addedToBill){
      let newBillItem: BillItem = {"id": item.id, "name": item.name, "price": priceAfterDiscount, "quantity": 1, "total": priceAfterDiscount};
      this.bill.push(newBillItem);
    }

    //updating total
    this.totalBill += priceAfterDiscount;
    
    this.updateBill();
  }

  removeFromBill(id: number){
    for(var i=0; i<this.bill.length; i++)
    {
      if((this.bill[i]).id == id){
        //updating total
        this.totalBill -= this.bill[i].price;
        if(this.bill[i].quantity == 1){
          this.bill.splice(i,1);
        }else{
          this.bill[i].quantity -= 1;
          this.bill[i].total = this.bill[i].price * this.bill[i].quantity;
        }
        break;
      }
    }
    this.updateBill();
  }

  updateBill(){
    this.billDataSource.data = this.bill;
    this.billDataSource.sort = this.billSort;
    this.billDataSource.paginator = this.billPaginator;
  }

  pay(){
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        bill: this.bill,
        total: this.totalBill,
        displayedColumnsBill: this.displayedColumnsBill
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.playSound("success.wav")
        this.openSnackBar("Payment completed successfully", "green")
        this.reset();
      }else{
        this.openSnackBar("Payment not done", "red")
      }
    });
  }

  reset(){
    this.imgSrc = "";
    this.bill = [];
    this.cart = [];
    this.totalBill = 0;
    this.updateBill();
    this.updateCart();
  } 

  selectedTab(tab: any){
    var list: InventoryItem[] = [];

    if(tab == 0){
      //all items
      list = this.inventory;
    }else if(tab == 1){
      //offers
      this.inventory.forEach((item)=>{
        if(item.discount>0) list.push(item);
      })
    }else{
      //wishlists
      if(tab == 2 || tab == "mywishlist"){
        this.inventory.forEach((item)=>{
          if(item.wishlist == true)
            list.push(item);
        })
      }else{
        this.inventory.forEach((item)=>{
          item.category.forEach((category)=> {
            if(category == tab){
              list.push(item);
            }
          })
        })
      }
    }
    
    this.inventoryDataSource.data = list;
  }

  select(rowId: number, itemId: number){    
    this.selectedRowId = rowId;  
    var details = this.getDetails(itemId);
    this.imgSrc = '../../assets/images/'+details.img;
    this.description = details.desc;
    this.lane = details.lane;
    this.shelf = details.shelf;
    }

  openSnackBar(message: string, color: string) {
    this.snackBar.open(message, "", {
      duration: 3000,
      panelClass: [color]
    });
  }

  getDetails(id: number): any{
    var details = { img: "", desc: "", shelf: 0, lane: 0 }
    for(var i=0;i<this.inventory.length; i++){
      if(this.inventory[i].id == id){
         details.img = this.inventory[i].imgname;
         details.desc += this.inventory[i].description;
         details.shelf = this.inventory[i].shelf;
         details.lane = this.inventory[i].lane;
         break;
      }
    }
    return details;
  }

  getItemPrice(id: number){
    var price = 0;
    for(var i=0;i<this.inventory.length; i++){
      if(this.inventory[i].id == id){
         price = this.inventory[i].price;
         break;
      }
    }
    return price;
  }
}