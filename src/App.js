import React, { Component } from 'react'

import Title from './components/Title'
import SearchBar from './components/SearchBar'
import VideoList from './containers/VideoList'
import Video from './components/Video'
import VideoDetails from './components/VideoDetails'

import axios from 'axios'

import './style/style.css'


// Variable contenant les informations de l'api The Movie DB
const API_END_POINT = "https://api.themoviedb.org/3/"
const POPULAR_MOVIES_URL = "discover/movie?api_key=92dd02450f3a7e727e3e74d6319f20a7&language=fr-FR&sort_by=popularity.desc&include_adult=false&append_to_response=images"
const API_KEY = "92dd02450f3a7e727e3e74d6319f20a7";
const DEFAULT_PARAM = "language=fr&include_adult=false";

class App extends Component {
  constructor(props) {
    super(props)
      this.state = ({
        movies: [],
        currentMovie: {},
        isSearch: false
      })
  }



  // Avant que le composant soit monté,
  // j'effectue une requête AJAX via axios,
  // pour remplir le state movies => avec les meilleurs films du moment films[1] à films[6]
  // pour remplir le state currentMovie => avec le film du moment films[0]
  componentWillMount () {
    this.initMovies();
  }

  initMovies(){
    axios.get(`${API_END_POINT}${POPULAR_MOVIES_URL}&${API_KEY}`).then(function(response){
      this.setState({
        movies: response.data.results.slice(1, 5),
        currentMovie: response.data.results[0]
      }, function() {
        this.applyVideoToCurrentMovie();
      });
    }.bind(this));
  }

  applyVideoToCurrentMovie(){
    axios.get(`${API_END_POINT}movie/${this.state.currentMovie.id}?api_key=${API_KEY}&append_to_response=videos&include_adult=false`).then(function(response){
      if(response.data.videos.results[0] && response.data.videos.results[0].key){
        const youtube_key = response.data.videos.results[0].key;
        let currentMovieWithVideo = this.state.currentMovie;
        currentMovieWithVideo.videoId = youtube_key;
        this.setState({currentMovie: currentMovieWithVideo})
        console.log(this.state.currentMovie)
      }
    }.bind(this));
  }

  callBackMovieClick(movie){
    this.setState({currentMovie:movie}, function(){
      this.applyVideoToCurrentMovie();
      this.setRecommendation();
    });
  }

  searchMovie(textSearch){
    if(textSearch){
      axios.get(`${API_END_POINT}search/movie?api_key=${API_KEY}&${DEFAULT_PARAM}&query=${textSearch}`).then(function(response){
        // si on trouve des data
        if(response.data && response.data.results[0]){
          // si le film trouvé est différents de l'actuel
          if(response.data.results[0].id !== this.state.currentMovie.id){
            this.updateAfterSearch(response);
          }
        }
      }.bind(this));
    }
  }

  updateAfterSearch(response){
    this.setState({currentMovie: response.data.results[0]}, () => {
      this.applyVideoToCurrentMovie();
      this.setRecommendation();
    });
  }

  setRecommendation(){
    axios.get(`${API_END_POINT}movie/${this.state.currentMovie.id}/recommendations?api_key=${API_KEY}&language=fr`).then(function(response){
      if(response.data && response.data.results.length > 5){
        this.setState({movies: response.data.results.slice(1,5)});
      }
    }.bind(this))
  }

  shouldComponentUpdate(nextProps, nextState){
    if(!nextState.currentMovie.videoId){
      return false;
    } else {
      return true;
    }
  }

  render() {
    const renderMovieList = () => {
      if(!this.state.movies >=4){return <div>Chargement</div>}
      return <VideoList movies={this.state.movies} callBackMovieClick={this.callBackMovieClick.bind(this)} />
    }

    const renderMovie = () => {
      if(this.state.currentMovie.videoId){
        return (<div><Video videoId={this.state.currentMovie.videoId} /><VideoDetails description={this.state.currentMovie.overview} title={this.state.currentMovie.title} /></div>)
      } else {
        return <div>Pas de donnée</div>
      }
    }

    return (
      <div>
        <Title />
        <div className="container-fluid">
          <div className="search_bar">
            <SearchBar callBackRequest={this.searchMovie.bind(this)} />
          </div>
          <div className="row">
            <div className="col-md-8">
              {renderMovie()}
            </div>
            <div className="col-md-4">
              {renderMovieList()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
