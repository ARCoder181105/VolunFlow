import axios from 'axios';
import { Event, User, Badge } from '@prisma/client';

// Get webhook URLs from environment variables
const SIGNUP_WEBHOOK_URL = process.env.N8N_WEBHOOK_EVENT_SIGNUP as string;
const BADGE_WEBHOOK_URL = process.env.N8N_WEBHOOK_AWARD_BADGE as string;

/**
 * A type representing only the safe fields of a User.
 * This prevents leaking sensitive data (password, refreshToken) to external services.
 */
export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

/**
 * Sends a webhook to n8n asynchronously ("fire-and-forget").
 */
const sendWebhook = async (url: string, data: any) => {
  if (!url) {
    console.warn(`Webhook URL not set for ${url}. Skipping webhook.`);
    return;
  }

  try {
    // We don't 'await' this promise in the resolver.
    // This allows the main API request to return immediately.
    axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log the error, but don't throw it.
    // A failed webhook should not cause the main API request to fail.
    console.error("Failed to send webhook:", String(error));
  }
};

/**
 * Triggers the event signup workflow in n8n.
 */
export const triggerEventSignup = (user: SafeUser, event: Event) => {
  const payload = {
    volunteer: {
      name: user.name,
      email: user.email,
    },
    event: {
      title: event.title,
      date: event.date,
      location: event.location,
    },
  };
  sendWebhook(SIGNUP_WEBHOOK_URL, payload);
};

/**
 * Triggers the badge awarded workflow in n8n.
 */
export const triggerBadgeAwarded = (user: SafeUser, badge: Badge) => {
  const payload = {
    volunteer: {
      name: user.name,
      email: user.email,
    },
    badge: {
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
    },
  };
  sendWebhook(BADGE_WEBHOOK_URL, payload);
};