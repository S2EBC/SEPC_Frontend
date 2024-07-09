//scanf.js
import React, { useState } from 'react';
import Find from './find'; // Import the Find component
import Health from './health'; // Import the Health component
import '../styles/scanf.css'; 

const Scanf = () => {
    const [showFind, setShowFind] = useState(false);
    const [showHealth, setShowHealth] = useState(false);

    const handleStartClick = () => {
        setShowFind(true);
    }

    const handleNextClick = () => {
        setShowFind(false);
        setShowHealth(true);
    }

    return (
        <div className="container">
            {showHealth ? (
                <Health />
            ) : showFind ? (
                <Find onNextClick={handleNextClick} />
            ) : (
                <>
                    <h1>BSSM 키오스크에 오신 것을 <br />환영합니다.</h1>
                    <button onClick={handleStartClick}>시작하기</button>
                </>
            )}
        </div>
    );
}

export default Scanf;
