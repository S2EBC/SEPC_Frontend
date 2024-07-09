//health.js
import React, { useState } from 'react';
import Start from './start';
import '../styles/health.css';

const Health = () => {
    const [showStart, setShowStart] = useState(false);

    const handleNextClick = () => {
        setShowStart(true);
    }

    return (
        <div className="health-container">
            {showStart ? (
                <Start onLoadComplete={() => console.log('Load Complete')} />
            ) : (
                <div className="input-container">
                    <h1>당신의 몸무게를 알려주세요!</h1>
                    <input type="text" placeholder="정보를 입력해주세요!" />
                    <button onClick={handleNextClick}>다음으로</button>
                </div>
            )}
        </div>
    );
}

export default Health;
