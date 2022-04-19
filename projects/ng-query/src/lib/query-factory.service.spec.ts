import { TestBed } from '@angular/core/testing';

import { QueryFactoryService } from './query-factory.service';

describe('QueryFactoryService', () => {
  let service: QueryFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
