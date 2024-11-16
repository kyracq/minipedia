import React, { useState, useEffect, useCallback } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { CiLight, CiDark } from "react-icons/ci";

type Result = {
  pageid: string;
  title: string;
  snippet: string;
};

type SearchInfo = {
  totalhits?: number;
};

function App() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [searchInfo, setSearchInfo] = useState<SearchInfo>({});
  const [theme, setTheme] = useState("");

  const fetchResults = useCallback(async (newSearch: boolean) => {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${search}&sroffset=${newSearch ? 0 : offset}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const json = await response.json();
    if (newSearch) {
      setResults(json.query.search);
    } else {
      setResults([...results, ...json.query.search]);
      setSearchInfo(json.query.searchinfo);
    }
    if (json.continue) {
      setOffset(json.continue.sroffset);
    }
  }, [search, results, offset]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.matches) {
      setTheme("dark");
    }

    // This callback will fire if the perferred color scheme changes without a reload
    mq.addEventListener("change", (evt) =>
      evt.matches ? setTheme("dark") : setTheme("light")
    );

    const handleScroll = async () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight
      )
        return;
      await fetchResults(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchResults]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search === "") return;
    fetchResults(true);
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
  };

  return (
    <div className="page-wrapper" data-theme={theme}>
      <div className="header-wrapper">
        <div className="spacing"></div>
        <button className="theme-button" onClick={toggleTheme}>
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
        </div>
      </div>
      <div className="byline">by kyra acquah</div>
    </div>
  );
}

export default App;
