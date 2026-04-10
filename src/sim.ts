import { TeslaVehicle } from "./types";

export let vehicles: TeslaVehicle[] = [
  {
    id: 123456,
    display_name: "Model Y",
    battery_level: 82,
    locked: true,
    state: "online"
  },
  {
    id: 789101,
    display_name: "Model 3",
    battery_level: 64,
    locked: false,
    state: "asleep"
  }
];

export function findVehicleById(id: number): TeslaVehicle | undefined {
  return vehicles.find((v) => v.id === id);
}