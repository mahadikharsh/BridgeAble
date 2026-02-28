// Seeds lessons into IndexedDB if they don't exist yet
async function seedLessons() {
  await initDB();

  const existing = await getAllLessons();
  if (existing.length > 0) return; // already seeded

  const lessonsToSeed = [
    {
      lessonKey: "algorithm",
      title: "Algorithm Basics",
      description: "Understand step-by-step problem solving.",
      normal: `
        <p>An algorithm is a step-by-step procedure to solve a problem.</p>
        <p>It takes input, processes it, and produces output.</p>
        <p><b>Example:</b> A recipe is an algorithm for cooking.</p>
      `,
      focus: `
        <p><strong>Step 1:</strong> Define the problem.</p>
        <p><strong>Step 2:</strong> Decide inputs/outputs.</p>
        <p><strong>Step 3:</strong> Write steps in order.</p>
        <p><strong>Step 4:</strong> Test with an example.</p>
      `
    },
    {
      lessonKey: "programming",
      title: "Intro to Programming",
      description: "Learn how coding solves real problems.",
      normal: `
        <p>Programming is writing instructions for computers.</p>
        <p>It helps automate tasks and solve problems efficiently.</p>
        <p><b>Key idea:</b> Logic + practice = good code.</p>
      `,
      focus: `
        <p><strong>Step 1:</strong> Understand the goal.</p>
        <p><strong>Step 2:</strong> Break into smaller tasks.</p>
        <p><strong>Step 3:</strong> Write code.</p>
        <p><strong>Step 4:</strong> Test and fix errors.</p>
      `
    },
    {
      lessonKey: "html",
      title: "HTML Fundamentals",
      description: "Build webpages using tags and structure.",
      normal: `
        <p>HTML is the structure of a webpage.</p>
        <p>It uses tags like <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;div&gt;</code>.</p>
        <p><b>Tip:</b> HTML + CSS + JS = Web.</p>
      `,
      focus: `
        <p><strong>Step 1:</strong> Create a basic HTML file.</p>
        <p><strong>Step 2:</strong> Add headings and paragraphs.</p>
        <p><strong>Step 3:</strong> Add links/images.</p>
        <p><strong>Step 4:</strong> Open in browser.</p>
      `
    },

    // ✅ EXTRA lessons for demo
    {
      lessonKey: "css",
      title: "CSS Basics",
      description: "Make your UI look clean and modern.",
      normal: `
        <p>CSS styles HTML: colors, spacing, layout, fonts.</p>
        <p><b>Example:</b> <code>color</code>, <code>padding</code>, <code>display:flex</code>.</p>
      `,
      focus: `
        <p><strong>Step 1:</strong> Select element (class/id).</p>
        <p><strong>Step 2:</strong> Set size & spacing.</p>
        <p><strong>Step 3:</strong> Apply colors & fonts.</p>
        <p><strong>Step 4:</strong> Use flex/grid for layout.</p>
      `
    },
    {
      lessonKey: "js-basics",
      title: "JavaScript Basics",
      description: "Make the page interactive.",
      normal: `
        <p>JavaScript adds logic and interactivity to web pages.</p>
        <p><b>Examples:</b> buttons, form validation, dynamic content.</p>
      `,
      focus: `
        <p><strong>Step 1:</strong> Variables and types.</p>
        <p><strong>Step 2:</strong> Functions.</p>
        <p><strong>Step 3:</strong> DOM manipulation.</p>
        <p><strong>Step 4:</strong> Events (click, input).</p>
      `
    }
  ];

  for (const L of lessonsToSeed) {
    await upsertLesson(L);
  }

  console.log("✅ Lessons seeded into DB");
}