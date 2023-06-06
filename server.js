const dotenv = require('dotenv');
const express = require('express'); //Line 1
const app = express(); //Line 2
const port = process.env.PORT || 5150; //Line 3
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())

dotenv.config()

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

// create a GET route
app.get('/get-artist', (req, res) => { //Line 9
    const apiUrl = `https://api.setlist.fm/rest/1.0/artist/b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d`
    const options = {
        headers: {
        'x-api-key': 'K9NST_x7oePpsrr_Wqx0ggZWupxPUZPRxFxI',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }
    }

    axios.get(apiUrl, options).then(response => {
        // res.send(JSON.stringify(response.data))
        res.send({hi: 'james'})
    })
   
}); 

app.post('/get-setlist/', async (req, res) => {
    console.log("GETTING SETLIST", req.body)
    const apiUrl = `https://api.setlist.fm/rest/1.0/search/setlists?artistName=${req.body.artist}&date=${req.body.date}`;
    const options = {
        headers: {
        'x-api-key': 'K9NST_x7oePpsrr_Wqx0ggZWupxPUZPRxFxI',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }
    }

    
    await axios.get(apiUrl, options).then(response => {
        console.log("GOT DATA?", response.data)
        const songs = response.data.setlist[0].sets.set.map(segment => {
            return segment.song.map(song => song)
        }).flat();
        
        const returnVal = {
            concertInfo: {
                artistName: response.data.setlist[0].artist.name,
                artistId: response.data.setlist[0].artist.mbid,
                date: response.data.setlist[0].eventDate,
                venue: response.data.setlist[0].venue.name
            },
            setlist: songs
            
        }   
        res.status(200).json(returnVal)
    })
})

app.post('/create-playlist', async (req, res) => {
    const {artist, date, venue} = req.body.concertData.concertInfo;
    const createdPlaylist = await axios({
        method: 'post',
        url: `https://api.spotify.com/v1/users/${process.env.REACT_APP_USER_ID}/playlists`,
        headers: {'Authorization': `Bearer ${req.body.token}`},
        data: {
            'name': `${artist}-${venue}-${date}`,
            'description': "Testing",
            "public": true
        }
    });

    const createdPlaylistId = createdPlaylist.data.id;
    const setListSongs = req.body.concertData.setlist;

    const setListSongsId = await Promise.allSettled(setListSongs.map(async (song, idx) => {
        const songToParse = await axios({
            method: 'get',
            headers: {'Authorization': `Bearer ${req.body.token}`},
            url: `https://api.spotify.com/v1/search?q=${song.name}&artist=${req.body.concertData.concertInfo.artist}&type=track&limit=50`,
        })

        let id = ''
        songToParse.data.tracks.items.forEach((item, idx) => {
            item.album.artists.forEach(artist => {
                if (req.body.concertData.concertInfo.artist.toUpperCase().includes(artist.name.toUpperCase()) ) {
                    id = `spotify:track:${songToParse.data.tracks.items[idx].id}`
                }
            })
        })

        return id;
        
    })).catch(err => res.send(err));

    const uriArr = setListSongsId.filter(songId => {
        return songId ? `${songId.value}` : null
    })
    const uriStr = uriArr.map(item => {
        return `${item.value}`
    })

    await axios({
        method: 'post',
        headers: {'Authorization': `Bearer ${req.body.token}`},
        url: `https://api.spotify.com/v1/playlists/${createdPlaylistId}/tracks`,
        data: {
            uris: [...uriStr]
        }
    })
    res.status(200).json({playlistLink: `open.spotify.com/playlist/${createdPlaylistId}`})
})

app.post('/get-spotify', async (req, res) => {
    const {code} = req
    const redirect_uri = 'http://localhost:3000';

    const spotifyApi = new SpotifyWebApi({
        redirectUri: redirect_uri,
        clientId: process.env.REACT_APP_CLIENT_ID,
        clientSecret: process.env.REACT_APP_CLIENT_SECRET
    })
    try {
        const {
            body: { access_token, refresh_token, expires_in },
          } = await spotifyApi.authorizationCodeGrant(code)
      
          res.json({ access_token, refresh_token, expires_in })
    } catch(err) {
        res.sendStatus(400)
    }
    res.sendStatus(200)
})