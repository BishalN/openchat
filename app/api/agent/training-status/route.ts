import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const runId = searchParams.get("runId");

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    // Get Inngest run status
    const response = await fetch(
      `${process.env.INNGEST_EVENT_API_URL}/${runId}/runs`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch training status" },
        { status: 500 }
      );
    }

    const result = await response.json();

    // Check if we have data in the response
    if (!result.data || result.data.length === 0) {
      return NextResponse.json({
        status: "processing",
        progress: 0,
        message: "Starting agent creation...",
        step: "initialize",
      });
    }

    // Get the latest run (should be the first one in the array)
    const latestRun = result.data[0];

    // Map the Inngest run status to our frontend status format
    let status: "processing" | "complete" | "error";
    let progress: number;
    let message: string;
    let step: string;

    switch (latestRun.status) {
      case "Completed":
        status = "complete";
        progress = 100;
        message = "Agent creation completed successfully";
        step = "complete";
        break;
      case "Failed":
        status = "error";
        progress = 0;
        message = "An error occurred during agent creation";
        step = "error";
        break;
      case "Cancelled":
        status = "error";
        progress = 0;
        message = "Agent creation was cancelled";
        step = "error";
        break;
      case "Running":
      default:
        // For running status, we need to estimate progress based on function execution
        status = "processing";
        // If output exists, we can determine which step we're on
        if (latestRun.output) {
          if (latestRun.output.embeddingsStored) {
            progress = 90;
            message = `Generated ${latestRun.output.embeddingsStored} embeddings`;
            step = "embedding";
          } else if (latestRun.output.chunksProcessed) {
            progress = 50;
            message = `Processed ${latestRun.output.chunksProcessed} chunks`;
            step = "chunking";
          } else {
            progress = 20;
            message = "Processing sources";
            step = "initialize";
          }
        } else {
          progress = 10;
          message = "Starting agent creation...";
          step = "initialize";
        }
        break;
    }

    return NextResponse.json({
      status,
      progress,
      message,
      step,
      runId: latestRun.run_id,
      agentId: latestRun.output?.agentId,
    });
  } catch (error) {
    console.error("Error fetching training status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch training status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
