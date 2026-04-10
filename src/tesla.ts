import axios from "axios";
import { TeslaApiVehicle, TeslaApiVehiclesResponse, TeslaTokenResponse, VehicleCommand, DriveState, ChargeState } from "./types";

export async function exchangeCodeForToken(code: string): Promise<TeslaTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.TESLA_CLIENT_ID || "",
    client_secret: process.env.TESLA_CLIENT_SECRET || "",
    code,
    audience: process.env.TESLA_AUDIENCE || "",
    redirect_uri: process.env.TESLA_REDIRECT_URI || ""
  });

  const response = await axios.post<TeslaTokenResponse>(
    "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token",
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return response.data;
}

export async function fetchTeslaVehicles(
  accessToken: string
): Promise<TeslaApiVehiclesResponse> {
  const response = await axios.get<TeslaApiVehiclesResponse>(
    "https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}
export async function fetchTeslaVehicleData(
  accessToken: string,
  vin: string
): Promise<any> {
  const response = await axios.get(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${vin}/vehicle_data`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}
export async function fetchTeslaVehicle(accessToken: string, id: any): Promise<{ response: TeslaApiVehicle }> {
  const response = await axios.get<{ response: TeslaApiVehicle }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  return response.data;
}
export async function refreshAccessToken(
  refreshToken: string
): Promise<TeslaTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.TESLA_CLIENT_ID || "",
    client_secret: process.env.TESLA_CLIENT_SECRET || "",
    refresh_token: refreshToken,
    audience: process.env.TESLA_AUDIENCE || ""
  });

  const response = await axios.post<TeslaTokenResponse>(
    "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token",
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return response.data;
}
export async function lockTeslaVehicle(
  accessToken: string,
  id: any
): Promise<any> {
  const response = await axios.post(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/door_lock`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}
export async function registerPartnerAccount(accessToken: string) {
  const response = await axios.post(
    "https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/partner_accounts",
    {
      domain: "irritable-craftily-camping.ngrok-free.dev"
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}
// tesla.ts
export async function wakeUpVehicle(accessToken: string, id: string) {
  const response = await axios.post(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/wake_up`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
}
// --- Drive State ---
export async function fetchDriveState(
  accessToken: string,
  vin: string
): Promise<{ response: any }> {
  const data = await fetchTeslaVehicleData(accessToken, vin);
  return {
    response: data.response.drive_state
  };
}

// --- Climate ---
export async function startClimate(
  accessToken: string,
  id: string
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/auto_conditioning_start`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
}

export async function stopClimate(
  accessToken: string,
  id: string
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/auto_conditioning_stop`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
}

export async function setClimateTemp(
  accessToken: string,
  id: string,
  driverTemp: number,
  passengerTemp: number
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/set_temps`,
    { driver_temp: driverTemp, passenger_temp: passengerTemp },
    { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
  );
  return response.data;
}

// --- Charge ---
export async function fetchChargeState(
  accessToken: string,
  vin: string
): Promise<{ response: any }> {
  const data = await fetchTeslaVehicleData(accessToken, vin);
  return {
    response: data.response.charge_state
  };
}

export async function startCharging(
  accessToken: string,
  id: string
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/charge_start`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
}

export async function stopCharging(
  accessToken: string,
  id: string
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/charge_stop`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
}

export async function setChargeLimit(
  accessToken: string,
  id: string,
  percent: number
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/set_charge_limit`,
    { percent },
    { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
  );
  return response.data;
}

// --- Horn & Lights ---
export async function honkHorn(
  accessToken: string,
  id: string
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/honk_horn`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
}

export async function flashLights(
  accessToken: string,
  id: string
): Promise<{ response: VehicleCommand }> {
  const response = await axios.post<{ response: VehicleCommand }>(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/flash_lights`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
}
export async function waitUntilAwake(
  accessToken: string,
  vin: string,
  attempts = 10
): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const data = await fetchTeslaVehicle(accessToken, vin);

    if (data.response.state === "online") {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return false;
}
export async function unlockTeslaVehicle(accessToken: string, id: string) {
  const response = await axios.post(
    `https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${id}/command/door_unlock`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}