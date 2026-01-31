import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  getMainCodingPrompt,
  screenshotToCodePrompt,
  softwareArchitectPrompt,
} from "@/lib/prompts";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, quality, screenshotUrl } = await request.json();

    const prisma = getPrisma();
    const chat = await prisma.chat.create({
      data: {
        model,
        quality,
        prompt,
        title: "",
        shadcn: true,
      },
    });

    async function fetchTitle() {
      const responseForChatTitle = await generateText({
        model: "meta/llama-3.3-70b",
        system:
          "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
        prompt,
      });
      const title = responseForChatTitle.text || prompt;
      return title;
    }

    async function fetchTopExample() {
      const findSimilarExamples = await generateText({
        model: "meta/llama-3.3-70b",
        system: `You are a helpful bot. Given a request for building an app, you match it to the most similar example provided. If the request is NOT similar to any of the provided examples, return "none". Here is the list of examples, ONLY reply with one of them OR "none":

            - landing page
            - blog app
            - quiz app
            - pomodoro timer
            `,
        prompt,
      });

      const mostSimilarExample = findSimilarExamples.text || "none";
      return mostSimilarExample;
    }

    const [title, mostSimilarExample] = await Promise.all([
      fetchTitle(),
      fetchTopExample(),
    ]);

    let fullScreenshotDescription;
    if (screenshotUrl) {
      const screenshotResponse = await generateText({
        model: "google/gemini-3-flash",
        temperature: 0.4,
        maxOutputTokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: screenshotToCodePrompt },
              {
                type: "image",
                image: screenshotUrl,
              },
            ],
          },
        ],
      });

      fullScreenshotDescription = screenshotResponse.text;
    }

    let userMessage: string;
    if (quality === "high") {
      let initialRes = await generateText({
        model: "moonshotai/kimi-k2.5",
        system: softwareArchitectPrompt,
        prompt: fullScreenshotDescription
          ? fullScreenshotDescription + prompt
          : prompt,
        temperature: 0.4,
        maxOutputTokens: 3000,
      });

      console.log("PLAN:", initialRes.text);

      userMessage = initialRes.text ?? prompt;
    } else if (fullScreenshotDescription) {
      userMessage =
        prompt +
        "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
        fullScreenshotDescription;
    } else {
      userMessage = prompt;
    }

    let newChat = await prisma.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        title,
        messages: {
          createMany: {
            data: [
              {
                role: "system",
                content: getMainCodingPrompt(mostSimilarExample),
                position: 0,
              },
              { role: "user", content: userMessage, position: 1 },
            ],
          },
        },
      },
      include: {
        messages: true,
      },
    });

    const lastMessage = newChat.messages
      .sort((a, b) => a.position - b.position)
      .at(-1);
    if (!lastMessage) throw new Error("No new message");

    return NextResponse.json({
      chatId: chat.id,
      lastMessageId: lastMessage.id,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 },
    );
  }
}
