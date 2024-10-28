import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Rate } from 'antd';
import PropTypes from 'prop-types';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import './MovieCard.css';
import { parseISO, format } from 'date-fns';
import { GenresContext } from '../GenresContext';
import { SessionContext } from '../SessionContext';

const LoadingComponent = () => {
  const LoadingIcon = <LoadingOutlined spin style={{ fontSize: 50 }} />;
  return <Spin indicator={LoadingIcon} size="large" className="loading-icon" />;
};

function textCut(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  let truncated = text.substr(0, maxLength);
  let lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    truncated = truncated.substr(0, lastSpaceIndex);
  }
  return truncated + '...';
}

function getRatingColor(rating) {
  if (rating >= 0 && rating <= 3) return '#E90000';
  if (rating > 3 && rating <= 5) return '#E97E00';
  if (rating > 5 && rating <= 7) return '#E9D100';
  if (rating > 7) return '#66E900';
  return '#E90000';
}

function MovieCard({ movie, userRating }) {
  const [loading, setLoading] = useState(true);
  const genres = useContext(GenresContext);
  const sessionId = useContext(SessionContext);
  const apiKey = '6c0fbfc07c74065955ed3b298921931b';
  const [rating, setRating] = useState(userRating || 0);

  useEffect(() => {
    setLoading(false);
  }, []);

  const movieGenres = movie.genre_ids
    ? movie.genre_ids
        .map((id) => {
          const genre = genres.find((g) => g.id === id);
          return genre ? genre.name : null;
        })
        .filter((name) => name !== null)
    : [];

  const handleRateChange = (value) => {
    setRating(value);
    submitRating(value);
  };

  const submitRating = (value) => {
    if (!sessionId) return;
    fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}/rating?api_key=${apiKey}&guest_session_id=${sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ value: value * 2 }),
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при отправке рейтинга');
        }
        return res.json();
      })
      .then((json) => {
        console.log('Рейтинг отправлен', json);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const ratingColor = getRatingColor(movie.vote_average);

  if (loading) {
    return (
      <Card className="card-style">
        <LoadingComponent />
      </Card>
    );
  }
  return (
    <Card className="card-style">
      <Row>
        <Col style={{ width: 183 }}>
          <img
            alt={movie.title || 'Нет названия'}
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlRK_z-gq1V0MzsdR3vlrR13hH-ns01Ke8aA&s'
            }
            className="movie-image"
          />
        </Col>

        <Col
          style={{ width: 'calc(100% - 183px)', paddingLeft: '20px' }}
          className="card-text"
        >
          <div className="title-rating-container">
            <h3>{movie.title || 'Нет названия'}</h3>
            <div
              className="rating-circle"
              style={{
                borderColor: ratingColor,
                color: 'black',
              }}
            >
              {movie.vote_average.toFixed(1)}
            </div>
          </div>
          <div className="genre-date">
            {movie.release_date
              ? format(parseISO(movie.release_date), 'LLLL d, yyyy')
              : 'Дата не указана'}
          </div>
          <div className="card-genre-list">
            {movieGenres.map((genre) => (
              <div key={genre} className="card-genre">
                {genre}
              </div>
            ))}
          </div>
          <p className="p-style">
            {textCut(movie.overview || 'Описание недоступно', 120)}
          </p>
          <Rate
            count={10}
            value={rating}
            onChange={handleRateChange}
            allowHalf
            style={{ fontSize: 16 }}
          />
        </Col>
      </Row>
    </Card>
  );
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    genre_ids: PropTypes.arrayOf(PropTypes.number),
    vote_average: PropTypes.number,
    title: PropTypes.string,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    overview: PropTypes.string,
  }).isRequired,
  userRating: PropTypes.number,
};

export default MovieCard;
