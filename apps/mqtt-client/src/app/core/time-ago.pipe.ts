import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { TimeAgoUtil } from './time-ago.util';

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform, OnDestroy {

  destroy$: Subject<void> = new Subject();

  transform(value: string, prefix?: string): Observable<string> {
    return timer(0, 1000).pipe(
      map(_ => TimeAgoUtil.createLabel(value, prefix)),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
