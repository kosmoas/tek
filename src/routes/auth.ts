import { Request, Response } from "express";
import { waitUntilAwake } from "../tesla";

let savedAccessToken: string | null = null;
let savedRefreshToken: string | null = null;

export function setTokens(accessToken: string, refreshToken?: string | null) {
  savedAccessToken = accessToken;
  savedRefreshToken = refreshToken || null;
}

export function getSavedRefreshToken() {
  return savedRefreshToken;
}

export function getSavedAccessToken() {
  return savedAccessToken;
}

export function getAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  const token =
    typeof authHeader === "string"
      ? authHeader.replace("Bearer ", "")
      : savedAccessToken;

  return token || null;
}

export async function ensureAwake(
  token: string,
  id: string,
  res: Response
): Promise<boolean> {
  const awake = await waitUntilAwake(token, id);

  if (!awake) {
    res.status(408).json({ error: "Vehicle did not wake up" });
    return false;
  }

  return true;
}

export async function runVehicleCommand(
  req: Request,
  res: Response,
  command: (token: string, id: string) => Promise<any>
) {
  const token = getAccessToken(req);

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  const id = req.params.id as string;

  if (!(await ensureAwake(token, id, res))) {
    return;
  }

  try {
    const data = await command(token, id);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: "Vehicle command failed",
      details: err.response?.data || err.message
    });
  }
}