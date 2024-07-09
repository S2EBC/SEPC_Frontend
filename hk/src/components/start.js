import React, { useState, useEffect, useRef } from 'react';
import * as tmPose from '@teachablemachine/pose';
import '@tensorflow/tfjs';
import '../styles/start.css';

const Start = () => {
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState("");
    const [showCamera, setShowCamera] = useState(false);
    const [sensorData, setSensorData] = useState([]);
    const canvasRef = useRef(null);
    const labelContainerRef = useRef(null);
    const webcamRef = useRef(null);
    const URL = "./model/";
    let model, ctx, labelContainer, maxPredictions;

    useEffect(() => {
        const init = async () => {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            model = await tmPose.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            const flip = true;
            const webcam = new tmPose.Webcam(600, 400, flip);
            webcamRef.current = webcam;
            await webcam.setup();
            await webcam.play();
            setShowCamera(true);

            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = 600;
                canvas.height = 400;
                ctx = canvas.getContext("2d");
            }

            labelContainer = labelContainerRef.current;
            if (labelContainer) {
                for (let i = 0; i < maxPredictions; i++) {
                    labelContainer.appendChild(document.createElement("div"));
                }
            }

            window.requestAnimationFrame(loop);
        };

        init();

        const timer = setTimeout(() => {
            setLoading(false);
        }, 10000); // 10초간의 로딩 시뮬레이션

        return () => {
            // 컴포넌트 언마운트 시 리소스 정리
            if (webcamRef.current) {
                webcamRef.current.stop();
                webcamRef.current = null; // 웹캠 참조 초기화
            }
        };
    }, []);

    useEffect(() => {
        // 로딩이 완료된 후 센서 데이터 가져오기
        if (!loading) {
            fetchSensorData();
        }
    }, [loading]);

    async function fetchSensorData() {
        try {
            const response = await fetch('http://localhost:5000/get-all-data');
            if (!response.ok) {
                throw new Error('서버에서 센서 데이터를 가져오지 못했습니다.');
            }
            const data = await response.json();
            setSensorData([data]); // Ensure to set an array with data
        } catch (error) {
            console.error('센서 데이터 가져오기 오류:', error);
            setSensorData([]); // Set empty array or handle error state
        }
    }

    async function loop(timestamp) {
        if (webcamRef.current) {
            webcamRef.current.update();
            await predict();
            window.requestAnimationFrame(loop);
        }
    }

    async function predict() {
        if (!webcamRef.current || !labelContainerRef.current) return;

        const { pose, posenetOutput } = await model.estimatePose(webcamRef.current.canvas);
        const prediction = await model.predict(posenetOutput);

        let outputValue = "";

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            if (labelContainerRef.current.childNodes[i]) {
                labelContainerRef.current.childNodes[i].innerHTML = classPrediction;
            }

            if (prediction[i].className === "1" && prediction[i].probability.toFixed(2) === "1.00") {
                outputValue = "거북이";
            } else if (prediction[i].className === "0" && prediction[i].probability.toFixed(2) === "1.00") {
                outputValue = "거북이아님";
            }
        }

        setOutput("출력: " + outputValue);
        drawPose(pose);

        // 조건이 충족되면 Flask 서버로 데이터 전송
        if (outputValue === "거북이" || outputValue === "거북이아님") {
            sendDataToServer(outputValue);
        }
    }

    function sendDataToServer(outputValue) {
        fetch('http://localhost:5000/send-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ output: outputValue }),
        })
            .then(response => response.json())
            .then(data => console.log('데이터 서버로 전송:', data))
            .catch(error => console.error('데이터 전송 오류:', error));
    }

    function drawPose(pose) {
        if (webcamRef.current && ctx) {
            ctx.drawImage(webcamRef.current.canvas, 0, 0);
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }

    return (
        <div className="start-container">
            {loading ? (
                <>
                    <h1>측정을 시작합니다.</h1>
                    <p>움직이지 말아주세요.</p>
                </>
            ) : (
                <>
                    <h1>측정이 완료되었습니다.</h1>
                    <div style={{ display: showCamera ? 'block' : 'none' }}>
                        <canvas ref={canvasRef} id="canvas"></canvas>
                        <div ref={labelContainerRef} id="label-container"></div>
                    </div>
                    <div id="output">{output}</div>
                    <div>
                        <h2>센서 데이터</h2>
                        <ul>
                            {sensorData.map((item, index) => (
                                <li key={index}>
                                    {"Pulse: " + item.pulse.toString() + ", EMG: " + item.emg.toString() + ", MLX: " + item.mlx.toString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

export default Start;
