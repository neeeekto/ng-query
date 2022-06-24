import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgQueryModule } from '../ng-query.module';
import { QueryFactory } from '../query-factory';
import { MutationFactory } from '../mutation-factory';
import { QueryStore } from '../query-store';
import { MutationStore } from '../mutation-store';
import { KeyComparator } from '../key-comparator';

describe('Module', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgQueryModule.forRoot()],
      declarations: [],
    }).compileComponents();
  }));
  // TODO: Rename all service, use prefix!

  it('should resolve services', () => {
    expect(TestBed.inject(QueryFactory)).toBeTruthy();
    expect(TestBed.inject(MutationFactory)).toBeTruthy();
    expect(TestBed.inject(QueryStore)).toBeTruthy();
    expect(TestBed.inject(MutationStore)).toBeTruthy();
    expect(TestBed.inject(KeyComparator)).toBeTruthy();
  });
});
