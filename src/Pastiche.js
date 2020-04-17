import React, { Component } from 'react';
import ky from 'ky';
import styles from './Pastiche.module.scss';

const ROTATION = [
  'rotate(0deg)',
  'rotate(0deg)',
  'rotate(23deg)',
  'rotate(45deg)',
  'rotate(-23deg)',
  'rotate(-45deg)',
]

export class Pastiche extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quote: 'It’s not too late / To feel a little more alive / Make our escape / Before we start to vaporize',
      images: [],
      width: 0,
      height: 0,
    };
  }

  componentDidMount() {
    const { quote } = this.state;
    const quoteList = quote.split(/\s*(?:[;,.//]|$)\s*/);
    // const quoteList = quote.split(' ');
    console.log(quoteList);
    this.loadImages(quoteList);
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
  }

  loadImageFlickr = async (quote) => {
    // https://www.flickr.com/services/api/flickr.photos.search.html
    // https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=6c1975a4b22f8f362e5ea3f7faa4bab7&text=Love&format=json&nojsoncallback=1
    try {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://www.flickr.com/services/rest/';
      const params = {
        method: 'flickr.photos.search',
        api_key: '6c1975a4b22f8f362e5ea3f7faa4bab7',
        text: quote,
        format: 'json',
        nojsoncallback: '1',
        per_page: '20',
      }
      const result = await ky
        .get(
          `${proxyUrl}${targetUrl}`,
          {
            searchParams: params,
          },
        )
        .json();
      const { photos } = result || {};
      const { photo } = photos || {};
      if (Array.isArray(photo) && photo.length > 0) {
        console.log('photo', photo);
        // https://farm66.staticflickr.com/65535/49777624108_f8e6e4c982.jpg
        const flickrImages = photo.map((image) => {
          const { farm, server, id, secret, title } = image;
          return {
            title,
            url: `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`,
          }
        })
        const { images = [] } = this.state;
        this.setState({
          images: images.concat(flickrImages),
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  loadImageWikipedia = async (quote) => {
    // https://en.wikipedia.org/w/api.php?action=query&format=json&list=allimages&aifrom=Graffiti_000&ailimit=3
    try {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://en.wikipedia.org/w/api.php';
      const params = {
        action: 'query',
        format: 'json',
        list: 'allimages',
        aifrom: quote,
        ailimit: 20,
      }
      const result = await ky
        .get(
          `${proxyUrl}${targetUrl}`,
          {
            searchParams: params,
          },
        )
        .json();
      const { query } = result || {};
      const { allimages } = query || {};
      if (Array.isArray(allimages) && allimages.length > 0) {
        console.log('allimages', allimages);
        const { images = [] } = this.state;
        this.setState({
          images: images.concat(allimages),
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  loadImages = (quotes) => {
    quotes.map((quote) => {
      // if (quote) this.loadImageWikipedia(quote);
      if (quote) this.loadImageFlickr(quote);
      return null;
    });
  }

  placeImage = () => {
    const { width, height } = this.state;
    const maxScreenWidth = width - 200;
    const maxScreenHeight = height - 200;
    const leftEdge = maxScreenWidth * Math.random();
    const topEdge = maxScreenHeight * Math.random();

    switch (this.getRandomIntInclusive(1, 6)) {
      case 1: // left
        return { leftEdge: 0, topEdge };
      case 2: // top
      case 3:
        return { leftEdge, topEdge: 0 };
      case 4: // right
        return { leftEdge: maxScreenWidth, topEdge };
      case 5: // bottom
      case 6:
        return { leftEdge, topEdge: maxScreenHeight };
      default:
        return { leftEdge, topEdge };
    }

  }

  render() {
    const { images, quote } = this.state;
    return (
      <div className={styles.app}>
        <div className={styles.appImageContainer}>
          {images.map((image, index) => {
            const { title, url } = image || {};
            const { leftEdge, topEdge } = this.placeImage();
            const rotation = ROTATION[this.getRandomIntInclusive(0, 5)];
            return (
              <div
                className={styles.appImageDiv}
                key={index}
                style={{
                  left: leftEdge,
                  top: topEdge,
                  transform: rotation,
                }}
              >
                <div className={styles.shadow}>
                  <img
                    alt={title}
                    className={styles.appImage}
                    src={url}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <p className={styles.appQuote}>
          {quote}
        </p>
      </div>
    );
  }
}

export default Pastiche;
