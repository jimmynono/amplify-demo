import React, { useState } from 'react'

export default function SetListForm({ handleFormSubmit, hasSetList, handleMakePlaylist }) {
    const [artistVal, setArtistVal] = useState('');
    const [dateVal, setDateVal] = useState('');

    const handleArtistChange = e => {
        e.preventDefault()
        setArtistVal(e.target.value)
    }

    const handleDateChange = e => {
        e.preventDefault()
        setDateVal(e.target.value)
    }

    return (
        <form className='setlist-form'>
            <label htmlFor="artist">Artist</label>
            <input type="text" id='artist' value={artistVal} onChange={e => handleArtistChange(e)} />
            <label htmlFor="date">Date</label>
            <input type="date" id="date" value={dateVal} onChange={e => handleDateChange(e)} />
            <button type="submit" onClick={() => handleFormSubmit(artistVal, dateVal)}>Get SetList</button>
            <button type="submit" disabled={!hasSetList} onClick={handleMakePlaylist}>Make Playlist</button>
        </form>
    )
}
