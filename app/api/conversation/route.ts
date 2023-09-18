import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

import { increaseApiLimit, checkApiLimt } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const configuration = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAI();

    if (!configuration.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimt();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    if (!isPro) {
      await increaseApiLimit();
    }

    return new NextResponse(JSON.stringify(response.choices[0].message));
  } catch (error) {
    console.error('[CONVERSATION_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
