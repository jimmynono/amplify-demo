import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPeace } from '@fortawesome/free-regular-svg-icons';

export default function Loader() {
    return (
        <div>

            <FontAwesomeIcon icon={faHandPeace} rotate={45} size='lg' beat />
        </div>
    )
}
