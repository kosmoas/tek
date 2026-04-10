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