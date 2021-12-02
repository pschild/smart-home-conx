import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { differenceInSeconds } from 'date-fns';
import { Observable, Subject, timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Pipe({ name: 'countdown' })
export class CountdownPipe implements PipeTransform, OnDestroy {

  destroy$: Subject<void> = new Subject();

  transform(value: string): Observable<string> {
    return timer(0, 1000).pipe(
      map(_ => this.createLabel(value)),
      takeUntil(this.destroy$)
    );
  }

  private createLabel(date: string): string {
    const diff = differenceInSeconds(new Date(date), new Date());
    if (diff < 0) {
      return '0:00';
    }
    const m = Math.floor(diff / 60);
    const s = diff - m * 60;
    return `${m}:${this.leadingZero(s)}`;
  }

  private leadingZero(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
