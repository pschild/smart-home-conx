import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { differenceInSeconds } from 'date-fns';
import { Observable, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform, OnDestroy {

  destroy$: Subject<void> = new Subject();

  transform(value: string, prefix?: string): Observable<string> {
    return timer(0, 1000).pipe(
      map(_ => this.createTimeAgoLabel(value, prefix)),
      takeUntil(this.destroy$)
    );
  }

  private createTimeAgoLabel(date: string, prefix?: string): string {
    const secDiff = differenceInSeconds(new Date(), new Date(date));
    if (secDiff < 30) {
      return `gerade eben`;
    } else if (secDiff < 60) {
      return this.addPrefix(`${secDiff}s`, prefix);
    } else if (secDiff < 60 * 60) {
      return this.addPrefix(`${Math.floor(secDiff / 60)}m`, prefix);
    } else if (secDiff < 24 * 60 * 60) {
      return this.addPrefix(`${Math.floor(secDiff / (60 * 60))}h`, prefix);
    } else {
      return this.addPrefix(`${Math.floor(secDiff / (24 * 60 * 60))}d`, prefix);
    }
  }

  private addPrefix(label: string, prefix?: string): string {
    return prefix ? `${prefix} ${label}` : label;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
