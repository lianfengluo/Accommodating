import React from 'react';
import {
  Row,
  Col,
  Icon,
  notification,
  Avatar,
  Affix,
  Button,
  Modal,
  Rate,
  Popover,
  Divider
} from 'antd';
import { Link } from 'react-router-dom';
import { FetchAccommodationInfo } from './action.js'
import EditProperty from './edit.js'
import BookProperty from './booking_request.js'
import Map from './map.js'
import {
  AccommodationViewInfo,
  AccommodationReviewOverall,
  AccommodationReviewNext
} from '../review/action.js'
import AccReviewList from '../review/accommodation_review.js'
import { GetIsWishesAction, SetWishesAction, DeleteWishesAction } from '../wisheslist/action.js'

const openNotification = () => {
  notification.open({
    message: 'Incorrect accommodation ID',
    color: "red",
    description:
      'The url path is incorrect.',
    icon: <Icon type="meh" style={{ color: '#108ee9' }} />,
  });
};

const Accommodation_type = {
  HL: 'Hotel',
  A: 'Apartment',
  T: 'Town house',
  HE: 'House',
  V: 'Villa',
  D: "Dormitory"
}

class Accommodation extends React.Component {
  constructor(props) {
    super(props);
    this._isUnMounted = false;
    this.state = {
      data: null,
      liked: false,
      next: null,
      reviews_count: 0,
      overall_rate: 0,
      reviews: [],
    };
    this.sent = false;
  }
  get_like = (id) => {
    this.sent = true;
    GetIsWishesAction(id, () =>
      this.setState({
        liked: true
      }), () => {
        this.setState({
          liked: false
        })
      });
  }
  post_like = (id) => {
    if (this.state.liked) {
      DeleteWishesAction(id, () =>
        this.setState({
          liked: false
        }));
    } else {
      SetWishesAction({ accommodation: id }, () =>
        this.setState({
          liked: true
        }));
    }
  }
  get_info = async (acc_id) => {
    FetchAccommodationInfo(acc_id, (data) => {
      if (this._isUnMounted) return;
      if (!data) {
        openNotification();
        return;
      }
      this.setState({
        data: data
      });
    },
      () => {
        openNotification();
        setTimeout(() => {
          this.props.history.goBack();
        }, 2000)
      });
  }
  review_info = async (acc_id) => {
    AccommodationViewInfo(acc_id, (data) => {
      this.setState({
        reviews: data.results,
        next: data.next,
        reviews_count: data.count,
      })
    }, (error) => {
      console.error(error)
    })
    AccommodationReviewOverall(acc_id, (data) => {
      this.setState({
        overall_rate: data.rate,
        total_rate: data.total,
      })
    }, (error) => {
      console.error(error)
    })
  }
  review_info_next = async () => {
    if (this.state.next) {
      AccommodationReviewNext(this.state.next, (data) => {
        this.setState(state => ({
          reviews: [...state.reviews, ...data.results],
          next: data.next,
        }))
      }, (error) => {
        console.error(error)
      })
    }
  }
  componentDidMount() {
    this.get_info(this.props.match.params.acc_id);
    this.review_info(this.props.match.params.acc_id);
    window.scrollTo(0, 0);
  }
  componentDidUpdate(prepProps) {
    const { acc_id } = this.props.match.params;
    const { acc_id: pre_acc_id } = prepProps.match.params;
    if (acc_id !== pre_acc_id) {
      window.scrollTo(0, 0);
      this.get_info(acc_id);
      this.review_info(this.props.match.params.acc_id);
    }
  }
  componentWillUnmount() {
    this._isUnMounted = true;
  }
  render() {
    const myRegexp = /(.+),.+/;
    if (this.sent !== true && this.state.data) {
      this.get_like(this.state.data.id);
    }
    return (
      <div style={{ padding: "0px" }}>
        <Row>
          {this.state.data ?
            (<Row gutter={4} type="flex" align="middle" justify="space-around"  className="image-display-field"
              style={{ height: (window.innerHeight - 91), minHeight: window.screen.height > 650 + 91  ? window.screen.height - 91 : 650 }}>
              {this.state.data.images.map((value, index) =>
                <Col span={6} key={index} className="Accommodation-img-container">
                  <img src={value} alt="accommodation" />
                </Col>
              )}
            </Row>)
            : <span />}
          {this.state.data ?
            <Row gutter={{ xs: 8, sm: 16, md: 24 }} style={{ marginBottom: "50px" }}>
              <Col offset={2} span={10}>
                <span
                  onClick={() => {
                    this.post_like(this.state.data.id)
                  }}
                  className="like-button-property-page"
                  style={this.state.liked ?
                    { color: "rgb(255, 69, 69)" } : { color: "black" }}
                >
                  {this.state.liked ?
                    <Icon type="heart" theme='filled' /> :
                    <Icon type='heart' />}
                </span>
                <h2 style={{ fontWeight: 700 }}>Address:</h2>
                <h2>
                  {`${myRegexp.exec(this.state.data.address.raw)[1]}`}
                </h2>
                <h2>
                  <span style={{ fontWeight: 700 }}>Type:&nbsp;</span>
                  {Accommodation_type[this.state.data.acc_type]}
                </h2>
                <p>
                  Number of room(s):&nbsp;
                  {`${this.state.data.room_count}`}
                </p>
                <h4 style={{ fontWeight: 800 }}>Description:</h4>
                <p style={{ whiteSpace: "pre-line" }}>
                  <span>{`${this.state.data.description}`}</span>
                </p>
                <Divider />
                <h2>
                  Reviews:
                  <span style={{ float: "right", fontSize: "15px", fontWeight: 400 }}>
                    <Popover content={
                      <span>
                        {this.state.total_rate} star(s) / {this.state.reviews_count} review(s)
                      </span>
                    } placement="top"
                    >
                      <span>
                        <Rate disabled allowHalf count={5} value={this.state.overall_rate} /> &nbsp;
                      <span style={{ fontWeight: 800 }}>{parseFloat(this.state.overall_rate)}</span>
                        ({parseFloat(this.state.reviews_count)})
                      </span>
                    </Popover>
                  </span>
                </h2>
                <Divider dashed />
                <AccReviewList data={this.state.reviews}
                  next={this.state.next}
                  get_next={this.review_info_next}
                />
              </Col>
              <Col offset={2} span={10} style={{ textAlign: "left" }}>
                <Row glutter={6}>
                  <Col span={12}>
                    <h2>Host: &nbsp;
                      <Link className="host-username"
                        to={`/user/${this.state.data.owner.id}`}>
                        {this.state.data.owner.username}
                      </Link>
                    </h2>
                  </Col>
                  <Col span={12}>
                    <Avatar style={{ marginLeft: "30px" }}
                      src={this.state.data.owner.image}
                      size={80} alt="Your user image" icon="user"
                    />
                  </Col>
                </Row>
                <div style={{ lineHeight: "35px" }}>
                  <span
                    style={{ fontSize: "20px", fontWeight: 600 }}>Email:&nbsp;
                  </span>
                  <span style={{ fontSize: "20px" }}>
                    {this.state.data.owner.email}
                  </span>
                </div>
                <div style={{ lineHeight: "35px" }}>
                  <span
                    style={{ fontSize: "20px", fontWeight: 600 }}>Name:&nbsp;
                  </span>
                  <span style={{ fontSize: "20px" }}>
                    {this.state.data.owner.first_name}&nbsp;
                    {this.state.data.owner.last_name}
                  </span>
                </div>
                <Row glutter={6}>
                  <Col span={12}>
                    <span
                      style={{ fontSize: "20px", fontWeight: 600 }}>Phone No:&nbsp;
                    </span>
                    <span style={{ fontSize: "20px" }}>
                      {this.state.data.owner.phone}
                    </span>
                  </Col>
                  <Col span={12}>
                    {this.state.data.owner.city ?
                      <span>
                        <span
                          style={{ fontSize: "20px", fontWeight: 600 }}>City:&nbsp;
                         </span>
                        <span style={{ fontSize: "20px" }}>
                          {this.state.data.owner.city}
                        </span></span> : <span />}

                  </Col>
                </Row>
              </Col>
            </Row> : <span />
          }
        </Row>
        <Row style={{ width: "100%", height: "600px", marginTop: "30px", }}>
          {this.state.data ?
            <Map style={{ width: "100%", height: "600px", marginTop: "30px", }}
              data={[]}
              lng={this.state.data.address.longitude}
              lat={this.state.data.address.latitude}
              history={this.props.history}
            /> : <span />}
        </Row>
        <Affix offsetBottom={0}>
          <Row style={{
            backgroundColor: "white", lineHeight: "60px",
            borderTop: '1px solid rgb(235, 235, 235)',
            borderRadius: 0
          }}>
            <Col style={{ lineHeight: "80px", float: "right", marginRight: "25px" }}>
              <span className="Accommodation-price-tag">Price/day: {this.state.data ?
                `$${this.state.data.price}` :
                ""
              }</span>
              {(this.state.data && localStorage.getItem('token') ?
                this.state.data.owner.username === localStorage.getItem("username") ?
                  <span>
                    <Button style={{
                      fontWeight: 800,
                      fontSize: "15px",
                      lineHeight: "50px",
                      height: "100%",
                    }} onClick={() => {
                      this.setState({
                        editVisible: true
                      })
                    }} >Edit</Button>
                    <EditProperty
                      description={this.state.data.description}
                      rules={this.state.data.rules}
                      price={this.state.data.price}
                      visible={this.state.editVisible}
                      history={this.props.history}
                      pathname={this.props.location.pathname}
                      images={this.state.data.images}
                      acc_id={this.state.data.id}
                      closeModal={() =>
                        this.setState({ editVisible: false })
                      }
                    /></span>
                  : <span>
                    <Modal
                      title={<h3>Book <Icon type="form" /></h3>}
                      visible={this.state.bookVisible}
                      className="edit-property-span"
                      footer={null}
                      centered
                      onCancel={() => this.setState({
                        bookVisible: false,
                      })}
                      destroyOnClose={true}
                    >
                      <BookProperty
                        rules={this.state.data.rules}
                        price={this.state.data.price}
                        history={this.props.history}
                        acc_id={this.state.data.id}
                        start_time={this.state.data.start_time}
                        end_time={this.state.data.end_time}
                      />
                    </Modal>
                    <Button className="btn" type="danger" style={{
                      fontWeight: 800,
                      fontSize: "15px",
                      lineHeight: "50px",
                      height: "100%",
                      backgroundColor: "#FF4D4F"
                    }}
                      onClick={() => {
                        this.setState({
                          bookVisible: true
                        })
                      }}
                    > Book</Button></span> :
                <Popover content="You have to login first">
                  <Button
                    style={{
                      fontWeight: 800,
                      fontSize: "15px",
                      lineHeight: "50px",
                      height: "100%",
                    }}
                    disabled>
                    Book
                  </Button>
                </Popover>)}
            </Col>
          </Row>
        </Affix>
      </div>
    )
  }
}
export default Accommodation;