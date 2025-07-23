import React, { useEffect, useState } from "react";
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchterm, setsearchterm] = useState("");
  const [debouncedsearchterm, setdebouncedsearchterm] = useState("");

  const [errormessage, seterrormessage] = useState("");
  const [movielist, setmovielist] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [trendingMovies, settrendinmovies] = useState([]);

  // ✅ Manual Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setdebouncedsearchterm(searchterm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchterm]);

  const fetchMovies = async (query = "") => {
    try {
      setisloading(true);
      seterrormessage("");

      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("failed to fetch movies");
      }

      const data = await response.json();

      if (data.response === "False") {
        seterrormessage(data.Error || "Failed to fetch movies");
        setmovielist([]);
        return;
      }

      setmovielist(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      seterrormessage("Error fetching movies. Please try again later.");
    } finally {
      setisloading(false);
    }
  };

  const loadtrendingmovies = async () => {
    try {
      const movies = await getTrendingMovies();
      settrendinmovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  // 🔁 Refetch when debounced search changes
  useEffect(() => {
    fetchMovies(debouncedsearchterm.trim());
  }, [debouncedsearchterm]);

  useEffect(() => {
    loadtrendingmovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/img/hero.png" alt="hero banner?" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchterm={searchterm} setsearchterm={setsearchterm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isloading ? (
            <Spinner />
          ) : errormessage ? (
            <p className="text-red-500">{errormessage}</p>
          ) : (
            <ul>
              {movielist.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
