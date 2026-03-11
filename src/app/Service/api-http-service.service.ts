import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Subject,
  throwError,
  firstValueFrom,
} from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { URI_ENDPOINT, URI_ENDPOINT_WITH_ID, URI_ENDPOINT_WITH_PARAMS } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiHttpServiceService {

  constructor(
    private http: HttpClient,
    public messageService: MessageService,
  ) { }


   public get<T>(uri: string, options?: any) {
    return this.http.get<T>(URI_ENDPOINT(uri), options).pipe(
      catchError((error) => {
        let errorMsg: string;
        if (error.error instanceof ErrorEvent) {
          errorMsg = this.getNormalErrorMessage(error.error);
        } else {
          errorMsg = this.getServerErrorMessage(error);
        }
        return throwError(() => errorMsg);
      })
    );
  }

  public async getAsync<T>(uri: string, options?: any) {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(URI_ENDPOINT(uri), options)
      );
      return response;
    } catch (error: any) {
      let errorMsg: string;
      if (error.error instanceof ErrorEvent) {
        errorMsg = this.getNormalErrorMessage(error.error);
      } else {
        errorMsg = this.getServerErrorMessage(error);
      }
      return throwError(() => errorMsg);
    }
  }
  public getWithId<T>(uri: string, id: any, options?: any) {
    return this.http.get<T>(URI_ENDPOINT_WITH_ID(uri, id), options).pipe(
      catchError((error) => {
        let errorMsg: {};
        if (error.error instanceof ErrorEvent) {
          errorMsg = this.getNormalErrorMessage(error.error);
        } else {
          errorMsg = this.getServerErrorMessage(error);
        }
        return throwError(() => errorMsg);
      })
    );
  }
  public post<T>(uri: string, data: any, options?: any) {
    return this.http.post<T>(URI_ENDPOINT(uri), data, options).pipe(
      catchError((error) => {
        let errorMsg: {};
        if (error.error instanceof ErrorEvent) {
          errorMsg = this.getNormalErrorMessage(error.error);
        } else {
          errorMsg = this.getServerErrorMessage(error);
        }
        return throwError(() => errorMsg);
      })
    );
  }

  public async postAsync<T>(uri: string, data: any, options?: any) {
    try {
      const response = await firstValueFrom(
        this.http.post<T>(URI_ENDPOINT(uri), data, options)
      );
      return response;
    } catch (error: any) {
      let errorMsg: {};
      if (error.error instanceof ErrorEvent) {
        errorMsg = this.getNormalErrorMessage(error.error);
      } else {
        errorMsg = this.getServerErrorMessage(error);
      }
      return throwError(() => errorMsg);
    }
  }
   public getWithParams<T>(uri: string, params: any[], options?: any) {
    return this.http
      .get<T>(URI_ENDPOINT_WITH_PARAMS(uri, params), options)
      .pipe(
        catchError((error) => {
          let errorMsg: {};
          if (error.error instanceof ErrorEvent) {
            errorMsg = this.getNormalErrorMessage(error.error);
          } else {
            errorMsg = this.getServerErrorMessage(error);
          }
          return throwError(() => errorMsg);
        })
      );
  }

  public put<T>(uri: string, data: any, options?: any) {
    return this.http.put(URI_ENDPOINT(uri), data, options);
  }

  public putWithId<T>(uri: string, id: any, options?: any) {
    return this.http.put(URI_ENDPOINT_WITH_ID(uri, id), options);
  }
  public delete(uri: string, options?: any) {
    return this.http.delete(URI_ENDPOINT(uri), options);
  }
  public deleteWithId(uri: string, id: any, options?: any) {
    return this.http.delete(URI_ENDPOINT_WITH_ID(uri, id), options);
  }
  private getServerErrorMessage(error: HttpErrorResponse): any {
    console.log(error);
    console.log(error.error);
    var errorMessage = {
      statusCode: `${error.status}`,
      statusDescription: '',
      message: `${error.error}`,
    };
    switch (error.status) {
      case 400:
        errorMessage.statusDescription = 'Bad Request';
        break;
      case 401:
        errorMessage.statusDescription = 'Unauthorized';
        break;
      case 403:
        errorMessage.statusDescription = 'Access Denied';
        break;
      case 404:
        errorMessage.statusDescription = 'Not Found';
        break;
      case 500:
        errorMessage.statusDescription = 'Internal Server Error';
        break;
      default:
        errorMessage.statusDescription = 'Unknown Server Error';
        break;
    }
    return errorMessage;
  }

  private getNormalErrorMessage(error: ErrorEvent): any {
    var errorMessage = {
      statusCode: `${error.error}`,
      statusDescription: 'Common Error',
      message: `${error.message}`,
    };
    return errorMessage;
  }
}
