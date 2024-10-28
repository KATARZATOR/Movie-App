import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Alert, Input, Pagination, Spin, Tabs } from 'antd';
import { debounce } from 'lodash';
import MovieCard from './MovieCard';
import { SessionContext } from '../SessionContext';

const { TabPane } = Tabs;

function MoviesList() {
  const [movieList, setMovieList] = useState([]);
  const [ratedMovies, setRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRated, setLoadingRated] = useState(false);
  const [error, setError] = useState(null);
  const [ratedError, setRatedError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRatedPage, setCurrentRatedPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalRatedResults, setTotalRatedResults] = useState(0);
  const [activeTab, setActiveTab] = useState('1');
  const [ratedMovieRatings, setRatedMovieRatings] = useState({});

  const apiKey = '6c0fbfc07c74065955ed3b298921931b';
  const sessionId = useContext(SessionContext);

  const getMovies = (query, page) => {
    setLoading(true);
    let url = '';

    if (query && query.trim() !== '') {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&page=${page}`;
    } else {
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке данных');
        }
        return res.json();
      })
      .then((json) => {
        setMovieList(json.results);
        setTotalResults(json.total_results);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
        setLoading(false);
      });
  };

  const getRatedMovies = (page) => {
    if (!sessionId) return;
    setLoadingRated(true);
    fetch(
      `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=${apiKey}&language=en-US&sort_by=created_at.asc&page=${page}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке данных');
        }
        return res.json();
      })
      .then((json) => {
        setRatedMovies(json.results);
        setTotalRatedResults(json.total_results);
        setLoadingRated(false);

        const ratingsMap = {};
        json.results.forEach((movie) => {
          ratingsMap[movie.id] = movie.rating;
        });
        setRatedMovieRatings(ratingsMap);
      })
      .catch((err) => {
        console.log(err);
        setRatedError(err.message);
        setLoadingRated(false);
      });
  };

  const debouncedSearch = debounce((value) => {
    setCurrentPage(1);
    getMovies(value, 1);
  }, 500);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getMovies(searchQuery, page);
  };

  const handleRatedPageChange = (page) => {
    setCurrentRatedPage(page);
    getRatedMovies(page);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === '2') {
      getRatedMovies(currentRatedPage);
    }
  };

  useEffect(() => {
    getMovies(searchQuery, currentPage);
  }, []);

  useEffect(() => {
    if (sessionId && activeTab === '2') {
      getRatedMovies(currentRatedPage);
    }
  }, [sessionId, activeTab]);

  const movieRows = [];
  for (let i = 0; i < movieList.length; i += 2) {
    movieRows.push(movieList.slice(i, i + 2));
  }

  const ratedMovieRows = [];
  for (let i = 0; i < ratedMovies.length; i += 2) {
    ratedMovieRows.push(ratedMovies.slice(i, i + 2));
  }

  return (
    <div className="main-list">
      <Tabs defaultActiveKey="1" onChange={handleTabChange}>
        <TabPane tab="Search" key="1">
          <Input
            placeholder="Type to search..."
            value={searchQuery}
            onChange={handleInputChange}
            style={{
              marginBottom: '20px',
              height: '40px',
              width: '956px',
            }}
          />
          {error && (
            <Alert
              message="Ошибка"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Spin size="large" />
            </div>
          ) : movieList.length === 0 ? (
            <div>Ничего не найдено</div>
          ) : (
            <>
              {movieRows.map((row, rowIndex) => (
                <Row key={rowIndex} className="ant-row">
                  {row.map((movie) => (
                    <Col key={movie.id} span={12}>
                      <MovieCard
                        movie={movie}
                        userRating={ratedMovieRatings[movie.id]}
                      />
                    </Col>
                  ))}
                </Row>
              ))}
              <Pagination
                current={currentPage}
                total={totalResults}
                pageSize={20}
                onChange={handlePageChange}
                style={{ marginTop: '20px', textAlign: 'center' }}
              />
            </>
          )}
        </TabPane>
        <TabPane tab="Rated" key="2">
          {ratedError && (
            <Alert
              message="Ошибка"
              description={ratedError}
              type="error"
              showIcon
              closable
              onClose={() => setRatedError(null)}
            />
          )}
          {loadingRated ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Spin size="large" />
            </div>
          ) : ratedMovies.length === 0 ? (
            <div>Вы еще не оценили ни одного фильма</div>
          ) : (
            <>
              {ratedMovieRows.map((row, rowIndex) => (
                <Row key={rowIndex} className="ant-row">
                  {row.map((movie) => (
                    <Col key={movie.id} span={12}>
                      <MovieCard movie={movie} userRating={movie.rating} />
                    </Col>
                  ))}
                </Row>
              ))}
              <Pagination
                current={currentRatedPage}
                total={totalRatedResults}
                pageSize={20}
                onChange={handleRatedPageChange}
                style={{ marginTop: '20px', textAlign: 'center' }}
              />
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}

export default MoviesList;
