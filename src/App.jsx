import React from 'react';

function App() {
  // Safe React-friendly structured data object
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "QuickShield Call",
    "url": "https://quickshield-call.com",
    "description": "QuickShield Call provides advanced spam protection, real-time call screening, and secure routing for business lines.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://quickshield-call.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* This injects the JSON-LD cleanly into the page header structure */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Your actual website visual sections go here */}
      <main>
        <h1>QuickShield Call Premium Security</h1>
        {/* Your other components/HTML elements */}
      </main>
    </>
  );
}

export default App;
