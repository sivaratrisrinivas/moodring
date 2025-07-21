# 🔮 moodring

A personal influence tracker to map and reflect on what shapes your thinking, decisions, and behavior over time.

## ✨ Core Idea

This application is designed to be a "memory mirror." It helps you track the books, articles, conversations, and videos that influence you, and then visualize the connections between them. The goal is to gain a deeper understanding of your own intellectual and emotional journey by seeing how one idea leads to another.

---

## ✅ Features Built (MVP)

We have successfully built a powerful Minimum Viable Product with the following features:

-   **Add Influence Entries:** A simple, frictionless way to add a new influence (a thought, a link, a quote) as a text entry.
-   **Link Influences:** The ability to create connections between any two entries, forming a "cause and effect" relationship.
-   **Chronological Timeline:** A clean, ordered list of all your entries, allowing you to see your journey over time.
-   **3D Influence Graph:** An interactive, 3D visualization of your influence network. You can switch to this view to see your ideas as a constellation of nodes and links that you can rotate, pan, and zoom.
-   **On-Demand AI Reflection:** A button that securely sends your influences from the last 7 days to the Google Gemini AI to generate a short, insightful summary of your week's themes and patterns.

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (with React & TypeScript)
-   **Backend & Database:** [Supabase](https://supabase.com/)
-   **AI Summaries:** [Google Gemini API](https://ai.google.dev/)
-   **3D Visualization:** [react-force-graph-3d](https://github.com/vazco/react-force-graph)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 How to Run Locally

To set up and run this project on your own machine, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/moodring.git](https://github.com/your-username/moodring.git)
    cd moodring
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Supabase:**
    -   Create a new project on [Supabase](https://supabase.com/).
    -   In the SQL Editor, create the `influences` and `influence_links` tables using the SQL commands from our setup steps.
    -   Create the Row Level Security (RLS) policies for both tables to allow public access.

4.  **Create Environment File:**
    -   In the root of the project, create a file named `.env.local`.
    -   Add your Supabase and Gemini API keys to this file:
        ```
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.