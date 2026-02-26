import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

/**
 * Clerk Webhook Handler
 * 
 * Syncs user data from Clerk to Convex database
 * 
 * Handles events:
 * - user.created: Create new user in Convex
 * - user.updated: Update existing user data
 * - user.deleted: Remove user (optional, can implement soft delete)
 */

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Verify webhook signature
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle different event types
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address ?? "";
      const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || "Anonymous";

      try {
        await ctx.runMutation(internal.users.syncUser, {
          clerkId: id,
          email,
          name,
          imageUrl: image_url ?? "",
        });
      } catch (error) {
        console.error("Error syncing user:", error);
        return new Response("Error syncing user", { status: 500 });
      }
    }

    // Optional: Handle user deletion
    if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        try {
          await ctx.runMutation(internal.users.deleteUser, {
            clerkId: id,
          });
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      }
    }

    return new Response("Webhook processed", { status: 200 });
  }),
});

export default http;
