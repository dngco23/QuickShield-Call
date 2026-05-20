import React, { useState } from 'react';
import { Shield, ShieldAlert, PhoneCall, Radio, Lock, CheckCircle, Smartphone, Sliders } from 'lucide-react';

function App() {
  const [isProtectionActive, setIsProtectionActive] = useState(true);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "QuickShield Call",
    "url": "https://quickshield-call.com",
    "description": "Advanced spam protection, real-time call screening, and secure routing for business lines.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://quickshield-call.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1f1a24] font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#ece9f0] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6d51e7] rounded-xl text-white shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">QuickShield Call</span>
          </div>
          <button className="bg-[#6d51e7] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#5b40d3] transition-all min-h-[44px]">
            Dashboard Active
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="px-6 pt-16 pb-12 text-center bg-gradient-to-b from-white to-[#faf9fb]">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e9f7f0] text-[#1b5e3a] rounded-full text-xs font-semibold mb-6 border border-[#cbebd8]">
            <CheckCircle className="w-3.5 h-3.5" /> Next-Gen AI Screening Active
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Advanced Call Protection for Modern Lines
          </h1>
          <p className="text-lg text-[#534d59] max-w-2xl mx-auto mb-8">
            QuickShield Call provides advanced spam protection, real-time call screening, and secure routing for business lines.
          </p>
        </div>
      </header>

      {/* Live System Control Panel */}
      <section className="px-6 py-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#ece9f0] shadow-xl shadow-purple-950/5 overflow-hidden">
          <div className="p-6 bg-[#6d51e7] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">QuickShield System Control</h2>
              <p className="text-white/80 text-sm">Real-time status monitoring and configuration</p>
            </div>
            <button
              onClick={() => setIsProtectionActive(!isProtectionActive)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                isProtectionActive ? 'bg-[#1b5e3a] text-white' : 'bg-red-600 text-white'
              }`}
            >
              {isProtectionActive ? <><Shield className="w-4 h-4" /> Protection Active</> : <><ShieldAlert className="w-4 h-4" /> System Disabled</>}
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#ece9f0]">
            <div className="p-6 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-[#ece9f0]">
              <div className="p-3 bg-[#eef0ff] text-[#6d51e7] rounded-xl"><PhoneCall className="w-5 h-5" /></div>
              <div>
                <span className="block text-xs text-[#8c8594] font-bold uppercase tracking-wider">Screened</span>
                <span className="text-2xl font-bold">1,248</span>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-[#ece9f0]">
              <div className="p-3 bg-[#e9f7f0] text-[#1b5e3a] rounded-xl"><Shield className="w-5 h-5" /></div>
              <div>
                <span className="block text-xs text-[#8c8594] font-bold uppercase tracking-wider">Spam Blocked</span>
                <span className="text-2xl font-bold text-[#1b5e3a]">942</span>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-[#fff0f0] text-[#d32f2f] rounded-xl"><Radio className="w-5 h-5" /></div>
              <div>
                <span className="block text-xs text-[#8c8594] font-bold uppercase tracking-wider">Active Proxies</span>
                <span className="text-2xl font-bold">12 / Line</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#faf9fb] flex justify-between items-center text-xs text-[#534d59] font-medium">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isProtectionActive ? 'bg-[#1b5e3a]' : 'bg-[#d32f2f]'}`}></span>
              <span>{isProtectionActive ? 'All communication routes secure.' : 'Routes unprotected.'}</span>
            </div>
            <span className="font-mono text-[#8c8594]">Node Status: Active</span>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Secure Communication Utilities</h2>
          <p className="text-[#534d59]">Enterprise-grade architecture tailored for voice stream integrity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-[#ece9f0]">
            <div className="p-3 bg-[#eef0ff] text-[#6d51e7] rounded-xl w-fit mb-4"><Sliders className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Real-Time Screening</h3>
            <p className="text-sm text-[#534d59]">Instantaneous verification algorithms evaluate call context vectors instantly.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#ece9f0]">
            <div className="p-3 bg-[#eef0ff] text-[#6d51e7] rounded-xl w-fit mb-4"><Lock className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Secure Routing</h3>
            <p className="text-sm text-[#534d59]">Dynamically tokens calls to prevent spoofing attacks from compromising lines.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#ece9f0]">
            <div className="p-3 bg-[#eef0ff] text-[#6d51e7] rounded-xl w-fit mb-4"><Smartphone className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Spam Deflection</h3>
            <p className="text-sm text-[#534d59]">Maintains an automated blocklist ecosystem responding to call traffic trends.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ece9f0] bg-white py-8 px-6 text-center text-sm text-[#8c8594]">
        <p>© 2026 QuickShield Call. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
