import React from 'react';
import {
  Row, Divider, Col, Icon, Rate
} from 'antd';
import { Link } from 'react-router-dom';
import SearchBar from './searchbar.js';
import ImageGallery from 'react-image-gallery';
import { RecommendationInfo } from './action.js';
import { GetIsWishesAction, SetWishesAction, DeleteWishesAction } from '../wisheslist/action.js'
class Home extends React.Component {
  state = { cur_lat: 0, cur_lng: 0, data: [] }
  sent = {}
  likes = {}
  myRegexp = /(.+),.+/;
  _isMounted = true;
  componentWillUnmount() {
    this._isMounted = false
  }
  get_like = async (id) => {
    if (this._isMounted === false) return;
    this.sent[id] = true;
    GetIsWishesAction(id, () =>
      this.setState({
        [`button${id}`]: true
      }), () => {
        this.setState({
          [`button${id}`]: false
        })
      });
  }
  componentDidMount() {
    this._isMounted = true;
    navigator.geolocation.getCurrentPosition(location => {
      const { latitude, longitude } = location.coords;
      this.setState({
        cur_lat: latitude,
        cur_lng: longitude
      })
      const query = `longitude=${longitude}&latitude=${latitude}`
      RecommendationInfo(query, (data) => {
        this.setState({ data: data })
      }, () => {
        console.error("error");
      })
    }, () => {
      console.error("Error occur");
    })
  }
  onRunClick(id) {
    if (this.state[`button${id}`]) {
      DeleteWishesAction(id, () =>
        this.setState({
          [`button${id}`]: false
        }));
    } else {
      SetWishesAction({ accommodation: id }, () =>
        this.setState({
          [`button${id}`]: true
        }));
    }
  }
  render() {
    return (
      <center>
        <Row>
          <Row
            // the header height is 91 px
            style={{ minHeight: window.screen.height > (650 + 91)  ? (window.screen.height - 91) : 650 }}
            className="home-page"
            type="flex" justify="space-around" align="middle">
            <Row style={{ width: "100%", minWidth: "600px" }}>
              <span style={{
                fontSize: "50px", fontWeight: 900,
                color: "black"
              }}>Accommodating</span>
              <Row style={{ fontSize: "25px", fontWeight: 600, marginBottom: "30px" }}>
                Find the accommodations you prefer over here
              </Row>
              <SearchBar {...this.props} />
            </Row>
          </Row>
          {this.state.data.length > 0 ?
            <span>
              <Divider>
                <h2>Trending accommodations around you</h2>
              </Divider>
              <Row gutter={14} type="flex" justify="space-around" align="middle">
                {this.state.data.map((value, index) => {
                  let boundActRunClick = this.onRunClick.bind(this, value.id, index);
                  const review_count = value.reviews.length;
                  const rate = review_count ? value.reviews.reduce((total, rate) => total + parseInt(rate), 0) / review_count : 0;
                  return (
                    <Col span={4} key={index} className="home-page-recommodation" index={index}>
                      <ImageGallery
                        showThumbnails={false}
                        showBullets
                        showPlayButton={false}
                        showIndex
                        showFullscreenButton={false}
                        items={value.images.map((v) => (
                          { original: v }
                        ))}
                      />
                      {localStorage.getItem('token') ?
                        <Row>
                          <span
                            ref={(ref) => {
                              if (this.sent[value.id] !== true) {
                                this.get_like(value.id);
                              }
                              this.likes[index] = ref;
                            }}
                            className="like-button"
                            style={this.state['button' + value.id] ?
                              { color: "rgb(255, 69, 69)" } : { color: "black" }}
                            onClick={(e) => {
                              boundActRunClick(e)
                            }}
                          >
                            {this.state['button' + value.id] ?
                              <Icon type="heart" theme='filled' style={{ fontSize: "22px" }} /> :
                              <Icon type='heart' style={{ fontSize: "22px" }} />}
                          </span>
                        </Row>
                        : <span />}
                      <Link to={`/accommodation/${value.id}`} onClick={() => { }}>
                        <Row>
                          <h3>
                            {`${this.myRegexp.exec(value.address.raw)[1]}`}
                          </h3>
                        </Row>
                      </Link>
                      <Rate disabled value={rate} />&nbsp;
                      <span style={{ fontWeight: 800 }}>{rate}</span>&nbsp;
                          <span>({review_count})</span>
                    </Col>
                  )
                })}
              </Row>
              <Divider />
            </span>
            :
            <span />
          }
        </Row>
      </center>)
  }
}
export default Home;

