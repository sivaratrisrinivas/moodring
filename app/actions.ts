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


// In app/actions.ts

// ... keep the existing generateReflectionAction ...

// 2. Add this new function to the bottom of the file
export async function analyzeConnectionsAction(targetInfluenceId: number) {
  try {
    // Set up the Supabase client
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

    // Fetch the main influence the user clicked on
    const { data: targetInfluence, error: targetError } = await supabase
      .from('influences')
      .select('id, content')
      .eq('id', targetInfluenceId)
      .single();

    if (targetError) throw new Error(`Database error fetching target: ${targetError.message}`);

    // Fetch all links connected to this influence
    const { data: links, error: linksError } = await supabase
      .from('influence_links')
      .select('*')
      .or(`source_id.eq.${targetInfluenceId},target_id.eq.${targetInfluenceId}`);

    if (linksError) throw new Error(`Database error fetching links: ${linksError.message}`);
    if (!links || links.length === 0) {
      return { analysis: "This influence has no connections yet. Link it to another thought to analyze the relationship." };
    }

    // Get the IDs of all connected influences, avoiding duplicates
    const connectedIds = [...new Set(
      links.map(link =>
        link.source_id === targetInfluenceId ? link.target_id : link.source_id
      )
    )];

    // Fetch the content of all those connected influences
    const { data: connectedInfluences, error: connectedError } = await supabase
      .from('influences')
      .select('content')
      .in('id', connectedIds);

    if (connectedError) throw new Error(`Database error fetching connected content: ${connectedError.message}`);
    if (!connectedInfluences) throw new Error('Could not find connected influences.');

    // Construct the new, more sophisticated prompt
    const connectedInfluencesText = connectedInfluences.map(i => `- "${i.content}"`).join('\n');
    const prompt = `You are an insightful reflection coach. The user is exploring a specific thought and its connections. Based on the provided 'Main Thought' and its 'Linked Influences', analyze the potential relationship or underlying theme. Conclude by asking one thought-provoking question to encourage deeper reflection. Be concise, encouraging, and speak directly to the user.

    Main Thought: "${targetInfluence.content}"

    Linked Influences:
    ${connectedInfluencesText}`;

    // Call the Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysisText = response.text();

    return { analysis: analysisText };

  } catch (error) {
    console.error('An error occurred in analyzeConnectionsAction:', error);
    return { error: 'Sorry, I was unable to generate an analysis at this time.' };
  }
}