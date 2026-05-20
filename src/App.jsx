import React, { useState } from 'react';
import { Shield, ShieldAlert, PhoneCall, Radio, Settings, Lock, CheckCircle, Smartphone, Sliders, Menu, X } from 'lucide-react';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      {/* Google SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Header / Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#ece9f0] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <div className="p-2 bg-[#6d51e7] rounded-xl text-white shadow-md shadow-[#6d51e7]/20">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">QuickShield Call</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#features" className="hover:text-[#6d51e7] transition-colors min-h-[44px] flex items-center">Features</a>
            <a href="#dashboard" className="hover:text-[#6d51e7] transition-colors min-h-[44px] flex items-center">Live Monitor</a>
            <a href="#security" className="hover:text-[#6d51e7] transition-colors min-h-[44px] flex items-center">Security</a>
            <button className="bg-[#6d51e7] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#5b40d3] transition-all shadow-sm min-h-[44px]">
              Open Dashboard
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#534d59] min-h-[44px] min-w-[44px]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#ece9f0] flex flex-col gap-4 font-medium select-none animate-fadeIn">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#6d51e7]">Features</a>
            <a href="#dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#6d51e7]">Live Monitor</a>
            <a href="#security" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-[#6d51e7]">Security</a>
            <button className="bg-[#6d51e7] text-white w-full py-3 rounded-xl font-semibold hover:bg-[#5b40d3] transition-all min-h-[44px]">
              Open Dashboard
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative px-6 pt-16 pb-20 overflow-hidden bg-gradient-to-b from-white to-[#faf9fb]">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e9f7f0] text-[#1b5e3a] rounded-full text-xs font-semibold mb-6 border border-[#cbebd8]">
            <CheckCircle className="w-3.5 h-3.5" /> Next-Gen AI Screening Active
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Advanced Call Protection for Modern Lines
          </h1>
          <p className="text-lg md:text-xl text-[#534d59] max-w-2xl mx-auto mb-10 leading-relaxed">
            QuickShield Call provides advanced spam protection, real-time call screening, and secure routing for business lines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#dashboard" className="bg-[#6d51e7] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#5b40d3] transition-all shadow-lg shadow-[#6d51e7]/10 flex items-center gap-2 min-h-[44px]">
              View Active Panel
            </a>
            <a href="#features" className="bg-white text-[#534d59] border border-[#ece9f0] px-8 py-4 rounded-xl font-semibold hover:bg-[#faf9fb] transition-all min-h-[44px]">
              Explore Security Features
            </a>
          </div>
        </div>
      </header>

      {/* Dynamic Security Dashboard Simulation Section */}
      <section id="dashboard" className="px-6 py-12 bg-[#faf9fb]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#ece9f0] shadow-xl shadow-purple-950/5 overflow-hidden">
            {/* Control Panel Header */}
            <div className="p-6 bg-gradient-to-r from-[#6d51e7] to-[#8066ee] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">QuickShield System Control</h2>
                <p className="text-white/80 text-sm">Real-time status monitoring and configuration</p>
              </div>
              <button
                onClick={() => setIsProtectionActive(!isProtectionActive)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 min-h-[44px] ${
                  isProtectionActive 
                    ? 'bg-[#1b5e3a] text-white hover:bg-[#15492d]' 
                    : 'bg-white text-[#d32f2f] hover:bg-red-5'
                }`}
              >
                {isProtectionActive ? (
                  <>
                    <Shield className="w-4 h-4" /> Protection Active
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" /> System Disabled
                  </>
                )}
              </button>
            </div>

            {/* Simulated Live Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#ece9f0]">
              <div className="p-6 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-[#ece9f0]">
                <div className="p-3 bg-[#eef0ff] text-[#6d51e7] rounded-xl">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-[#8c8594] uppercase font-bold tracking-wider">Screened Calls</span>
                  <span className="text-2xl font-bold">1,248</span>
                </div>
              </div>
              <div className="p-6 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-[#ece9f0]">
                <div className="p-3 bg-[#e9f7f0] text-[#1b5e3a] rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-[#8c8594] uppercase font-bold tracking-wider">Spam Blocked</span>
                  <span className="text-2xl font-bold text-[#1b5e3a]">942</span>
                </div>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="p-3 bg-[#fff0f0] text-[#d32f2f] rounded-xl">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-[#8c8594] uppercase font-bold tracking-wider">Active Proxies</span>
                  <span className="text-2xl font-bold">12 / Line</span>
                </div>
              </div>
            </div>

            {/* Live Simulation Alert Banner */}
            <div className="p-6 bg-[#faf9fb] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex
