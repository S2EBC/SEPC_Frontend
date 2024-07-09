//start.js
import React, { useState, useEffect, useRef } from 'react';
import * as tmPose from '@teachablemachine/pose';
import '@tensorflow/tfjs';
import '../styles/start.css';

const Start = () => {
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState("");
    const [showCamera, setShowCamera] = useState(false);
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
        }, 10000); // Simulate a 10-second loading time

        return () => {
            // Clean up resources when component unmounts or when loading is complete
            if (webcamRef.current) {
                webcamRef.current.stop();
                webcamRef.current = null; // Reset webcam reference
            }
        };
    }, []);

    async function loop(timestamp) {
        if (webcamRef.current) {
            webcamRef.current.update(); 
            await predict();
            window.requestAnimationFrame(loop);
        }
    }

    async function predict() {
        if (!webcamRef.current || !labelContainerRef.current) return;

        const {pose, posenetOutput} = await model.estimatePose(webcamRef.current.canvas);
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
                </>
            )}
        </div>
    );
}

export default Start;
