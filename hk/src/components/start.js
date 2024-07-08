import React, { useState, useEffect } from 'react';
import '../styles/start.css';

const Start = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000); // Simulate a 5-second loading time

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="start-container">
            {loading ? (
                <>
                    <h1>측정을 시작합니다.</h1>
                    <p>움직이지 말아주세요.</p>
                </>
            ) : (
                <h1>측정이 완료되었습니다.</h1>
                
            )}
        </div>
    );
}

export default Start;
