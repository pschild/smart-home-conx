import { differenceInSeconds } from 'date-fns';
import { CommutingEntry, DurationInfo, StateEntry } from './commuting.state';

export namespace CommutingStateUtil {

  export function getFastestDuration(durations: DurationInfo[]): DurationInfo {
    return durations.reduce((prev, curr) => prev.minutes < curr.minutes ? prev : curr);
  }

  export function getProgress(entries: CommutingEntry[], current: CommutingEntry, latestStateEntry: StateEntry, avg: number): number {
    const predecessor = getPredecessor(entries, current);
    const progressOfPredecessor = !!predecessor ? getProgress(entries, predecessor, latestStateEntry, avg) : 0;
    const durationOfPredecessor = !!predecessor ? CommutingStateUtil.getFastestDuration(predecessor.durations)?.minutes * 60 : avg;
    const startOfPredecessor = !!predecessor ? predecessor.time : latestStateEntry.time;
    return progressOfPredecessor + getProgressPerSecond(progressOfPredecessor, durationOfPredecessor) * differenceInSeconds(new Date(current.time), new Date(startOfPredecessor));
  }

  export function getPredecessor(entries: CommutingEntry[], entry: CommutingEntry): CommutingEntry {
    const index = entries.findIndex(e => e.time === entry.time);
    return index >= 1 ? entries[index - 1] : null;
  }

  export function getProgressPerSecond(progress: number, duration: number): number {
    return (1 - progress) / duration;
  }

}
