import React from'react';
import Tilt from 'react-tilt';
import brain from './brain.png';
import './Logo.css'

const Logo = () => {
	return(
		<div className=' ma4 mt0 '>
			<Tilt className="Tilt pa2 br2 shadow-1" options={{ max : 25 }} style={{ height: 170, width: 170 }} >
 				<div className="Tilt-inner pa4">
 				 <img style={{paddingTop: '5px'}} alt="logo" src={brain}/> 
 				</div>
			</Tilt>
		</div>
	);
}

export default Logo;