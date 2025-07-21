'use server';

// 1. Corrected import from the new package
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function generateReflectionAction() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: influences, error: dbError } = await supabase
      .from('influences')
      .select('content')
      .gte('created_at', sevenDaysAgo);

    if (dbError) throw new Error('Database error: ' + dbError.message);
    if (!influences || influences.length === 0) {
      return { summary: "You haven't added any influences in the last week. Add some thoughts to get your first reflection!" };
    }

    const influencesText = influences.map((i) => `- ${i.content}`).join('\n');
    const prompt = `You are a helpful and insightful reflection assistant. Based on the following journal entries from a user's past week, identify 1-2 emerging themes or patterns in their thinking. Write a short, encouraging reflection (2-3 sentences) directly to the user.

    Here are the user's entries:
    ${influencesText}`;

    // 2. Corrected class name and API call flow
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const summaryText = response.text();

    return { summary: summaryText };

  } catch (error) {
    console.error('An error occurred in generateReflectionAction:', error);
    return { error: 'Sorry, I was unable to generate a reflection at this time.' };
  }
}