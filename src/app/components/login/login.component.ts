import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Users } from 'src/app/models/Users.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'src/app/services/inventory.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder, 
    private service: InventoryService,
    private snackBar: MatSnackBar,
    private router: Router
    ) { }

  loginForm = this.formBuilder.group({
    username: '',
    password: ''
  })

  success = false;

  ngOnInit(): void {
    sessionStorage.clear();
  }
  guestLogin(){
    sessionStorage.setItem("username", "guest");
    this.router.navigate(['/dashboard']);
  }
  login(){
    var username = this.loginForm.value.username;
    var password = this.loginForm.value.password;

    const observable = this.service.getUsers();
    observable.subscribe((dataArray: Users[])=>{
      for(var i=0; i<dataArray.length; i++){
        if(dataArray[i].username == username && dataArray[i].password == password){
          
          this.success = true;
          sessionStorage.setItem("username", username)
          this.router.navigate(['/dashboard']);
          break;
        }
      }

      if(this.success == false){
        this.openSnackBar("Invalid Credentials", "red");
      }else{
        this.openSnackBar("Signed in successfully", "green");
      }
    });
  }

  openSnackBar(message: string, color: string) {
    this.snackBar.open(message, "", {
      duration: 3000,
      panelClass: [color]
    });
  }
}
