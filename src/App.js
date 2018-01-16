import React, {Component} from 'react';
import './App.css';

class App extends Component {

  state = {
    audio: null,
    isPlaying: false,
    images: null,
    currentImgIdx: 0,
    //stores the timestamp of the latest pause
    lastPauseTs: 0,
    //each time the audio is paused the pause gap is added to this prop
    accumulatedPausedTime:0,
    timeLeftForPausedSlide:0
  }

  componentDidMount() {
    this.init();
  }

  init(){
    this.fetchData().then(({audioFile, images}) => {
      const audio = new Audio(audioFile);
      //add event listeners
      audio.addEventListener('play',this.onPlay.bind(this));
      audio.addEventListener('pause',this.onPause.bind(this));
      audio.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
      //set state with data
      this.setState({
        images,
        audio
      });
    })
  }

  fetchData() {
    return fetch('./data/data.json').then(response => {
      const contentType = response
        .headers
        .get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
    })
  }

  togglePlay() {
    if (this.state.isPlaying) {
      this.state.audio.pause();
    } else {
      this.state.audio.play();
    }
    this.setState({
      isPlaying: !this.state.isPlaying
    })
  }

  onPlay(e){
    //ms gap between latest pause and current play
    const playPauseGap = Number(e.timeStamp) - Number(this.state.lastPauseTs);
    this.setState({accumulatedPausedTime: this.state.accumulatedPausedTime + playPauseGap});


    if(this.state.timeLeftForPausedSlide){setTimeout(
      this.changeSlide.bind(this),
      Number(this.state.timeLeftForPausedSlide)
    )
  }
  }


  onPause(e){
    const nextChangeTs = this.state.images[this.state.currentImgIdx+1] &&
    Number(this.state.images[this.state.currentImgIdx+1].ts) + Number(this.state.accumulatedPausedTime);
    const lastPauseTs = e.timeStamp;
    const timeLeftForPausedSlide = Number(nextChangeTs) - Number(lastPauseTs);
    this.setState({lastPauseTs,timeLeftForPausedSlide});
  }


  onTimeUpdate(e) {
    const nextChangeTs = this.state.images[this.state.currentImgIdx+1] &&
        Number(this.state.images[this.state.currentImgIdx+1].ts) + Number(this.state.accumulatedPausedTime);
    if(Number(e.timeStamp) >= Number(nextChangeTs)){
      this.changeSlide()
    }
  }

  changeSlide(){
    if(this.state.images[this.state.currentImgIdx+1]){
      this.setState({
        currentImgIdx: this.state.currentImgIdx +1
      })
    }
  }

  render() {
    const {images,currentImgIdx} = this.state;
    const slideshowStyle = {
      backgroundImage: `url(${images?images[currentImgIdx].src:''})`
    }
    return (
      <div className="App">
        {this.state.audio
          ? <div
              className="slideshow"
              style={slideshowStyle}
              onClick={this.togglePlay.bind(this)}/>
          : "Loading..."
}
      </div>
    );
  }
}

export default App;
