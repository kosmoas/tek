import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { TeslaApiVehiclesResponse, TeslaVehicle, TeslaApiVehicle, VehiclesResponse, VehicleState } from "./types";
import { exchangeCodeForToken, fetchTeslaVehicles, fetchTeslaVehicle, refreshAccessToken, lockTeslaVehicle } from "./tesla";
import {vehicles, findVehicleById} from "./sim";
import { error } from "node:console";
let savedAccessToken: string | ""
let savedRefreshToken: any

dotenv.config();

const app = express();

app.use(express.json());




app.get("/", (req: Request, res: Response) => {
  res.send("Tesla TS API is running");
});

app.get("/tesla/vehicles", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  const accessToken =
    typeof authHeader === "string"
      ? authHeader.replace("Bearer ", "")
      : savedAccessToken;

  if (!accessToken) {
    return res.status(401).json({
      error: "Missing access token"
    });
  }

  try {
    const vehicles = await fetchTeslaVehicles(accessToken);
    return res.json(vehicles);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch Tesla vehicles",
      details: error.response?.data || error.message
    });
  }
});

app.get("/vehicles/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({
      error: "Vehicle not found"
    });
  }

  res.json(vehicle);
});
app.get("/tesla/vehicles/:id", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  const accessToken =
    typeof authHeader === "string"
      ? authHeader.replace("Bearer ", "")
      : "";

  if (!accessToken) {
    return res.status(401).json({
      error: "Missing access token"
    });
  }

  try {
    const vehicle = await fetchTeslaVehicle(accessToken, req.params.id);
    return res.json(vehicle);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch Tesla vehicle",
      details: error.response?.data || error.message
    });
  }
});
app.post("/vehicles/:id/lock", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({
      error: "Vehicle not found"
    });
  }

  vehicle.locked = true;

  res.json({
    message: "Vehicle locked",
    vehicle
  });
});
app.post("/vehicles/:id/unlock", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({
      error: "Vehicle not found"
    });
  }

  vehicle.locked = false;

  res.json({
    message: "Vehicle unlocked",
    vehicle
  });
});
app.post("/vehicles/:id/toggle-lock", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({
      error: "Vehicle not found"
    });
  }

  vehicle.locked = !vehicle.locked;

  res.json({
    message: "Vehicle lock toggled",
    vehicle
  });
});
app.post("/vehicles/:id/drain", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({
      error: "Vehicle not found"
    });
  }

  vehicle.battery_level -= 5;

  if (vehicle.battery_level < 0) {
    vehicle.battery_level = 0;
  }

  res.json({
    message: "Battery drained",
    vehicle
  });
});
app.post("/vehicles/:id/charge", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const vehicle = findVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({
      error: "Vehicle not found"
    });
  }

  vehicle.battery_level += 10;

  if (vehicle.battery_level > 100) {
    vehicle.battery_level = 100;
  }

  res.json({
    message: "Battery charged",
    vehicle
  });
});
app.get("/auth/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.status(400).json({
      error: "Missing authorization code"
    });
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    savedAccessToken = tokenData.access_token;
    savedRefreshToken = tokenData.refresh_token;

    return res.json({
      message: "OAuth success",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
      
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Token exchange failed",
      details: error.response?.data || error.message
    });
  }
});
app.get("/auth/refresh", async (req: Request, res: Response) => {
  if (!savedRefreshToken) {
    return res.status(401).json({
      error: "Missing refresh token"
    });
  }

  try {
    const tokenData = await refreshAccessToken(savedRefreshToken);

    savedAccessToken = tokenData.access_token;
    savedRefreshToken = tokenData.refresh_token || savedRefreshToken;

    return res.json({
      message: "Token refreshed",
      access_token: tokenData.access_token,
      refresh_token: savedRefreshToken,
      expires_in: tokenData.expires_in
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to refresh token",
      details: error.response?.data || error.message
    });
  }
});
app.get("/auth/login", (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.TESLA_CLIENT_ID || "",
    redirect_uri: process.env.TESLA_REDIRECT_URI || "",
    response_type: "code",
    scope: "openid offline_access vehicle_device_data",
    audience: process.env.TESLA_AUDIENCE || "",
    state: "demo123"
  });

  const authUrl = `https://auth.tesla.com/oauth2/v3/authorize?${params.toString()}`;

  res.redirect(authUrl);
});
app.get("/tesla/vehicles", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  const accessToken =
    typeof authHeader === "string"
      ? authHeader.replace("Bearer ", "")
      : savedAccessToken;

  if (!accessToken) {
    return res.status(401).json({
      error: "Missing access token"
    });
  }

  try {
    const teslaResponse = await axios.get(
      "https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json(teslaResponse.data);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch Tesla vehicles",
      details: error.response?.data || error.message
    });
  }
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});