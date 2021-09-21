import React, { Component } from 'react';
import './App.css';
import  Clarifai, { COLOR_MODEL }  from 'clarifai';
import Navigation from'./components/Navigation/Navigation';
import Signin from'./components/Signin/Signin'; 
import Logo from'./components/Logo/Logo';
import ImageLinkform from './components/ImageLinkform/ImageLinkform';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

const app = new Clarifai.App({
  apiKey: 'YOUR_API_KEY'
});

const particleOptions = {
	particles: {
		number: {
			value: 70,
			density: {
				enable: true,
				value_area: 800
			}
		}
	}
}
const initialState = {
        input: '',
        route: 'signin',
        isSignedIn: false,
        imageUrl: '',
        boxes: [],
        user: {
          id : '',
          name : '',
          email : '',
          entries : 0,
          joined : ''
        }
}
class App extends Component {
  	constructor(){
  		super();
  		this.state={
  			input: '',
        route: 'signin',
        isSignedIn: false,
        imageUrl: '',
        boxes: [],
        user: {
          id : '',
          name : '',
          email : '',
          entries : 0,
          joined : ''
        }
  		}
  	}

    // componentDidMount(){
    //   fetch('http://localhost:3000/')
    //     .then(response => response.json())
    //     .then(console.log)
    // }

    calculateFaceLocation = (data) => {
      const clarifaiFaces = data.outputs[0].data.regions;
      if(clarifaiFaces === undefined){
        return [];
      }
      const img = document.getElementById('inputImg');
      const width = Number(img.width);
      const height = Number(img.height);
      // console.log(width, height);
      const faceLocations = clarifaiFaces.map(region => {
        const clarifaiFace = region.region_info.bounding_box;
        return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height)
        }
      });
      console.log(faceLocations)
      return faceLocations;
    }

    displayFaceBox = (faceLocations) => {
      console.log(faceLocations.length);
      this.setState({boxes : faceLocations});
    }

    loadUser = (data) => {
      this.setState({user: {
          id : data.id,
          name : data.name,
          email : data.email,
          entries : data.entries,
          joined : data.joined
      }})
    }

  	onInputChange = (event) => {
  		this.setState({input : event.target.value});
  	}

    onPictureSubmit = () => {
      this.setState({imageUrl : this.state.input})
      app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
        .then(response =>{
          if(response){
            fetch('http://localhost:3000/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
             .then(response => response.json())
             .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
             })
             .then(err => console.log(err));
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
        })
        .catch(err => console.log(err));
    }


    onRouteChange = (route) =>{
      if(route === 'signin'){
        this.setState(initialState)
      }else if(route === 'home'){
        this.setState({isSignedIn: true})
      }
      this.setState({route: route});
    }
  	render() {
      const { isSignedIn, route} = this.state;
  		return (
        
    		<div className="App">
     			<Particles className='particles'
     				params = {particleOptions}/>
            {this.state.route === 'register' ?
               <Register onRouteChange = {this.onRouteChange} loadUser = {this.loadUser} />
              : this.state.route === 'home' ?
                <div>
                  <Navigation onRouteChange={this.onRouteChange}/>
                  <div>
                     <Logo />
                     <Rank name = {this.state.user.name} entries = {this.state.user.entries} />
                     <ImageLinkform 
                        onInputChange={this.onInputChange}
                        onPictureSubmit={this.onPictureSubmit} />
                      <FaceRecognition boxes={this.state.boxes} imageUrl={this.state.imageUrl} />
                  </div>
                </div>
                : <Signin onRouteChange = {this.onRouteChange} loadUser = {this.loadUser} />
            }
      			
    		</div>
      
  	);
  }
}
export default App;


