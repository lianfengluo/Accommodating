import React, { Component } from 'react';
import {
  Row,
  Col,
  Icon,
  Divider,
  Rate,
} from 'antd';
import { Link } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import { GetIsWishesAction, SetWishesAction, DeleteWishesAction } from '../wisheslist/action.js'
const Accommodation_type = {
  HL: 'Hotel',
  A: 'Apartment',
  T: 'Town house',
  HE: 'House',
  V: 'Villa',
  D: "Dormitory"
}
class ShowAccommodation extends Component {
  constructor(props) {
    super(props);
    this.likes = [];
    this.state = {};
    this.sent = {}
    this.myRegexp = /(.+),.+/;
  }
  get_like = async (id) => {
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
  onRunClick(id, ) {
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
    // get the address except the country name.
    return (
      this.props.data.map((value, index) => {
        let boundActRunClick = this.onRunClick.bind(this, value.id, index);
        const review_count = value.reviews.length;
        const rate = review_count ? value.reviews.reduce((total, rate) => total + parseInt(rate), 0) / review_count : 0;
        return (
          <Row key={index} type="flex" align="middle">
            <Col offset={this.props.day ? 0 : 2}
              span={this.props.day ? 24 : 20}>
              <Row style={{ width: "100%", }}
                type="flex" align="middle"
                className={"property-search-field"}>
                <Col span={8}
                  style={this.props.day ? { width: "320px" } : {}}>
                  <div className="search-image-gallery">
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
                  </div>
                </Col>
                <Col span={this.props.day ? 14 : 16} style={{ height: "300px" }}>
                  {localStorage.getItem('token') ?
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
                        <Icon type="heart" theme='filled' /> :
                        <Icon type='heart' />}
                    </span>
                    : <span />}

                  <Link to={`/accommodation/${value.id}`} onClick={() => { }}>
                    <Row className="search-box-text-field">
                      <h2 style={{ fontWeight: 700 }}>
                        <span>
                          Address:
                        </span>
                      </h2>
                      <h3>
                        {`${this.myRegexp.exec(value.address.raw)[1]}`}
                      </h3>
                      <h2>
                        Type: {Accommodation_type[value.acc_type]}
                      </h2>
                      <p>
                        Number of room(s):&nbsp;
                      {`${value.room_count}`}
                      </p>
                      <h3 className='ellipsis'>
                        Description:<br />{`${value.description}`}
                      </h3>
                    </Row>
                  </Link>
                  <Row type="flex" align="bottom" >
                    <Col style={{ position: "absolute", bottom: "0px", textAlign: "justify", left: "0px" }}>
                      <Rate disabled value={rate} />&nbsp;
                      <span style={{ fontWeight: 800 }}>{rate}</span>&nbsp;
                          <span>({review_count})</span>
                    </Col>
                    <Col
                      style={{ position: "absolute", bottom: "0px", textAlign: "justify", right: "0px" }}>
                      <p style={{
                        fontSize: "25px",
                        paddingBottom: 0,
                        margin: 0,
                        fontWeight: 800,
                        marginRight: "10px",
                        float: "right"
                      }}>
                        {this.props.day ?
                          `Total: $${value.price * this.props.day}` :
                          `Price/day: $${value.price}`}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Divider dashed />
          </Row>
        );
      }
      )
    )
  }
}
export default ShowAccommodation;