import { Injectable } from '@angular/core';
import { ApiHttpServiceService } from './api-http-service.service';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api/public_api';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService extends ApiHttpServiceService {

  constructor(
    http: HttpClient,
     messageService: MessageService,
  ) {  super(
      http,
      messageService
    );}
}
