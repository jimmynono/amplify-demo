import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [lightOn, setLightOn] = useState(false)
  const [token, setToken] = useState("");
  
  useEffect(() => {
    if (!lightOn) {
      setLightOn(!lightOn);
    }
    
  },[lightOn])

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token')

    if (!token && hash) {
      const tokenToUse = hash.substring(1).split("#").find(elem => elem.startsWith("access_token")).split("=")[1].split('&token_type')[0];

      window.localStorage.setItem('token', tokenToUse);
      setToken(tokenToUse)

    } else if (token) {
      setToken(token)
    }
  }, [])
  const AUTHORIZE = "https://accounts.spotify.com/authorize";
  const redirect_uri = 'http://localhost:3000';

  let url = AUTHORIZE;
  url += "?client_id=" + process.env.REACT_APP_CLIENT_ID;
  url += "&response_type=token";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-public";

  const handleSpotify = () => {
    const payload = {
      'token': token
    }

    axios.post('/create-playlist', payload).then(res => console.log(res.data))
  }

  const handleLogout = () => {
    window.localStorage.setItem('token', '')
    setToken('')
    window.location = redirect_uri;
  }


  return (
    <div className="App">
      <h1>SpotifyMySetlist</h1>
      <div className={`power-light ${lightOn ? 'power-on' : ''}`}></div>
      {token ? <button onClick={handleLogout}>
        Logout of Spotify
      </button> : <button><a href={url}>Login to Spotify </a> </button>}

      <button onClick={handleSpotify}>
        Get Artist Data
      </button>
    </div>
  );
}

export default App;
