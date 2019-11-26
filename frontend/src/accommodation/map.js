import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import { API_KEY } from "../global.js"
import ReactDOM from 'react-dom';
import ImageGallery from 'react-image-gallery';

// google marker icon
let markerIcon = (google, url = 'http://image.flaticon.com/icons/svg/252/252025.svg') => ({
  url: url,
  scaledSize: new google.maps.Size(80, 80),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(32, 65),
  labelOrigin: new google.maps.Point(40, 33)
});

export class InfoWindowEx extends Component {
  constructor(props) {
    super(props);
    this.infoWindowRef = React.createRef();
    this.contentElement = document.createElement(`div`);
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      ReactDOM.render(
        React.Children.only(this.props.children),
        this.contentElement
      );
      this.infoWindowRef.current.infowindow.setContent(this.contentElement);
    }
  }

  render() {
    return <InfoWindow ref={this.infoWindowRef} {...this.props} />;
  }
}

export class MapContainer extends Component {
  state = { price: 0, acc_id: null, };
  myRegexp = /(.+),.+/;
  center = React.createRef();
  onMarkerClick = (props, marker) => {
    this.setState({
      price: props.title,
      value: props.name,
      activeMarker: marker,
      showingInfoWindow: true,
    });
  }
  onMapClicked = () => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      })
    }
  };
  shouldComponentUpdate(nextProps) {
    return this.props.lat !== nextProps.lat || this.props.lng !== nextProps.lng ||
        JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data);
  }
  changeCenter = ({ latLng }) => {
    let path = this.props.history.location.pathname.split('/');
    path[4] = latLng.lng();
    path[5] = latLng.lat();
    path[7] = 1;
    this.setState({
      showingInfoWindow: false,
      activeMarker: null
    })
    this.props.history.push(path.join('/'))
  }
  render() {
    const { google } = this.props;
    return (
      <Map google={google} zoom={15}
        center={{
          lat: this.props.lat,
          lng: this.props.lng,
        }}
        initialCenter={{
          lat: this.props.lat,
          lng: this.props.lng,
        }}>
        <Marker
          id="center-marker"
          ref={this.center}
          draggable={this.props.day ? true : false}
          animation={this.props.day ? google.maps.Animation.BOUNCE : null}
          title={"You current Location"}
          zIndex={999}
          name={null}
          position={{
            lat: this.props.lat,
            lng: this.props.lng,
          }}
          onDragend={(t, map, coord) => this.changeCenter(coord)}
          label={{
            text: this.props.day ? "search location" : `location of the property`,
            color: "black",
            fontSize: "20px",
            fontWeight: "bold",
          }}
          icon={{
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 10,
            origin: new google.maps.Point(0, 0),
            labelOrigin: new google.maps.Point(0, -1)
          }}
        />
        {
          this.props.data.map((value, index) => {
            const total = this.props.day * value.price;
            return <Marker
              key={index}
              title={`${value.price}`}
              name={value}
              position={{
                lat: value.address.latitude,
                lng: value.address.longitude
              }}
              label={{
                text: "$" + total,
                color: "black",
                fontSize: "16px",
                fontWeight: "bold",
                lineHeight: "2"
              }}
              onClick={(e, marker) => this.onMarkerClick(e, marker)}
              icon={markerIcon(google)}
            />
          }
          )
        }
        <InfoWindowEx
          {...this.props}
          marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}>
          <div>
            {this.state.value ?
              <span>
                <div className="google-map-display-img">
                  <ImageGallery
                    showThumbnails={false}
                    showBullets
                    showPlayButton
                    autoPlay
                    showIndex
                    showFullscreenButton={false}
                    items={this.state.value.images.map((v) => (
                      { original: v }
                    ))}
                  /></div>
                <h3>
                  {`${this.myRegexp.exec(this.state.value ?
                    this.state.value.address.raw : "")[1]}`}</h3>
                <h2>Total: ${parseInt(this.state.price) * this.props.day}</h2>
                <a href={`/accommodation/${this.state.value.id}`}>
                  Checkout detail
                </a>
              </span> : <span />}
          </div>
        </InfoWindowEx>
      </Map>
    );
  }
}
// export default MapContainer;
export default GoogleApiWrapper({
  apiKey: (API_KEY),
  libraries: ["places"]
})(MapContainer)