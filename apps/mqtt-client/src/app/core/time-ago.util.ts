import { differenceInSeconds } from 'date-fns';

export namespace TimeAgoUtil {
  export function createLabel(date: string, prefix?: string): string {
    const secDiff = differenceInSeconds(new Date(), new Date(date));
    if (secDiff < 30) {
      return `gerade eben`;
    } else if (secDiff < 60) {
      return addPrefix(`${secDiff}s`, prefix);
    } else if (secDiff < 60 * 60) {
      return addPrefix(`${Math.floor(secDiff / 60)}m`, prefix);
    } else if (secDiff < 24 * 60 * 60) {
      return addPrefix(`${Math.floor(secDiff / (60 * 60))}h`, prefix);
    } else {
      return addPrefix(`${Math.floor(secDiff / (24 * 60 * 60))}d`, prefix);
    }
  }

  // eslint-disable-next-line no-inner-declarations
  function addPrefix(label: string, prefix?: string): string {
    return prefix ? `${prefix} ${label}` : label;
  }
}
