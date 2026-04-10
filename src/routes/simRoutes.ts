import { Router, Request, Response } from "express";
import { findVehicleById } from "../sim";

const router = Router();

router.get("/sim/vehicles/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  res.json(vehicle);
});

router.post("/sim/vehicles/:id/lock", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  vehicle.locked = true;
  res.json({ message: "Vehicle locked", vehicle });
});

router.post("/sim/vehicles/:id/unlock", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  vehicle.locked = false;
  res.json({ message: "Vehicle unlocked", vehicle });
});

router.post("/sim/vehicles/:id/toggle-lock", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  vehicle.locked = !vehicle.locked;
  res.json({ message: "Vehicle lock toggled", vehicle });
});

router.post("/sim/vehicles/:id/drain", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  vehicle.battery_level = Math.max(0, vehicle.battery_level - 5);
  res.json({ message: "Battery drained", vehicle });
});

router.post("/sim/vehicles/:id/charge", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  vehicle.battery_level = Math.min(100, vehicle.battery_level + 10);
  res.json({ message: "Battery charged", vehicle });
});
router.get("/sim/vehicles/:id/summary", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  return res.json({
    success: true,
    data: {
      id: vehicle.id,
      display_name: vehicle.display_name,
      battery_level: vehicle.battery_level,
      battery_range: vehicle.battery_level * 3,
      state: vehicle.state,
      locked: vehicle.locked
    }
  });
});

export default router;