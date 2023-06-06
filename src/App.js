import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SetListForm from './components/SetListForm';
import Loader from './components/Loader';

function App() {
  const redirect_uri = 'http://localhost:3000';
  const [loggedIn, setLoggedIn] = useState(false)
  const [token, setToken] = useState("");
  const [setList, setSetList] = useState([]);
  const [artistInfo, setArtistInfo] = useState({})
  const [loading, toggleLoading] = useState(false)
  const [showSpotifyLinkButton, toggleShowSpotifyLinkButton] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [showAnimation, toggleShowAnimation] = useState(false)
    
  useEffect(() => {
    if (!loggedIn && token) {
      setLoggedIn(!loggedIn);

      setInterval(() => {
        toggleShowAnimation(true)
      }, 3000);
    }
    
  },[loggedIn, token])

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


  const handleGetSetlist = (artist, date) => {
    setSetList([])
    toggleLoading(true)
    const dateArr = date.split('-');
    const setListFormatDate = `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;
    const payload = {
      artist: artist,
      date: setListFormatDate
    }
    
    
    axios.post('/get-setlist/', payload).then(concertData => {      
      setSetList([...concertData.data.setlist])
      setArtistInfo({
        artist: concertData.data.concertInfo.artistName,
        date: concertData.data.concertInfo.date,
        venue: concertData.data.concertInfo.venue
      })
      toggleShowSpotifyLinkButton(false)
        toggleLoading(false)
      }).catch(err => {
        toggleLoading(false)
        alert('Concert does not exist');
      })
    
  }
  
  const handleMakePlaylist = async e => {
    e.preventDefault()
    toggleLoading(true)
    const dataToSubmit = {
      setlist: [...setList],
      concertInfo: {   
      ...artistInfo}
    }

    try {
      const playlistCreated = await axios.post('/create-playlist', {'token': token, 'concertData': dataToSubmit})
      setSpotifyUrl(`http://${playlistCreated.data.playlistLink}`)
      toggleShowSpotifyLinkButton(true)
      
      alert('Playlist created')
    } catch (err) {
      alert('You are logged out of spotify')
    }

    toggleLoading(false)
  }

  const handleLogout = () => {
    window.localStorage.setItem('token', '')
    setToken('')
    window.location.href = redirect_uri;
  }
  
  const handleLogInClick = (e) => {
    if (token) {
      handleLogout()
    } else {
      let url = "https://accounts.spotify.com/authorize";
      url += "?client_id=" + process.env.REACT_APP_CLIENT_ID;
      url += "&response_type=token";
      url += "&redirect_uri=" + encodeURI(redirect_uri);
      url += "&show_dialog=true";
      url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private";
    
      window.location.href = url
    }
  }

  const handleOpenSpotifyLink = () => {
    window.open(spotifyUrl, '_blank')
  }

  return (
    <div className="App">
      <div className='head'>
        <div className='head-container'>

      <h1>SpotifyMySetlist</h1>
      <div className='control-panel'>
          {loggedIn && <SetListForm handleFormSubmit={(artist, date) => handleGetSetlist(artist, date)} hasSetList={setList.length} handleMakePlaylist={handleMakePlaylist} showSpotifyLinkButton={showSpotifyLinkButton} handleOpenSpotifyLink={handleOpenSpotifyLink}/>}
        <div className='control-button-container'>
          <p className='control-button-values'><span>NO</span><span >YES</span></p>
          <button className={`control-button ${loggedIn ? 'logged-in' : 'logged-out'}`} onClick={handleLogInClick}>|</button>
          <p>LOGGED IN</p>
        </div>
        <div className={`power-light ${loggedIn ? 'power-on' : ''}`}></div>
      </div>
    </div>
    </div>
 
   <div className='cabinet'>
      <h2>Setlist</h2>
      <div className={`cabinet-container ${showAnimation ? 'animate-speaker' : ''}`}>
      {loading && <Loader />}
      {setList.length ?
        <div>
        <h4>{artistInfo.artist} at {artistInfo.venue} - {artistInfo.date}</h4>
        <ul>
          {setList.map(song => {
            return <li key={song.name}>{song.name}</li>
          })}
        </ul>
        </div> : null
      }
      </div>
          </div>
        </div>
  );
}

export default App;
