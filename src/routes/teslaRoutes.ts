import { Router, Request, Response } from "express";
import {
  fetchTeslaVehicles,
  fetchTeslaVehicle,
  fetchDriveState,
  fetchChargeState,
  lockTeslaVehicle,
  unlockTeslaVehicle,
  startClimate,
  stopClimate,
  setClimateTemp,
  startCharging,
  stopCharging,
  setChargeLimit,
  honkHorn,
  flashLights,
  wakeUpVehicle
} from "../tesla";
import { getAccessToken, runVehicleCommand } from "./auth";

const router = Router();

router.get("/tesla/vehicles", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const data = await fetchTeslaVehicles(token);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch vehicles",
      details: error.response?.data || error.message
    });
  }
});

router.get("/tesla/vehicles/:id", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const id = req.params.id as string;

  try {
    const data = await fetchTeslaVehicle(token, id);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch vehicle",
      details: error.response?.data || error.message
    });
  }
});

router.get("/tesla/vehicles/:vin/drive_state", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const vin = req.params.vin as string;

  try {
    const data = await fetchDriveState(token, vin);
    console.log("DRIVE STATE RAW:", JSON.stringify(data, null, 2));
    return res.json({
      success: true,
      data: data.response ?? {}
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch drive state",
      details: error.response?.data || error.message
    });
  }
});

router.get("/tesla/vehicles/:id/charge_state", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const id = req.params.id as string;

  try {
    const data = await fetchChargeState(token, id);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch charge state",
      details: error.response?.data || error.message
    });
  }
});
router.post("/tesla/vehicles/:vin/wake", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const vin = req.params.vin as string;

  try {
    const data = await wakeUpVehicle(token, vin);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to wake vehicle",
      details: error.response?.data || error.message
    });
  }
});

router.get("/tesla/vehicles/:vin/summary", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const vin = req.params.vin as string;

  try {
    const vehicle = await fetchTeslaVehicle(token, vin);
    const charge = await fetchChargeState(token, vin);
    const drive = await fetchDriveState(token, vin);

    return res.json({
      success: true,
      data: {
        vin,
        display_name: vehicle.response.display_name ?? null,
        state: vehicle.response.state ?? null,
        battery_level: charge.response?.battery_level ?? null,
        battery_range: charge.response?.battery_range ?? null,
        charging_state: charge.response?.charging_state ?? null,
        charge_limit_soc: charge.response?.charge_limit_soc ?? null,
        latitude: drive.response?.latitude ?? null,
        longitude: drive.response?.longitude ?? null,
        speed: drive.response?.speed ?? null,
        heading: drive.response?.heading ?? null,
        shift_state: drive.response?.shift_state ?? null
      }
    });
  } catch (error: any) {
    console.log("SUMMARY ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to fetch summary",
      details: error.response?.data || error.message
    });
  }
});

router.post("/tesla/vehicles/:id/lock", (req, res) =>
  runVehicleCommand(req, res, lockTeslaVehicle)
);

router.post("/tesla/vehicles/:id/unlock", (req, res) =>
  runVehicleCommand(req, res, unlockTeslaVehicle)
);

router.post("/tesla/vehicles/:id/honk", (req, res) =>
  runVehicleCommand(req, res, honkHorn)
);

router.post("/tesla/vehicles/:id/flash", (req, res) =>
  runVehicleCommand(req, res, flashLights)
);

router.post("/tesla/vehicles/:id/climate/start", (req, res) =>
  runVehicleCommand(req, res, startClimate)
);

router.post("/tesla/vehicles/:id/climate/stop", (req, res) =>
  runVehicleCommand(req, res, stopClimate)
);

router.post("/tesla/vehicles/:id/charge/start", (req, res) =>
  runVehicleCommand(req, res, startCharging)
);

router.post("/tesla/vehicles/:id/charge/stop", (req, res) =>
  runVehicleCommand(req, res, stopCharging)
);

router.post("/tesla/vehicles/:id/climate/temp", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const id = req.params.id as string;
  const { driver_temp, passenger_temp } = req.body as {
    driver_temp: number;
    passenger_temp: number;
  };

  if (driver_temp === undefined || passenger_temp === undefined) {
    return res.status(400).json({
      error: "driver_temp and passenger_temp are required"
    });
  }

  try {
    const data = await setClimateTemp(token, id, driver_temp, passenger_temp);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to set climate temperature",
      details: error.response?.data || error.message
    });
  }
});

router.post("/tesla/vehicles/:id/charge/limit", async (req: Request, res: Response) => {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  const id = req.params.id as string;
  const { percent } = req.body as { percent: number };

  if (percent === undefined || percent < 50 || percent > 100) {
    return res.status(400).json({
      error: "percent must be between 50 and 100"
    });
  }

  try {
    const data = await setChargeLimit(token, id, percent);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to set charge limit",
      details: error.response?.data || error.message
    });
  }
});

export default router;