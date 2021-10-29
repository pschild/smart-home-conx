import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { differenceInSeconds } from 'date-fns';
import { Observable, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform, OnDestroy {

  destroy$: Subject<void> = new Subject();

  transform(value: string): Observable<string> {
    return timer(0, 1000).pipe(
      map(_ => this.createTimeAgoLabel(value)),
      takeUntil(this.destroy$)
    );
  }

  private createTimeAgoLabel(date: string): string {
    const secDiff = differenceInSeconds(new Date(), new Date(date));
    if (secDiff < 60) {
      return `gerade eben`;
    } else if (secDiff < 60 * 60) {
      return `vor ${Math.floor(secDiff / 60)}m`;
    } else if (secDiff < 24 * 60 * 60) {
      return `vor ${Math.floor(secDiff / (60 * 60))}h`;
    } else {
      return `vor ${Math.floor(secDiff / (24 * 60 * 60))}d`;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
