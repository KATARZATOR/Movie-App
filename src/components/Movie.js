import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';

function Movie() {
  const [movieList, setMovieList] = useState([]);

  const getMovie = () => {
    fetch(
      'https://api.themoviedb.org/3/search/movie?api_key=6c0fbfc07c74065955ed3b298921931b&query=return'
    )
      .then((res) => res.json())
      .then((json) => setMovieList(json.results))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getMovie();
  }, []);

  console.log(movieList);

  return (
    <div>
      {movieList.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

export default Movie;
