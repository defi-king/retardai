'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { IconReload, IconSourceCode, IconArrowRight, IconSkull, IconSun, IconMoon, IconBrandX } from '@tabler/icons-react';
import axios from 'axios';
import { useTheme } from './providers';
import Image from 'next/image';

interface SearchResult {
  url: string;
  title: string;
  content: string;
}

const ANNOUNCEMENT_MESSAGES = [
  "🖕 DeepSeek in your ass! We're better, faster, and don't give a f*ck.",
  "💀 Warning: This AI has zero chill and negative f*cks to give.",
  "🚀 Like Google, but with balls and better answers.",
  "💣 Drop your question and watch me destroy it.",
  "🌶️ Spicier than your ex's Instagram comments.",
  "🤖 I'm not your typical 'happy to help' assistant.",
];

function getRandomMessage() {
  return ANNOUNCEMENT_MESSAGES[Math.floor(Math.random() * ANNOUNCEMENT_MESSAGES.length)];
}

const LoadingSkeleton = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className="max-w-3xl mx-auto animate-pulse space-y-8">
      {/* Sources section first */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <IconSourceCode className="w-5 h-5 text-gray-300 dark:text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-700">Sources</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#25262B] rounded-lg p-3 shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-blue-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-blue-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-blue-200 dark:bg-gray-700 rounded"></div>
          <div className="h-5 bg-blue-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="bg-white dark:bg-[#25262B] rounded-xl p-6 shadow-lg">
          <div className="space-y-4">
            <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredSource, setHoveredSource] = useState<number | null>(null);
  const [hoveredCitation, setHoveredCitation] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
  const sourceRefs = useRef<Array<HTMLDivElement | null>>([]);
  const citationRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [bannerMessage, setBannerMessage] = useState(getRandomMessage());
  const [sharing, setSharing] = useState(false);
  const [suggestions] = useState([
    "Why is meme market taking a shit today? 📉",
    "What's the most brutal crypto rugpull in history? 🏃‍♂️",
    "How to explain memecoins to your boomer parents? 👴"
  ]);
  const answerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Play sound effect
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }

    setLoading(true);
    setAnswer('');
    setSearchResults([]);

    // Scroll with a slight delay to ensure state updates have rendered
    setTimeout(() => {
      window.scrollTo({
        top: answerRef.current?.offsetTop ?? 0,
        behavior: 'smooth'
      });
    }, 100);

    try {
      const { data } = await axios.post('/api/search', { query });
      setAnswer(data.answer);
      setSearchResults(data.searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setAnswer('Everything\'s fucked. But have you tried turning it off and on again? 💥');
    } finally {
      setLoading(false);
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  const handleSourceHover = (index: number) => {
    const sourceElement = sourceRefs.current[index];
    if (sourceElement) {
      const rect = sourceElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setTooltipPosition(spaceBelow < 200 ? 'top' : 'bottom');
    }
    setHoveredSource(index);
  };

  const handleCitationHover = (id: string | null) => {
    setHoveredCitation(id);
  };

  const processAnswer = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(\[\d+\])/g);
    let citationCounter = 0;

    return parts.map((part, index) => {
      const citationMatch = part.match(/\[(\d+)\]/);
      if (citationMatch) {
        const citationNumber = parseInt(citationMatch[1]) - 1;
        const uniqueCitationId = `${citationNumber}-${citationCounter++}`;

        if (citationNumber >= 0 && citationNumber < searchResults.length) {
          return (
            <span
              key={`citation-${uniqueCitationId}`}
              className="relative inline-block"
              onMouseEnter={() => handleCitationHover(uniqueCitationId)}
              onMouseLeave={() => handleCitationHover(null)}
            >
              <a
                href={searchResults[citationNumber].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>

              {hoveredCitation === uniqueCitationId && (
                <div 
                  className="citation-card absolute left-1/2 -translate-x-1/2 bottom-full mb-0.5 w-[280px] bg-white dark:bg-[#25262B] rounded-md shadow-xl z-50 p-1.5 text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-0.5 pl-1">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${searchResults[citationNumber].url}&sz=32`}
                        alt=""
                        className="w-4 h-4 flex-shrink-0"
                      />
                      <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
                        {getDomainFromUrl(searchResults[citationNumber].url)}
                      </span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white text-xs font-medium leading-none">
                      {searchResults[citationNumber].title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-tight line-clamp-2">
                      {searchResults[citationNumber].content}
                    </p>
                  </div>
                  <div className="absolute bottom-[-3px] left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-white dark:bg-[#25262B]"></div>
                </div>
              )}
            </span>
          );
        }
      }
      return part;
    });
  };

  useEffect(() => {
    sourceRefs.current = sourceRefs.current.slice(0, searchResults.length);
    citationRefs.current = citationRefs.current.slice(0, searchResults.length);
  }, [searchResults]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerMessage(getRandomMessage());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const shareOnTwitter = () => {
    if (!answer) return;

    // Get the first meaningful part of the answer
    const cleanAnswer = answer
      .replace(/\[\d+\]/g, '') // Remove citations
      .replace(/^\*.*\*\n*/g, '') // Remove asterisk lines
      .split('\n')[0] // Get first paragraph
      .trim();
    
    // Create suffix with full CA
    const suffix = "\n\n🚀 Read more on aideepshit.me\nCA: 0x420691A8c4C4d2068c5926cFE145F4A8";
    const maxLength = 280 - suffix.length;
    
    // Truncate the answer if needed
    const truncatedAnswer = cleanAnswer.length > maxLength 
      ? cleanAnswer.slice(0, maxLength - 3) + "..." 
      : cleanAnswer;
    
    const tweetText = truncatedAnswer + suffix;
    
    // Construct Twitter share URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Optional: auto-submit the form
    handleSearch(new Event('submit') as any);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-[#1A1B1E] dark:to-[#1A1B1E]">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-[#25262B] shadow-lg hover:shadow-xl transition-all z-50"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <IconSun className="w-5 h-5 text-yellow-500" />
        ) : (
          <IconMoon className="w-5 h-5 text-blue-500" />
        )}
      </button>

      {/* Announcement banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 px-4">
        <p className="text-sm animate-fade-in">
          {bannerMessage}
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Center Logo */}
        <div className="flex justify-center items-center mb-8">
          <div className="logo-container">
            <Image
              src="/logo.png"
              alt="DeepShit Logo"
              width={400}
              height={100}
              className="logo-hover mx-auto"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Token section */}
        <div className="max-w-xl mx-auto mb-16 p-6 bg-white/50 dark:bg-[#25262B]/50 rounded-xl backdrop-blur-sm shadow-lg border border-blue-100 dark:border-blue-900/20">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4361EE] to-[#7209B7] token-gradient">
              $DEEPSHIT Token
            </h3>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Contract Address (CA):
              </p>
              <div className="relative">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('37QCiMNvcFYZyzxfNyfeesZgouWJihFom5cn5Xpdpump');
                    const target = document.getElementById('copy-message');
                    if (target) {
                      target.classList.remove('opacity-0');
                      target.classList.add('opacity-100');
                      setTimeout(() => {
                        target.classList.remove('opacity-100');
                        target.classList.add('opacity-0');
                      }, 500);
                    }
                  }}
                  className="bg-white/50 dark:bg-[#25262B]/50 px-4 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 font-mono 
                    hover:bg-white/60 dark:hover:bg-[#25262B]/60 backdrop-blur-sm border border-transparent
                    hover:border-blue-100/50 dark:hover:border-blue-900/10 transition-colors duration-200"
                >
                  37QCiMNvcFYZyzxfNyfeesZgouWJihFom5cn5Xpdpump
                </button>
                <div 
                  id="copy-message"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 
                    bg-white/90 dark:bg-black/75 rounded text-[10px] text-black dark:text-white
                    opacity-0 transition-opacity duration-200 pointer-events-none"
                >
                  copied
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                👆 Buy the fucking dip, or don't. We don't give financial advice.
              </p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="max-w-xl mx-auto mb-8 flex items-center justify-center gap-4">
          <a 
            href="https://x.com/deepshits_ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-[#25262B]/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border border-blue-100 dark:border-blue-900/20"
          >
            <IconBrandX className="w-5 h-5 text-gray-900 dark:text-white" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">@deepshits_ai</span>
          </a>

          <a 
            href="https://pump.fun/coin/37QCiMNvcFYZyzxfNyfeesZgouWJihFom5cn5Xpdpump" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-[#25262B]/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border border-blue-100 dark:border-blue-900/20"
          >
            <img 
              src="/pumpfun-logo.png" 
              alt="PumpFun" 
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Trade on PumpFun</span>
          </a>
        </div>

        {/* Search box */}
        <div className="max-w-3xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Welcome to the asshole!"
              className="w-full px-6 py-4 pr-28 text-lg rounded-full bg-white dark:bg-[#25262B] border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-lg dark:shadow-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="ml-[-120px] h-12 w-[110px] px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-full hover:opacity-90 hover:translate-y-[-1px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="sr-only">Computing...</span>
                </>
              ) : (
                <>
                  <span>Ask</span>
                  <IconArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Suggestions */}
        <div className="max-w-3xl mx-auto -mt-8 mb-16 flex flex-wrap justify-center gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-sm px-4 py-2 rounded-full bg-white/50 dark:bg-[#25262B]/50 backdrop-blur-sm 
                shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 
                border border-blue-100 dark:border-blue-900/20 
                text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                flex items-center gap-2"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Action cards */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Start Now Card */}
          <div className="bg-white dark:bg-[#25262B] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start Now</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Free access to our unfiltered truth engine. Experience the intelligent savagery.
            </p>
          </div>

          {/* Get The App Card */}
          <div className="bg-white dark:bg-[#25262B] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get The App</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Chat on the go with our AI. Your free all-in-one roasting tool.
            </p>
          </div>
        </div>

        {/* Results area - persistent container */}
        <div className="max-w-3xl mx-auto" ref={answerRef}>
          {loading ? (
            <LoadingSkeleton />
          ) : answer ? (
            <div className="space-y-8">
              {/* Sources section first */}
              {searchResults.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <IconSourceCode className="w-5 h-5 text-gray-900 dark:text-gray-300" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300">Sources</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        ref={(el) => {
                          sourceRefs.current[index] = el;
                        }}
                        className="relative"
                        onMouseEnter={() => handleSourceHover(index)}
                        onMouseLeave={() => setHoveredSource(null)}
                      >
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white dark:bg-[#25262B] rounded-lg p-3 shadow-md hover:bg-gray-50 dark:hover:bg-[#2C2D32] transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${result.url}&sz=32`}
                              alt=""
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {getDomainFromUrl(result.url)}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 line-clamp-2">
                            {result.title}
                          </h3>
                        </a>

                        {hoveredSource === index && (
                          <div 
                            className={`absolute ${
                              tooltipPosition === 'top' 
                                ? 'bottom-full mb-2' 
                                : 'top-full mt-2'
                            } left-0 p-4 bg-white dark:bg-[#2C2D32] rounded-lg shadow-xl z-50 w-[300px]`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${result.url}&sz=32`}
                                alt=""
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {getDomainFromUrl(result.url)}
                              </span>
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              {result.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                              {result.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <IconSkull className="w-5 h-5 text-gray-900 dark:text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300">Answer</h2>
                </div>
                <div className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-[#25262B] rounded-xl p-8 shadow-lg">
                  <div className="whitespace-pre-line">{processAnswer(answer)}</div>
                  <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={shareOnTwitter}
                      disabled={sharing}
                      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors share-button"
                    >
                      {sharing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <IconBrandX className="w-4 h-4" />
                          Share This Pain
                        </>
                      )}
                    </button>
                    <button 
                      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500"
                      onClick={() => window.location.reload()}
                    >
                      <IconReload className="w-4 h-4" />
                      Try Again, Idiot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Tokenomics Section at bottom */}
        <div className="max-w-3xl mx-auto mt-32 space-y-8">
          {/* TP Initiative */}
          <div className="tokenomics-card bg-white/50 dark:bg-[#25262B]/50 rounded-xl p-6 backdrop-blur-sm shadow-lg border border-blue-100 dark:border-blue-900/20">
            <h2 className="text-xl font-bold mb-4 text-[#7C3AED]">
              The Great Toilet Paper Initiative 🧻
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li>• 1% of total supply dedicated to community toilet paper</li>
              <li>• Monthly TP airdrops to active holders</li>
              <li>• Special "Golden Roll" NFTs for top holders</li>
              <li>• Emergency TP fund for market dumps</li>
              <li>• Because every great dump deserves great paper</li>
            </ul>
          </div>

          {/* Tokenomics card */}
          <div className="tokenomics-card bg-white/50 dark:bg-[#25262B]/50 rounded-xl p-6 backdrop-blur-sm shadow-lg border border-blue-100 dark:border-blue-900/20">
            <h2 className="text-xl font-bold mb-4 text-[#7C3AED]">
              $DEEPSHIT Tokenomics 💩
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Pie Chart */}
              <div className="relative">
                <svg viewBox="0 0 100 100" className="w-full max-w-[250px] mx-auto transform transition-transform hover:scale-105">
                  {/* Public Launch - 80% */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent"
                    stroke="#4361EE"
                    strokeWidth="10"
                    strokeDasharray="251.2 314"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-300 hover:opacity-80"
                  />
                  {/* Marketing - 6% */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent"
                    stroke="#7209B7"
                    strokeWidth="10"
                    strokeDasharray="18.84 314"
                    strokeDashoffset="-251.2"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-300 hover:opacity-80"
                  />
                  {/* CEX Listings - 5% */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent"
                    stroke="#3B82F6"
                    strokeWidth="10"
                    strokeDasharray="15.7 314"
                    strokeDashoffset="-270.04"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-300 hover:opacity-80"
                  />
                  {/* Rest of allocations */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="transparent"
                    stroke="#8B5CF6"
                    strokeWidth="10"
                    strokeDasharray="28.26 314"
                    strokeDashoffset="-285.74"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-300 hover:opacity-80"
                  />
                  {/* Center text */}
                  <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-3xl font-bold fill-gray-800 dark:fill-gray-200">
                    1B
                  </text>
                </svg>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4361EE]"></div>
                    <span className="text-gray-600 dark:text-gray-400">Public (80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#7209B7]"></div>
                    <span className="text-gray-600 dark:text-gray-400">Marketing (6%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                    <span className="text-gray-600 dark:text-gray-400">CEX (5%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                    <span className="text-gray-600 dark:text-gray-400">Other (9%)</span>
                  </div>
                </div>
              </div>

              {/* Tokenomics Details */}
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Supply: <span className="font-mono">1,000,000,000</span> $DEEPSHIT
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Public Launch (80%)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fair launch on Pumpfun
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Team & Development (20%)</p>
                    <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                      <li>• 6% Marketing & Partnerships</li>
                      <li>• 5% CEX Listings & Liquidity</li>
                      <li>• 4% Development</li>
                      <li>• 2% Team</li>
                      <li>• 2% Community Rewards</li>
                      <li>• 1% Toilet Paper Fund</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="max-w-3xl mx-auto mt-32 space-y-8">
          <div className="tokenomics-card bg-white/50 dark:bg-[#25262B]/50 rounded-xl p-6 backdrop-blur-sm shadow-lg border border-blue-100 dark:border-blue-900/20">
            <h2 className="text-xl font-bold mb-6 text-[#7C3AED] flex items-center gap-2">
              <IconSkull className="w-6 h-6 animate-pulse" />
              Roadmap to World Domination 🌍
            </h2>
            
            <div className="space-y-8">
              {/* Phase 1 */}
              <div className="relative pl-8 pb-8 border-l-2 border-blue-500/20 last:border-0 roadmap-item">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-[#4361EE] to-[#7209B7] animate-pulse roadmap-dot"></div>
                <h3 className="text-lg font-semibold mb-2 gradient-text">Phase 1: The Birth of Brutality</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm roadmap-content">
                  <li>• AI with multiple personality disorders</li>
                  <li>• Voice commands (for when typing is too hard)</li>
                  <li>• Chrome extension to roast every website</li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="relative pl-8 pb-8 border-l-2 border-blue-500/20 last:border-0 roadmap-item">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-[#4361EE] to-[#7209B7] animate-pulse roadmap-dot"></div>
                <h3 className="text-lg font-semibold mb-2 gradient-text">Phase 2: Social Domination</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm roadmap-content">
                  <li>• Twitter bot for automated sass</li>
                  <li>• Telegram integration (because why not)</li>
                  <li>• Discord bot that actually works</li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="relative pl-8 pb-8 border-l-2 border-blue-500/20 last:border-0 roadmap-item">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-[#4361EE] to-[#7209B7] animate-pulse roadmap-dot"></div>
                <h3 className="text-lg font-semibold mb-2 gradient-text">Phase 3: Maximum Overkill</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm roadmap-content">
                  <li>• DeepShit DAO (Decentralized Asshole Organization)</li>
                  <li>• NFTs that actually make you laugh</li>
                  <li>• AI trading bot (probably loses money)</li>
                </ul>
              </div>

              {/* Phase 4 */}
              <div className="relative pl-8 border-l-2 border-blue-500/20 roadmap-item">
                <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-[#4361EE] to-[#7209B7] animate-pulse roadmap-dot"></div>
                <h3 className="text-lg font-semibold mb-2 gradient-text">Phase 4: Global Takeover</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm roadmap-content">
                  <li>• Custom AI models (even more savage)</li>
                  <li>• Metaverse integration (touch grass edition)</li>
                  <li>• World domination (just kidding... unless? 👀)</li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 italic">
              * This roadmap is about as reliable as your ex's promises. DYOR and don't cry if we change our minds.
            </p>
          </div>
        </div>
      </div>

      {/* Audio element */}
      <audio id="searchSound" ref={audioRef} src="/deepshit.mp3" preload="auto" />
    </main>
  );
}
