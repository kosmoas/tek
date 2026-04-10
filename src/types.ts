export type VehicleState = "online" | "asleep" | "offline";

export interface TeslaVehicle {
  id: number;
  display_name: string;
  battery_level: number;
  locked: boolean;
  state: VehicleState;
}

export interface VehiclesResponse {
  count: number;
  response: TeslaVehicle[];
}

export interface TeslaApiVehicle {
  id: number;
  vehicle_id: number;
  vin: string;
  display_name: string;
  state: string;
  locked?: boolean;
}

export interface TeslaApiVehiclesResponse {
  response: TeslaApiVehicle[];
  count?: number;
}
export interface TeslaTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}
export interface DriveState {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number;
  power: number;
  shift_state: "P" | "D" | "R" | "N" | null;
}

export interface ClimateState {
  inside_temp: number;
  outside_temp: number;
  driver_temp_setting: number;
  passenger_temp_setting: number;
  is_climate_on: boolean;
  is_preconditioning: boolean;
}

export interface ChargeState {
  battery_level: number;
  battery_range: number;
  charge_limit_soc: number;
  charging_state: "Charging" | "Complete" | "Disconnected" | "Stopped";
  minutes_to_full_charge: number;
  charge_rate: number;
}

export interface VehicleCommand {
  result: boolean;
  reason: string;
}