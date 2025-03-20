import React, { useState, useEffect, useCallback } from "react";
import { FaMagnifyingGlass, FaArrowUp } from "react-icons/fa6";
import { CiLight, CiDark } from "react-icons/ci";

type Result = {
  pageid: string;
  title: string;
  snippet: string;
};

type SearchInfo = {
  totalhits?: number;
};

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

function App() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [searchInfo, setSearchInfo] = useState<SearchInfo>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const fetchResults = useCallback(
    async (newSearch: boolean) => {
      setIsLoading(true);
      try {
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${search}&sroffset=${
          newSearch ? 0 : offset
        }`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw Error(response.statusText);
        }
        const json = await response.json();
        if (newSearch) {
          setResults(json.query.search);
          setOffset(json.continue?.sroffset || 0);
        } else {
          setResults((prevResults) => {
            const existingIds = new Set(prevResults.map((item) => item.pageid));
            const newResults = json.query.search.filter(
              (item: Result) => !existingIds.has(item.pageid)
            );
            return [...prevResults, ...newResults];
          });
        }
        setSearchInfo(json.query.searchinfo);
        if (json.continue) {
          setOffset(json.continue.sroffset);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [search, offset]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.matches) {
      setTheme("dark");
    }

    const handleMediaChange = (evt: MediaQueryListEvent) => {
      evt.matches ? setTheme("dark") : setTheme("light");
    };

    mq.addEventListener("change", handleMediaChange);
    return () => {
      mq.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = debounce(async () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (!isLoading && results.length > 0) {
          await fetchResults(false);
        }
      }
    }, 300);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchResults, isLoading, results.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search === "") return;
    fetchResults(true);
    setSearchSubmitted(true);
  };

  const toggleTheme = () => {
    switch (theme) {
      case "dark":
        setTheme("light");
        break;
      default:
        setTheme("dark");
    }
  };

  const clearResults = () => {
    setResults([]);
    setSearchInfo({});
    setSearch("");
    setSearchSubmitted(false);
  };

  return (
    <div className="page-wrapper" data-theme={theme}>
      <div className="header-wrapper">
        <div className="spacing"></div>
        <button
          className="theme-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <CiLight /> : <CiDark />}
        </button>
      </div>

      <div className="page-content">
        <header>
          <h1>
            <button onClick={clearResults}>minipedia</button>
          </h1>
          <form className="search-box" onSubmit={handleSearch}>
            <FaMagnifyingGlass />
            <input
              type="search"
              placeholder="Search Wikipedia"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          {searchInfo.totalhits ? (
            <p className="results-count">
              Search Results: {searchInfo.totalhits}
            </p>
          ) : (
            ""
          )}
        </header>
        <div className="results">
          {results.map((result, i) => {
            const url = `https://en.wikipedia.org/?curid=${result.pageid}`;
            return (
              <div className="result" key={i}>
                <div className="result-title">{result.title}</div>
                <p
                  dangerouslySetInnerHTML={{ __html: result.snippet + `...` }}
                ></p>
                <span className="read-more">
                  <a href={url} target="_blank" rel="noreferrer">
                    Read more
                  </a>
                </span>
              </div>
            );
          })}
          <div className="status-text">
            {isLoading && <div>Loading...</div>}
            {!isLoading && results.length === 0 && searchSubmitted && (
              <div>No results found.</div>
            )}
            {error && <div>{error}</div>}
          </div>
        </div>
        {showBackToTop && (
          <button
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <FaArrowUp />
          </button>
        )}
      </div>
      <div className="byline">by kyra acquah</div>
    </div>
  );
}

export default App;
