import { IClusterConfig, ISingleHostConfig } from 'influx';

export const INFLUX_DB_OPTIONS_TOKEN = 'INFLUX_DB_OPTIONS';

export type InfluxModuleOptions = IClusterConfig | ISingleHostConfig;
