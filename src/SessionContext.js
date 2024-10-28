import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SessionContext = createContext();

function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const apiKey = '6c0fbfc07c74065955ed3b298921931b';

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${apiKey}`
    )
      .then((res) => res.json())
      .then((json) => {
        setSessionId(json.guest_session_id);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <SessionContext.Provider value={sessionId}>
      {children}
    </SessionContext.Provider>
  );
}

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SessionContext, SessionProvider };
