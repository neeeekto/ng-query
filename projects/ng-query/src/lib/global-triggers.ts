import { fromEvent, Observable, Subject } from 'rxjs';
import { Inject, Injectable, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class GlobalTriggers {
  public readonly focus$: Observable<any>;
  public readonly online$: Observable<any>;
  public readonly blur$: Observable<any>;

  constructor(
    @Optional() @Inject(DOCUMENT) private readonly document?: Document
  ) {
    if (document?.defaultView) {
      const window = document.defaultView;
      this.focus$ = fromEvent(window, 'focus');
      this.online$ = fromEvent(window, 'online');
      this.blur$ = fromEvent(window, 'blur');
    } else {
      this.focus$ = new Subject();
      this.online$ = new Subject();
      this.blur$ = new Subject();
    }
  }
}
