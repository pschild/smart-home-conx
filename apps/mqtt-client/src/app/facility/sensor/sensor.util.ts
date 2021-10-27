import { SensorType } from '@smart-home-conx/api/shared/data-access/models';

export namespace SensorUtil {
  export function getIconNameByType(type: SensorType): string {
    switch (type) {
      case SensorType.TEMPERATURE:
        return 'thermostat';
      case SensorType.HUMIDITY:
        return 'water_damage';
      case SensorType.VOLTAGE:
        return 'battery_charging_full';
      case SensorType.MOVEMENT:
        return 'settings_input_antenna';
      default:
        throw new Error(`Unknown sensor type "${type}"!`);
    }
  }

  export function getLabelByType(type: SensorType): string {
    switch (type) {
      case SensorType.TEMPERATURE:
        return 'Temperatur';
      case SensorType.HUMIDITY:
        return 'Luftfeuchtigkeit';
      case SensorType.VOLTAGE:
        return 'Batterie';
      case SensorType.MOVEMENT:
        return 'Bewegungsmelder';
      default:
        throw new Error(`Unknown sensor type "${type}"!`);
    }
  }

  export function getSuffixByType(type: SensorType): string {
    switch (type) {
      case SensorType.TEMPERATURE:
        return '°C';
      case SensorType.HUMIDITY:
        return '%';
      case SensorType.VOLTAGE:
        return 'V';
      case SensorType.MOVEMENT:
        return null;
      default:
        throw new Error(`Unknown sensor type "${type}"!`);
    }
  }
}
