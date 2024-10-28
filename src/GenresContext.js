import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const GenresContext = createContext();

function GenresProvider({ children }) {
  const [genres, setGenres] = useState([]);
  const apiKey = '6c0fbfc07c74065955ed3b298921931b';

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`
    )
      .then((res) => res.json())
      .then((json) => setGenres(json.genres))
      .catch((err) => console.log(err));
  }, []);

  return (
    <GenresContext.Provider value={genres}>{children}</GenresContext.Provider>
  );
}

GenresProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { GenresContext, GenresProvider };
