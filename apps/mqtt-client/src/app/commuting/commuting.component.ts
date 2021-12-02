import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { CommutingActions } from './state/commuting.actions';
import { CommutingState } from './state/commuting.state';

@Component({
  selector: 'smart-home-conx-commuting',
  templateUrl: './commuting.component.html',
  styleUrls: ['./commuting.component.scss']
})
export class CommutingComponent implements OnInit, AfterViewInit {

  private animation: Animation;

  @ViewChild('wrapper') wrapperEl: ElementRef;

  fakeMinutes = 1;

  @Select(CommutingState.latestStateEntry) latestStateEntry$: Observable<any>;
  @Select(CommutingState.averageCommutingTime) averageCommutingTime$: Observable<number>;
  @Select(CommutingState.commutingEntries) commutingEntries$: Observable<any[]>;
  @Select(CommutingState.isCommuting) isCommuting$: Observable<boolean>;
  @Select(CommutingState.currentCommutingState) currentCommutingState$: Observable<'START' | 'END' | 'CANCELLED'>;
  @Select(CommutingState.commutingEntriesSinceStart) commutingEntriesSinceStart$: Observable<any[]>;
  @Select(CommutingState.startedAt) startedAt$: Observable<Date>;
  @Select(CommutingState.secondsLeft) secondsLeft$: Observable<number>;
  @Select(CommutingState.arriveAt) arriveAt$: Observable<Date>;
  @Select(CommutingState.currentProgress) currentProgress$: Observable<number>;
  @Select(CommutingState.commutingInfosVisible) commutingInfosVisible$: Observable<boolean>;

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.isCommuting$.subscribe(console.log);
    this.currentCommutingState$.subscribe(console.log);
  }

  ngAfterViewInit(): void {
    combineLatest([
      this.store.select(CommutingState.currentProgress).pipe(filter(value => value !== null)),
      this.store.select(CommutingState.secondsLeft).pipe(filter(value => value !== null))
    ]).pipe(debounceTime(10)).subscribe(([currentProgress, secondsLeft]) => this.updateAnimation(currentProgress * 100, secondsLeft));

    this.cdr.detectChanges();
  }

  updateAnimation(percent: number, seconds: number): void {
    if (this.animation) {
      this.animation.cancel();
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
    console.log(percent, seconds, this.wrapperEl);
    this.animation = this.wrapperEl.nativeElement.animate([
      { transform: `translateX(${percent}%)` },
      { transform: 'translateX(100%)' }
    ], {
      duration: seconds * 1000,
      fill: 'forwards'
    });
    this.animation.onfinish = () => console.log('onfinish');
    this.animation.oncancel = () => console.log('oncancel');
  }
  
  start(): void {
    this.store.dispatch(new CommutingActions.FakeStart());
  }

  stop(): void {
    this.store.dispatch(new CommutingActions.FakeStop());
  }

  cancel(): void {
    this.store.dispatch(new CommutingActions.FakeCancel());
  }

  update(): void {
    this.store.dispatch(new CommutingActions.FakeUpdate(this.fakeMinutes));
  }

}
