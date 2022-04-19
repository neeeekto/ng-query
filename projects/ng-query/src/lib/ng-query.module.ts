import { ModuleWithProviders, NgModule } from '@angular/core';
import { NG_QUERY_DEFAULT_CONFIG } from './di-tokens';
import { DefaulQueryConfig } from './defaul-query-config';

@NgModule({
  declarations: [],
  imports: [],
})
export class NgQueryModule {
  public static forRoot(): ModuleWithProviders<NgQueryModule> {
    return {
      ngModule: NgQueryModule,
      providers: [
        {
          provide: NG_QUERY_DEFAULT_CONFIG,
          multi: true,
          useValue: DefaulQueryConfig,
        },
      ],
    };
  }
}
