import React from 'react';
import {
  Row,
  Divider,
  Col,
  Icon,
  Avatar,
  notification,
  Rate,
  Popover
} from 'antd';
import { FetchUserInfo, FectchPropertyInfo } from './action.js';
import { UserReviewInfo, UserReviewOverall, UserReviewNext } from '../review/action.js'
import AccommodationList from '../accommodation/display.js'
import UserReviewList from '../review/user_review.js'

// A notification message when something 
const openNotification = (message) => {
  notification.open({
    message: message,
    color: "red",
    description:
      'The url path is incorrect.',
    icon: <Icon type="meh" style={{ color: '#108ee9' }} />,
  });
};
export class UserPage extends React.Component {
  _isUnMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      InfoVisble: false,
      data: {},
      properties: [],
      reviews: [],
      activeKey: "properties",
      next: null,
      reviews_count: 0,
      overall_rate: 0
    };
  }
  get_info = async (user) => {
    FetchUserInfo(user, (data) => {
      if (this._isUnMounted || !data) return;
      this.setState({
        data: data
      });
    },
      () => {
        openNotification('Incorrect username');
        setTimeout(() => {
          this.props.history.goBack();
        }, 2000)
      });
  }
  properties_info = async (user) => {
    FectchPropertyInfo(user, (data) => {
      if (this._isUnMounted || !data) return;
      this.setState({
        properties: data
      });
    },
      () => {
        openNotification('Incorrect property info');
        setTimeout(() => {
          this.props.history.goBack();
        }, 2000)
      });
  }
  review_info = async (user) => {
    UserReviewInfo(user, (data) => {
      this.setState({
        reviews: data.results,
        next: data.next,
        reviews_count: data.count,
      })
    }, (error) => {
      console.error(error)
    })
    UserReviewOverall(user, (data) => {
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
      UserReviewNext(this.state.next, (data) => {
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
    this.get_info(this.props.match.params.user);
    this.properties_info(this.props.match.params.user);
    this.review_info(this.props.match.params.user);
  }
  componentDidUpdate(prepProps) {
    if (prepProps.location !== this.props.location) {
      this.get_info(this.props.match.params.user);
      this.properties_info(this.props.match.params.user);
      if (prepProps.match.params.user !== this.props.match.params.user)
        this.review_info(this.props.match.params.user);
    }
  }
  componentWillUnmount() {
    this._isUnMounted = true;
  }
  handleOpenInfoModal = () => {
    this.setState({
      InfoVisble: false,
    });
  };
  changeTab = (key) => {
    this.setState({
      activeKey: key,
    })
  }
  handleCancelInfoModal = e => {
    this.setState({
      InfoVisble: false,
    });
  };
  render() {
    const { username, first_name, last_name, email, image, phone,
      gender, description, city, } = this.state.data;
    return (
      <div style={{ marginBottom: "40px" }}>
        <center>
          <Row type="flex" justify="space-around" align="middle"
            style={{
              minWidth: 700,
              maxWidth: 750,
              marginTop: 30,
              alignItems: 'center',
              textAlign: "center",
            }} gutter={16}>
            <Col span={6} style={{
              lineHight: 90,
              alignItems: 'center',
            }}>
              <Avatar src={image}
                size={180} alt="Your user image" icon="user"
              />
            </Col>
            <Col span={18} style={{ textAlign: "left" }}>
              <Row>
                <Col span={11} style={{
                  fontSize: 25, marginRight: 50, fontWeight: 800,
                  textAlign: "left", color: "black"
                }}>{username}&nbsp;
                {
                    gender === "M" ? <Icon type="man" /> :
                      gender === "F" ? <Icon type="woman" /> : ""
                  }
                </Col>
                {/* <div style={{ float: "right" }}> */}
                <Popover content={
                  <span>
                    {this.state.total_rate} star(s) / {this.state.reviews_count} review(s)
                  </span>
                } placement="top"
                >
                  <span>
                    <Rate disabled allowHalf count={5} value={this.state.overall_rate} /> &nbsp;
                    <span style={{ fontWeight: 800, fontSize: "18px" }}>{this.state.overall_rate}</span>
                  </span>
                </Popover>
              </Row>
              <Row>
                <h2 style={{ textAlign: "left", marginTop: "5px" }}>
                  <Icon type="mail" />: {`${email}`}
                </h2>
                <Col span={12}>
                  <h2 style={{ textAlign: "left", marginTop: "5px" }}>
                    <Icon type="phone" />:
                    {`${phone ? phone : ""}`}
                  </h2>
                </Col>
                <Col span={12}>
                  <h2 style={{ textAlign: "left", marginTop: "5px" }}>
                    <Icon type="home" />: {`${city ? city :
                      ""}`}
                  </h2>
                </Col>
                <h2 style={{ textAlign: "left", marginTop: "5px" }}>
                  <Popover content={"Name of the user"} placement="right">
                    {`${first_name} ${last_name}`}
                  </Popover>
                </h2>
                <p style={{ textAlign: "left", marginTop: "5px" }}>
                  Bio:{description}
                </p>
              </Row>
            </Col>
          </Row>
          <Divider />
        </center>
        <Row style={{ textAlign: "center", fontSize: "20px", cursor: "pointer" }}>
          <Col span={12} style={
            this.state.activeKey === "properties" ?
              {
                borderRight: "1px solid rgba(128, 128, 128, 0.664)",
                fontWeight: 800, color: "black",
              } :
              {
                borderRight: "1px solid rgba(128, 128, 128, 0.664)",
                fontWeight: 400
              }}
            onClick={() => this.setState({ activeKey: "properties" })}>
            Properties
              </Col>
          <Col span={12} onClick={() => this.setState({ activeKey: "reviews" })}
            style={this.state.activeKey === "reviews" ?
              { fontWeight: 800, color: "black", } : { fontWeight: 400 }}>
            Review
              </Col>
        </Row>
        <Divider />
        <div className='user-page-property' style={this.state.activeKey === "properties" ? { display: "block" } : { display: "None" }}>
          <AccommodationList data={this.state.properties}
            go_to_accommodation={
              (value) => {
                this.props.history.push(`/accommodation/${value}`)
              }} />
        </div>
        <div style={this.state.activeKey === "reviews" ? { display: "block" } : { display: "None" }}>
          <UserReviewList data={this.state.reviews}
            next={this.state.next}
            count={this.state.reviews_count}
            get_next={this.review_info_next}
          />
        </div>
      </div>
    )
  }
}