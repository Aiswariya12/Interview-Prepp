/**
 * High-Efficiency AI Service for InterviewPrep
 * Features:
 * 1. Personalized Greetings (e.g. "hii" -> "Hello [Name]!")
 * 2. Instant Safe Math Evaluator (e.g. "1+2" -> "3")
 * 3. Direct Gemini API support if custom key provided
 * 4. Rich Technical Knowledge Engine for Java, React, Spring Boot, MySQL, DSA, OOP
 * 5. Live Wikipedia Instant Summary API for any general knowledge or factual question
 */

// Math evaluator for expressions like 1+2, 25*4, 100/5, etc.
export const evaluateMath = (query) => {
  const cleaned = query
    .toLowerCase()
    .replace(/^(what is|calculate|solve|eval|evaluate)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

  // Pattern: digits with +, -, *, /, %, ^
  if (/^(\d+(?:\.\d+)?\s*[\+\-\*\/%^]\s*\d+(?:\.\d+)?(?:\s*[\+\-\*\/%^]\s*\d+(?:\.\d+)?)*)$/.test(cleaned)) {
    try {
      const expr = cleaned.replace(/\^/g, '**');
      if (/^[0-9\.\s\+\-\*\/\%]+$/.test(expr)) {
        const res = Function(`"use strict"; return (${expr})`)();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
          return `${res}`;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
};

// Technical concept knowledge base (short, clean, direct answers like ChatGPT/Gemini)
const TECH_CONCEPTS = [
  {
    keywords: ['what is java', 'explain java', 'java language', 'about java'],
    match: (q) => (q.includes('java') && (q.includes('what is') || q.includes('explain') || q === 'java')) && !q.includes('javascript'),
    answer: `**Java** is a high-level, class-based, object-oriented programming language designed for platform-independent development using the Java Virtual Machine (**JVM**).\n\nKey features:\n- **WORA:** *"Write Once, Run Anywhere"* via compiled bytecode.\n- **Memory Management:** Automatic Garbage Collection.\n- **Robust & Secure:** Strongly typed with no explicit pointers.`
  },
  {
    keywords: ['what is react', 'explain react', 'about react'],
    match: (q) => q.includes('react') && (q.includes('what is') || q.includes('explain') || q === 'react'),
    answer: `**React** is an open-source JavaScript library developed by Meta for building fast, component-based user interfaces.\n\nKey features:\n- **Virtual DOM:** Efficient diffing algorithm for minimal browser repaints.\n- **Declarative & Component-driven:** Reusable functional components and custom hooks.\n- **One-way Data Flow:** Unidirectional data architecture for predictable state.`
  },
  {
    keywords: ['what is spring boot', 'explain spring boot', 'spring boot'],
    match: (q) => q.includes('spring boot'),
    answer: `**Spring Boot** is an extension of the Spring framework that simplifies creating production-grade, stand-alone REST APIs and microservices with minimal configuration.\n\nKey features:\n- **Auto-configuration:** Automatically configures beans based on classpath dependencies.\n- **Embedded Servers:** Embedded Tomcat/Jetty (no need to deploy WAR files).\n- **Starter POMs:** Pre-configured dependency descriptors.`
  },
  {
    keywords: ['polymorphism'],
    match: (q) => q.includes('polymorphism'),
    answer: `**Polymorphism** allows a single method or interface to take multiple forms in object-oriented programming:\n\n1. **Compile-time (Static):** Method Overloading (same method name, different parameters within the same class).\n2. **Runtime (Dynamic):** Method Overriding (subclass overrides parent method with \`@Override\`, resolved by JVM at runtime).\n\n\`\`\`java\nAnimal pet = new Dog(); // Polymorphic reference\npet.speak();            // Calls Dog's overridden method\n\`\`\``
  },
  {
    keywords: ['hashmap', 'concurrenthashmap'],
    match: (q) => q.includes('hashmap') && (q.includes('concurrent') || q.includes('difference') || q.includes('vs')),
    answer: `**HashMap vs ConcurrentHashMap in Java:**\n\n- **HashMap:** Not thread-safe. Faster for single-threaded tasks. Allows 1 \`null\` key.\n- **ConcurrentHashMap:** 100% thread-safe. Uses lock-free reads, CAS (Compare-And-Swap), and synchronized bucket locks. Does **not** allow \`null\` keys or values.`
  },
  {
    keywords: ['acid', 'transactions'],
    match: (q) => q.includes('acid') || (q.includes('transaction') && q.includes('property')),
    answer: `**ACID Properties in Databases:**\n\n- **A (Atomicity):** All operations succeed, or the entire transaction rolls back.\n- **C (Consistency):** Data remains valid according to all schema rules and constraints.\n- **I (Isolation):** Concurrent transactions do not interfere with each other.\n- **D (Durability):** Committed transactions are permanently saved, even in a crash.`
  },
  {
    keywords: ['virtual dom', 'diffing'],
    match: (q) => q.includes('virtual dom') || (q.includes('vdom') && q.includes('react')),
    answer: `**Virtual DOM (VDOM)** is a lightweight JavaScript copy of the real DOM kept in memory by React.\n\nWhen component state changes:\n1. React creates a new Virtual DOM tree.\n2. **Diffing:** Compares the new tree with the previous snapshot ($O(N)$ algorithm).\n3. **Reconciliation:** Computes the minimal set of real DOM updates and applies them in a batch.`
  },
  {
    keywords: ['@transactional'],
    match: (q) => q.includes('transactional'),
    answer: `**\`@Transactional\` in Spring Boot**:\n\nDefines a database transaction boundary around a method using Spring AOP proxies.\n- **Default Propagation:** \`REQUIRED\` (joins existing transaction, or starts a new one).\n- **Rollback:** Rolls back automatically on unchecked exceptions (\`RuntimeException\` and \`Error\`).\n- **Tip:** Self-invocation within the same class bypasses the proxy and will not trigger the transaction.`
  },
  {
    keywords: ['sql vs nosql'],
    match: (q) => q.includes('sql') && q.includes('nosql'),
    answer: `**SQL vs NoSQL:**\n\n- **SQL (Relational):** Structured tabular data, fixed schema, ACID compliant, vertical scaling (e.g. MySQL, PostgreSQL).\n- **NoSQL (Non-Relational):** Flexible documents/key-values, dynamic schema, BASE model, horizontal scaling (e.g. MongoDB, Redis, Cassandra).`
  },
  {
    keywords: ['index', 'b-tree', 'mysql index'],
    match: (q) => (q.includes('index') && q.includes('database')) || (q.includes('b-tree') && q.includes('mysql')),
    answer: `**Database Indexing:**\n\nAn index is a data structure (typically a **B+ Tree**) that speeds up data retrieval operations on a database table at the cost of additional writes and storage.\n- **Clustered Index:** Determines physical row ordering (Primary Key in MySQL InnoDB).\n- **Secondary/Non-Clustered Index:** Contains pointers to the clustered key.`
  }
];

// Live Wikipedia Summary Lookup for general factual questions
const fetchWikipediaSummary = async (query) => {
  try {
    // Strip common question prefixes to get clean search keyword
    const cleanSearch = query
      .replace(/^(what is|who is|what are|who was|tell me about|explain|who's|where is)\s+/i, '')
      .replace(/\?+$/, '')
      .trim();

    if (!cleanSearch || cleanSearch.length < 2) return null;

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      cleanSearch
    )}&limit=2&namespace=0&format=json&origin=*`;

    const res = await fetch(searchUrl);
    if (!res.ok) return null;

    const data = await res.json();
    if (data[1] && data[1].length > 0) {
      const pageTitle = data[1][0];
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;

      const sumRes = await fetch(summaryUrl);
      if (!sumRes.ok) return null;

      const sumData = await sumRes.json();
      if (sumData.extract) {
        // Return first 2-3 sentences for clean conciseness
        const sentences = sumData.extract.split(/(?<=[.!?])\s+/);
        return sentences.slice(0, 3).join(' ');
      }
    }
  } catch (err) {
    console.error('Wikipedia lookup error:', err);
  }
  return null;
};

// Default Google Gemini API key configured for Selectifyy Chatbot
const DEFAULT_GEMINI_API_KEY = typeof atob !== 'undefined'
  ? atob('QVEuQWI4Uk42SVBOU2ZSSjgydlVhS01aMzJDUU9YejktYTctUlRwZ2ZyWXpLeTNlX2REa1E=')
  : (typeof Buffer !== 'undefined' ? Buffer.from('QVEuQWI4Uk42SVBOU2ZSSjgydlVhS01aMzJDUU9YejktYTctUlRwZ2ZyWXpLeTNlX2REa1E=', 'base64').toString('utf8') : '');

// Direct Google Gemini API call with modern model fallbacks
const callGeminiAPI = async (query, apiKey) => {
  if (!apiKey) return null;

  const models = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful, smart AI assistant for an interview preparation platform called Selectifyy. Give direct, short, accurate, and simple answers. If asked a simple question, give a concise answer in 1-3 sentences. Question: ${query}`
              }
            ]
          }
        ]
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch (err) {
      console.warn(`Gemini API call with ${model} error:`, err?.message || err);
    }
  }

  return null;
};

/**
 * Main query processor:
 * 1. Checks greetings -> Personalized response with user name
 * 2. Checks arithmetic expressions -> Instant math answer
 * 3. Checks custom Gemini key -> Direct AI generation
 * 4. Checks technical concept database -> Clean, crisp interview definition
 * 5. Checks Wikipedia instant summary -> Real-time factual answer
 * 6. Fallback -> Direct answer guidance
 */
export const getAIAnswer = async (query, user = null, customApiKey = null) => {
  const q = query.trim();
  const lower = q.toLowerCase();

  // 1. Personalized Greeting
  if (
    ['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'hola', 'gm', 'good morning', 'good afternoon', 'good evening'].includes(
      lower
    ) ||
    lower.startsWith('hi ') ||
    lower.startsWith('hello ') ||
    lower.startsWith('hey ')
  ) {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    return `Hello ${firstName}! How can I help you today?`;
  }

  // 2. Simple Math / Calculator (e.g. 1+2 -> 3)
  const mathResult = evaluateMath(q);
  if (mathResult !== null) {
    return mathResult;
  }

  // 3. Conversational FAQs
  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('your name')) {
    return `I am your **InterviewPrep AI Assistant**! I can answer technical interview questions, solve problems, and help you prepare for software engineering interviews.`;
  }
  if (lower.includes('how are you')) {
    return `I'm doing great and ready to help you learn! What topic would you like to explore today?`;
  }
  if (lower === 'thank you' || lower === 'thanks' || lower.startsWith('thank you') || lower.startsWith('thanks')) {
    return `You're very welcome! Let me know if you have any more questions.`;
  }

  // 4. Custom or Default Gemini API Key
  let apiKey = customApiKey;
  if (!apiKey && typeof window !== 'undefined' && window.localStorage) {
    apiKey = localStorage.getItem('interviewprep_gemini_key');
  }
  if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (!apiKey) {
    apiKey = DEFAULT_GEMINI_API_KEY;
  }
  if (apiKey) {
    const geminiAnswer = await callGeminiAPI(q, apiKey);
    if (geminiAnswer) return geminiAnswer;
  }

  // 5. Technical Knowledge Base
  for (const item of TECH_CONCEPTS) {
    if (item.match(lower)) {
      return item.answer;
    }
  }

  // 6. Live Wikipedia Search for factual & general knowledge queries (e.g. "who is the president of india")
  const wikiAnswer = await fetchWikipediaSummary(q);
  if (wikiAnswer) {
    return wikiAnswer;
  }

  // 7. General fallback
  return `Here is the information for **"${q}"**:\n\nCould you please provide a bit more detail or specify if you'd like a code example, interview question, or theoretical explanation?`;
};
