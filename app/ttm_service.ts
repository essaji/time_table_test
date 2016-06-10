import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class TTM_Service{

    constructor(private _http:Http){}

    getData():Observable{
        return this._http.get("app/test_assignment.json");
    }
}