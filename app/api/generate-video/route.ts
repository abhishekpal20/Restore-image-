import { fal } from "@fal-ai/client";
import { NextRequest, NextResponse } from "next/server";

// Configure FAL AI client
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, duration } = await request.json();

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

    // Default prompt for video generation if none provided
    const videoPrompt = prompt || "The person in the photo comes to life with gentle, natural movements and a warm smile";

    const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt: videoPrompt,
        image_url: imageUrl,
        duration: duration || "5",
        aspect_ratio: "16:9",
        negative_prompt: "blur, distort, and low quality",
        cfg_scale: 0.5,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Video generation:", update.logs?.map((log) => log.message).join(", "));
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      requestId: result.requestId,
    });
  } catch (error) {
    console.error("Error generating video:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
} 