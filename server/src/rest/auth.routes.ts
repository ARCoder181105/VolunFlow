// routes/auth.routes.ts

import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../services/prisma.service.js";
import {
  hashPassword,
  comparePassword,
  generateAndStoreTokens,
} from "../services/auth.service.js";
import passport from "../config/passport.js";

const router = Router();
const CLIENT_URL = process.env.CLIENT_URL as string;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_fallback";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_fallback";

// ---------------------------
// Cookie Setter
// ---------------------------
const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const SEVEN_DAY_MS = 7 * 24 * 60 * 60 * 1000;

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: ONE_DAY_MS,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/v1/auth/refresh_token",
    maxAge: SEVEN_DAY_MS,
  });
};

// ---------------------------
// Validation Schemas
// ---------------------------
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  avatarUrl: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ---------------------------
// REGISTER
// POST /api/v1/auth/register
// ---------------------------
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        authProvider: "EMAIL",
        avatarUrl: data.avatarUrl,
      },
    });

    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    const { password: _, refreshToken: __, ...cleanUser } = user;

    return res.status(201).json(cleanUser);
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ message: "Validation error", errors: err });
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// LOGIN
// POST /api/v1/auth/login
// ---------------------------
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.password)
      return res
        .status(401)
        .json({ message: "Login using Google/Facebook only." });

    const valid = await comparePassword(data.password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    const { password: _, refreshToken: __, ...cleanUser } = user;
    res.status(200).json(cleanUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// REFRESH TOKEN
// POST /api/v1/auth/refresh_token
// ---------------------------
router.post("/refresh_token", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ message: "Refresh token missing." });

  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.refreshToken)
      return res.status(403).json({ message: "Session expired." });

    // Compare hashed
    const valid = await comparePassword(token, user.refreshToken);
    if (!valid) return res.status(403).json({ message: "Invalid token" });

    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});

// ---------------------------
// LOGOUT
// POST /api/v1/auth/logout
// ---------------------------
router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string };
      await prisma.user.update({
        where: { id: payload.id },
        data: { refreshToken: null },
      });
    } catch {}
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh_token" });

  return res.status(200).json({ message: "Logged out" });
});

// ---------------------------
// GOOGLE OAUTH
// ---------------------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/login`,
  }),
  async (req, res) => {
    const user = req.user as any;

    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_URL}/dashboard`);
  }
);

// ---------------------------
// FACEBOOK OAUTH
// ---------------------------
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${CLIENT_URL}/login`,
  }),
  async (req, res) => {
    const user = req.user as any;

    const { accessToken, refreshToken } = await generateAndStoreTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_URL}/dashboard`);
  }
);

export default router;
