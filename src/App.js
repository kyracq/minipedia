import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { CiLight, CiDark } from "react-icons/ci";

function App() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchInfo, setSearchInfo] = useState({});
  const [theme, setTheme] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (search === "") return;

    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${search}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const json = await response.json();
    setResults(json.query.search);
    setSearchInfo(json.query.searchinfo);
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
