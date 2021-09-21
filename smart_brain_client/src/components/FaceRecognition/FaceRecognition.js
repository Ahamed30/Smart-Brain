import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, boxes }) => {
	// console.log(boxes)

	const boundingBoxes = boxes.map((box, i) => {
        return (
            <div className="bounding-box" key={i} style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol }}></div>
        );
	});
	// console.log(boxes);
    return (
        <div className="center ma">
        	<div className="absolute mt2">
            	<img id="inputImg" alt="" src={ imageUrl } width='500px' height='auto'/>
            	{boundingBoxes}
            </div>
        </div>
    )
}

export default FaceRecognition
