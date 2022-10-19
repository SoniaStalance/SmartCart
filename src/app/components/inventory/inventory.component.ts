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
import { UsersShoppingData } from 'src/app/models/UsersShoppingData.model';
import { DatasetItem } from 'src/app/models/DatasetItem.model';
import { NotificationItem } from 'src/app/models/NotificationItem.model';
import { Router } from '@angular/router';

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
  cartDataSource!: MatTableDataSource<CartItem>;
  cart: CartItem[] = [];

  @ViewChild('BillPaginator', {static: false}) billPaginator!: MatPaginator;
  @ViewChild('BillSort', {static: false}) billSort!: MatSort;
  billDataSource!: MatTableDataSource<BillItem>;
  bill: BillItem[] = [];

  username: string = "Guest User";
  guest = true;

  notificationDataSource!: MatTableDataSource<NotificationItem>;

  selectedRowId!: number;
  activeTab = 0;

  notifications: NotificationItem[] = [];
  showNotifications= false;

  showDisplay = false;
  imgSrc = "";
  description = "";
  shelf = 0;
  lane = 0;
  totalBill = 0;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['added', 'name','price', 'discount','lane'];
  displayedColumnsCart = ['name'];
  displayedColumnsBill = ['name','price','quantity','total'];
  notificationColumns = ['message', 'close'];

  constructor(
    private service: InventoryService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private router: Router
    ) {
    var user = sessionStorage.getItem("username");
    if(user==null){
      //redirect
      router.navigate(['']);
      this.openSnackBar("Please sign in first!", "red");
    }
    if(user!=null && user !="guest"){
      this.username = user;
      this.guest = false;
    }
    this.inventoryDataSource = new MatTableDataSource;
    this.cartDataSource = new MatTableDataSource;
    this.billDataSource = new MatTableDataSource;
    this.notificationDataSource = new MatTableDataSource;
  }

  ngOnInit(): void {
    const observable = this.service.getData();
    observable.subscribe((dataArray: DatasetItem[])=>{
      for(var i=0; i<dataArray.length; i++){
        var item: InventoryItem = {
          category: dataArray[i].category,
          cart: false,
          wishlist: false,
          shelf: dataArray[i].shelf,
          lane: dataArray[i].lane,
          description: dataArray[i].description,
          discount: dataArray[i].discount,
          price: dataArray[i].price,
          imgname: dataArray[i].imgname,
          name: dataArray[i].name,
          id: dataArray[i].id
        }
        this.inventory.push(item);
      }
      this.inventoryDataSource.data = this.inventory;
      this.inventoryDataSource.sort = this.inventorySort;
      this.inventoryDataSource.paginator = this.inventoryPaginator;

      //slecting the first item on list by default
      this.select(this.inventoryDataSource.data[0].id, this.inventoryDataSource.data[0].id);

      this.cartDataSource.data = this.cart;
      this.cartDataSource.sort = this.cartSort;
      this.cartDataSource.paginator = this.cartPaginator;

      this.billDataSource.data = this.bill;
      this.billDataSource.sort = this.billSort;
      this.billDataSource.paginator = this.billPaginator;
    });

    const notificationsObservable = this.service.getUsersShoppingData();
    notificationsObservable.subscribe((dataArray: UsersShoppingData[])=>{
      for(var i=0; i<dataArray.length; i++){
        if(dataArray[i].username == this.username){
          //receipts
          var receipts = dataArray[i].receipts;
          for(var r = 0; r<receipts.length; r++){
            let refill = receipts[r].refill
            for(var j=0; j<refill.length; j++){
              let entry = {
                id: refill[j].id,
                name: (this.getDetails(refill[j].id)).name,
                message: "refill is due on",
                refillDate: refill[j].refillDate,
                type: "refill"
              }
              this.notifications.push(entry);
            }
          }
          //wishlist
          if((dataArray[i].wishlist).length > 0){
            //update wishlist
            //notification
            
            for(var w =0; w<(dataArray[i].wishlist).length; w++){
              let entry = {
                id: dataArray[i].wishlist[w],
                name: (this.getDetails(dataArray[i].wishlist[w])).name,
                message: " is in your wishlist",
                refillDate: null,
                type: "wishlist"
              }
  
              this.notifications.push(entry);

              this.inventory.forEach((item)=>{
                if(item.id == dataArray[i].wishlist[w]){
                  item.wishlist = true;
                }
              })
            }
            
            
            
          }
          //break because we got our users data
          break;
        }
      }
      this.notificationDataSource.data = this.notifications;
    });

  }

  playSound(filename: string){
    var audio = new Audio();
    audio.src = "../../assets/sounds/"+filename;
    audio.load();
    audio.play();
  }

  deleteNotification(id: number){
    for(var i=0; i<this.notifications.length; i++){
      if(this.notifications[i].id == id){
        this.notifications.splice(i, 1);
        this.notificationDataSource.data = this.notifications;
        break;
      }
    }
  }
  //add reminder item to cart
  addItem(id:number, type: string){
    this.deleteNotification(id);
      for(var i=0; i<this.inventory.length; i++){
        if(this.inventory[i].id == id){
          this.addToCart(this.inventory[i]);
          break;
        }
      }
  }

  addToCart(item: InventoryItem) {
    this.playSound("add.wav");
    //updated added to cart in inventory
    this.inventory.forEach((inv)=>{
      if(inv.id == item.id && inv.cart == false)
        inv.cart = true;
    })


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
        this.showDisplay = false;
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

          this.inventory.forEach((inv)=>{
            if(inv.id == id && inv.cart == true)
              inv.cart = false;
          })

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
    this.showDisplay = false;
    this.bill = [];
    this.cart = [];
    this.totalBill = 0;
    this.updateBill();
    this.updateCart();

    this.inventory.forEach((item)=>{
      item.cart = false;
    })
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
    //select the first item by default
    if(list.length > 0)
    this.select(list[0].id, list[0].id);
    else{
      this.showDisplay = false;
    }
  }

  selectNotification(id: number, type: string){
    if(type == "wishlist"){
      this.selectedTab(2);
      this.activeTab = 2;
    }else{
      this.selectedTab(0);
      this.activeTab = 0;
    }
    this.select(id, id);
  }

  //selected row
  select(rowId: number, itemId: number){    
    
    this.showDisplay = true;
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
    var details = { name: "", img: "", desc: "", shelf: 0, lane: 0 }
    for(var i=0;i<this.inventory.length; i++){
      if(this.inventory[i].id == id){
         details.name = this.inventory[i].name;
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

  updateWishlist(id: number){
    this.inventory.forEach((item)=>{
      if(item.id == id)
        item.wishlist = !item.wishlist;
    })
  }

  

  logout(){
    sessionStorage.clear();
    this.router.navigate(['']);
    this.openSnackBar("Logged out successfully", "green");
  }
}