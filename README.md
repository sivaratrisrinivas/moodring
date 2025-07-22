# 🔮 moodring

A personal influence tracker to map and reflect on the architecture of your own mind.

## The "Why" Behind moodring 🤔

We are constantly shaped by the information we consume—the books we read, the videos we watch, the conversations we have. These influences quietly build our beliefs, habits, and worldview. Yet, this entire process is almost completely invisible and untracked.

**moodring is built to solve this.**

It’s a tool designed for **intellectual self-awareness**. It makes the invisible process of influence visible, allowing you to see the exact threads connecting an idea to an action, a piece of content to a new belief. By mapping your own intellectual journey, you can gain a deeper understanding of why you think the way you do.

---

## ✅ Features Built

-   **Add Influence Entries:** A simple, frictionless way to add a new influence (a thought, a link, a quote) as a text entry.
-   **Link Influences:** The ability to create connections between any two entries, forming a "cause and effect" relationship.
-   **Chronological Timeline:** A clean, ordered list of all your entries, allowing you to see your journey over time.
-   **On-Demand AI Reflection:** A button that securely sends your influences from the last 7 days to the Google Gemini AI to generate a short, insightful summary of your week's themes and patterns.

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (with React & TypeScript)
-   **Backend & Database:** [Supabase](https://supabase.com/)
-   **AI Summaries:** [Google Gemini API](https://ai.google.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 How to Run Locally

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/moodring.git](https://github.com/your-username/moodring.git)
    cd moodring
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Supabase & Gemini:**
    -   Create projects on [Supabase](https://supabase.com/) and [Google AI Studio](https://ai.google.dev/).
    -   Set up the necessary database tables and security policies in Supabase.

4.  **Create Environment File:**
    -   In the root of the project, create a file named `.env.local`.
    -   Add your API keys to this file:
        ```
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.