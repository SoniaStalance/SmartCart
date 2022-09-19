import { DatePipe } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InventoryComponent } from '../inventory/inventory.component';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})

export class DialogComponent implements OnInit {
  receivedData;
  currentDateTime;
  constructor(
    public datepipe: DatePipe,
    public dialogRef: MatDialogRef<InventoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any){
      this.receivedData = data;

      this.currentDateTime =this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss');
    }
  ngOnInit(): void {
    
  }
}
