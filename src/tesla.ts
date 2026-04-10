import axios from "axios";
import { TeslaApiVehicle, TeslaApiVehiclesResponse, TeslaTokenResponse } from "./types";

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
  id: string
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