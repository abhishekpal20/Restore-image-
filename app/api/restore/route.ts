import { fal } from "@fal-ai/client";
import { NextRequest, NextResponse } from "next/server";

// Configure FAL AI client
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "FAL_KEY environment variable is not set" },
        { status: 500 }
      );
    }

    // Default prompt for photo restoration if none provided
    const restorePrompt = prompt || "Restore this old black and white photo to a modern, high-quality, colorized version with vibrant colors and sharp details";

    const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        prompt: restorePrompt,
        image_url: imageUrl,
        guidance_scale: 3.5,
        num_images: 1,
        output_format: "jpeg",
        safety_tolerance: "2",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Processing:", update.logs?.map((log) => log.message).join(", "));
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
    });
  } catch (error) {
    console.error("Error restoring photo:", error);
    return NextResponse.json(
      { error: "Failed to restore photo" },
      { status: 500 }
    );
  }
} 