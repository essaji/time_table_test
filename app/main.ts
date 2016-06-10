import {bootstrap} from '@angular/platform-browser-dynamic';
import {AppCmp} from './time_table.component';
import {TTM_Service} from './ttm_service';
import {HTTP_PROVIDERS} from '@angular/http';

bootstrap(AppCmp, [
    HTTP_PROVIDERS,
    TTM_Service
    ]
);
