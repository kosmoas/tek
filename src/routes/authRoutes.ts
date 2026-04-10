import { Router, Request, Response } from "express";
import {
  exchangeCodeForToken,
  refreshAccessToken,
  registerPartnerAccount
} from "../tesla";
import {
  setTokens,
  getSavedAccessToken,
  getSavedRefreshToken
} from "./auth";

const router = Router();

router.get("/auth/login", (_req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.TESLA_CLIENT_ID || "",
    redirect_uri: process.env.TESLA_REDIRECT_URI || "",
    response_type: "code",
    scope: "openid offline_access vehicle_device_data vehicle_cmds vehicle_location vehicle_specs",
    audience: process.env.TESLA_AUDIENCE || "",
    state: "demo123"
  });

  const authUrl = `https://auth.tesla.com/oauth2/v3/authorize?${params.toString()}`;
  res.redirect(authUrl);
});

router.get("/auth/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    setTokens(tokenData.access_token, tokenData.refresh_token);

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

router.get("/auth/refresh", async (_req: Request, res: Response) => {
  const refreshToken = getSavedRefreshToken();

  if (!refreshToken) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  try {
    const tokenData = await refreshAccessToken(refreshToken);
    setTokens(tokenData.access_token, tokenData.refresh_token || refreshToken);

    return res.json({
      message: "Token refreshed",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || refreshToken,
      expires_in: tokenData.expires_in
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to refresh token",
      details: error.response?.data || error.message
    });
  }
});

router.get("/auth/register-partner", async (_req: Request, res: Response) => {
  const accessToken = getSavedAccessToken();

  if (!accessToken) {
    return res.status(401).json({ error: "No access token" });
  }

  try {
    const result = await registerPartnerAccount(accessToken);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to register partner",
      details: error.response?.data || error.message
    });
  }
});

export default router;