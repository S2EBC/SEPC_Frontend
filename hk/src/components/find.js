//find.js
import React from 'react';
import '../styles/find.css';

const Find = ({ onNextClick }) => {
    return (
        <div className="find-container">
            <div className="input-container">
                <h1>당신의 키를 알려주세요!</h1>
                <input type="text" placeholder="정보를 입력해주세요!" />
                <button onClick={onNextClick}>다음으로</button>
            </div>
        </div>
    );
}

export default Find;
