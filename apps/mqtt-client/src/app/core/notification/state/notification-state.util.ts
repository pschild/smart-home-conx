import { Priority } from '@smart-home-conx/api/shared/data-access/models';
import { compareDesc } from 'date-fns';

const sortMap = {
  [Priority.HIGH]: 0,
  [Priority.MEDIUM]: 1,
  [Priority.LOW]: 2,
};

export namespace NotificationStateUtil {
  export const sortByPriorityAndCreatedAt = (a, b) => {
    if (a.priority === b.priority) {
      return compareDesc(new Date(a.createdAt), new Date(b.createdAt));
    } else {
      return sortMap[a.priority] - sortMap[b.priority];
    }
  };
}
