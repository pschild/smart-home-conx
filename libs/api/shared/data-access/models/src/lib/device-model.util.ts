
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DeviceModelUtil {

  export function parseChipId(topic: string): string {
    const chipIdMatch = topic.match(/devices\/(\d+)/);
    if (!chipIdMatch) {
      throw new Error(`Could not find a chipId. Topic=${topic}`);
    }
    return chipIdMatch[1];
  }

}
