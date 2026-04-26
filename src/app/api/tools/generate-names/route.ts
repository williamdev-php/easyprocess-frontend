import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// In-memory rate limiter (per IP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_GENERATIONS = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_GENERATIONS - 1 };
  }

  if (entry.count >= MAX_GENERATIONS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_GENERATIONS - entry.count };
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "rate_limit", message: "Daily generation limit reached." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } },
      );
    }

    const { description, language } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length < 3) {
      return NextResponse.json(
        { error: "validation", message: "Description is required (min 3 characters)." },
        { status: 400 },
      );
    }

    const trimmed = description.trim().slice(0, 500);
    const lang = language === "sv" ? "Swedish" : "English";

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Generate exactly 25 creative, memorable and professional business name suggestions for the following business description. The names should be suitable for a real company.

Business description: "${trimmed}"

Rules:
- Return ONLY a JSON array of 25 strings, nothing else
- Names should be creative, catchy, and professional
- Mix different styles: modern, classic, playful, abstract, descriptive
- Some can be single words, some two words, some compound words
- Consider the ${lang} market but include international-sounding names too
- No explanations, no numbering, just the JSON array

Example format: ["Name1", "Name2", "Name3"]`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "parse_error", message: "Failed to generate names." },
        { status: 500 },
      );
    }

    const names: string[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json(
      { names, remaining },
      { headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  } catch (error) {
    console.error("Name generation error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Something went wrong." },
      { status: 500 },
    );
  }
}
