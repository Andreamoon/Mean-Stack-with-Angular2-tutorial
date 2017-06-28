import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-navabar',
  templateUrl: './navabar.component.html',
  styleUrls: ['./navabar.component.css']
})
export class NavabarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessagesService: FlashMessagesService) { }

    // Function to logout user
onLogoutClick() {
  this.authService.logout(); // Logout user
  this.flashMessagesService.show('Hai correttamente effettuato il logout', { cssClass: 'alert-info' }); // Set custom flash message
  this.router.navigate(['/']); // Navigate back to home page
}

  ngOnInit() {
  }

}
