const dotenv = require('dotenv');
const express = require('express'); //Line 1
const app = express(); //Line 2
const port = process.env.PORT || 5150; //Line 3
const http = require('https');
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
        console.log("axios, ",response.data);
        // res.send(JSON.stringify(response.data))
        res.send({hi: 'james'})
    })
   
}); 

app.post('/create-playlist', async (req, res) => {
    axios({
        method: 'post',
        url: `https://api.spotify.com/v1/users/${process.env.REACT_APP_USER_ID}/playlists`,
        headers: {'Authorization': `Bearer ${req.body.token}`},
        data: {
            'name': 'hi there james norton',
            'description': "Testing",
            "public": true
        }
    })
})

app.post('/get-spotify', async (req, res) => {
    // debugger;
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
        console.err(err)
        res.sendStatus(400)
    }
    res.sendStatus(200)
})