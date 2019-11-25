import React, { Component } from "react";
import moment from 'moment';
import ReactDOM from 'react-dom';
import {
  Col,
  Row,
  Button,
  Input,
  Form,
  Modal,
  Avatar,
  Divider,
  Comment,
} from 'antd';
import ImageGallery from 'react-image-gallery';
import { GetBookingInfo } from './action.js'
import { Link } from 'react-router-dom';
import { pay_group } from "../message/message.js";
import { BACKEND_DOMAIN } from '../global.js'
import {
  ReadMessage,
  GetAllMessage,
  PostMessage,
  PaidRequest
} from '../message/action.js'
import BookingStatus from './status.js'
const { TextArea } = Input;

const receive = (content, time, image, index) => {
  const m_time = moment(time);
  const print_time = m_time.isSame(moment(), 'date') ?
    m_time.format("HH:mm") : m_time.format("YYYY-MM-DD")
  return (
    <div className="message-box msg-img-left" key={index}>
      <Col span={2}>
        <Avatar alt="Your user image" icon="user" src={image} />
      </Col>
      <Col span={21}>
        <p style={{ whiteSpace: "pre-line" }}>{content}</p>
        <div className="time-left">{print_time}</div>
      </Col>
    </div>)
}
const send = (content, time, image, index) => {
  const m_time = moment(time);
  const print_time = m_time.isSame(moment(), 'date') ?
    m_time.format("HH:mm") : m_time.format("YYYY-MM-DD")
  return (<div className="message-box msg-img-right darker" key={index}>
    <Col span={22}>
      <p>{content}</p>
      <span className="time-right">{print_time}</span>
    </Col>
    <Col span={2} className="message-content-sender-image">
      <Avatar alt="Your user image" icon="user"
        style={{ float: "right" }} src={image} />
    </Col>
  </div>)
}


const CommentList = (props) => {
  return props.data.map((value, index) => {
    if (value.message.sender.username === localStorage.getItem("username")) {
      const image =
        (value.message.sender.image) ? (BACKEND_DOMAIN + value.message.sender.image) :
          null;
      return send(value.content, value.created_time, image,
        index);
    } else {
      const image = (value.message.sender.image) ? (BACKEND_DOMAIN + value.message.sender.image) :
        null;
      return receive(value.content, value.created_time,
        image, index);
    }
  })
}


class Booking extends Component {
  state = {
    data: null,
    pay_method: 1,
    post_value: '',
    submitting: false,
    content: [],
  }
  myRegexp = /(.+),.+/;
  fetch_info = async () => {
    const { id } = this.props.match.params;
    GetBookingInfo(id, (data) =>
      this.setState({
        data: data
      }), () => {
        alert("Error booking page.");
        this.props.history.push('/');
      })
  }
  handleSubmit = () => {
    const node = ReactDOM.findDOMNode(this.refs.post);
    const value = node.value;
    node.value = '';
    if (!value) {
      return;
    }
    this.setState({
      submitting: true,

    });
    this.send_message(value);
  };
  PaidMethodonChange = e => {
    this.setState({
      pay_method: e.target.value,
    });
  };
  paid_submit = () => {
    PaidRequest(this.state.data.id, () => {
      this.setState({ paidVisible: false })
      this.props.history.push(
        this.props.history.location.pathname)
    }, () => {
      window.location.reload();
    })
  }
  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      this.fetch_info()
      this.fetch_message_content();
    }
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  componentDidMount() {
    this.fetch_info();
    this.fetch_message_content();
    const { id } = this.props.match.params;
    this.timer = setInterval(() => GetAllMessage(id, (data) => {
      const content = data.reverse();
      if (content !== this.state.content) {
        this.setState({
          content: content
        })
      }
    }, () => { }), 2000);
  }
  date_format(date) {
    return moment(date).format("ddd, Do MMM/YY")
  }
  // date_diff(start, end) {
  //   return moment(end).diff(moment(start), 'days') + 1
  // }
  info = (text) => (
    <div>
      <p>{text}</p>
    </div>
  );
  send_message = (value) => {
    const name_list = [this.state.data.accommodation.owner.id,
    this.state.data.renter.id]
    const receiver = (name_list[0] === parseInt(localStorage.getItem("id"))) ?
      name_list[1] : name_list[0]
    const data = {
      booking: this.state.data.id,
      content: value,
      receiver: receiver
    }
    PostMessage(data, (new_data) => {
      this.setState(({ content }) => ({ content: [new_data, ...content] }))
    }, (error) => {
    })
  }
  fetch_message_content = async () => {
    const { id } = this.props.match.params;
    GetAllMessage(id, (content) => {
      this.setState({
        content: content.reverse()
      })
    }, () => { })
  }
  render() {
    const { data } = this.state;
    if (this.state.data) {
      ReadMessage(this.state.data.id, () => { })
    }
    return (
      <Row gutter={12} className="booking-box">
        {data ?
          <Col offset={2} span={10} className="user-forms booking-left-window">
            <div className="booking-image-gallery">
              <ImageGallery
                showThumbnails={false}
                showBullets
                showPlayButton={false}
                showIndex
                showFullscreenButton={false}
                items={data.accommodation.images.map((v) => (
                  { original: v }
                ))}
              />
            </div>
            <Divider />
            <h3>
              Status:&nbsp;&nbsp;&nbsp;
                <BookingStatus
                value={data} history={this.props.history}
                fontSize={"large"}
                type={
                  localStorage.getItem("username") === data.renter.username ?
                    "renter" : "host"
                } open_paid_modal={() => { this.setState({ paidVisible: true }) }}
              />
            </h3>
            <Modal
              title="Choosing the way you want to paid"
              visible={this.state.paidVisible}
              onOk={this.paid_submit}
              onCancel={() => {
                this.setState({
                  paidVisible: false,
                })
              }}
            >
              {pay_group(this.PaidMethodonChange, this.state.pay_method, data.total)}
            </Modal>
            <Divider />
            <h3 className="booking-date">
              {this.date_format(data.start_time)} ~&nbsp;
                 {this.date_format(data.end_time)}
            </h3>
            <h1>
              {`${this.myRegexp.exec(data.accommodation.address.raw)[1]}`}
            </h1>
            <Divider />
            <h1 className="booking-total"
            >Total: ${data.total}</h1>
            <Divider />
            <Avatar src={data.accommodation.owner.image ?
              BACKEND_DOMAIN + data.accommodation.owner.image :
              null}
              style={{ float: "right" }}
              size={80} alt="Your user image" icon="user" />
            <h2>Host:</h2>
            <h3>
              <Link
                to={`/user/${data.accommodation.owner.id}`}>
                {data.accommodation.owner.username}
              </Link>
            </h3>
            <Divider />
            <Avatar src={data.renter.image ? BACKEND_DOMAIN + data.renter.image :
              null}
              style={{ float: "right" }}
              size={80} alt="Your user image" icon="user" />
            <h2>Renter:</h2>
            <h3>
              <Link
                to={`/user/${data.renter.id}`}>
                {data.renter.username}
              </Link>
            </h3>
            <Divider />
            <h2>Description:</h2>
            <p>
              {data.accommodation.description}
            </p>
            <Divider />
            <h2>Rules:</h2>
            <p>
              {data.accommodation.rules}
            </p>
          </Col>
          : <span />}
        <Col offset={1} span={11} className="booking-right-box">
          <Comment
            avatar={
              localStorage.getItem("image") ?
                <Avatar
                  src={localStorage.getItem("image")}
                  alt={localStorage.getItem("username")}
                  className="comment-image"
                /> : <Avatar
                  icon="user"
                  size={80}
                  alt={localStorage.getItem("username")}
                  className="comment-image"
                />
            }
            content={
              <div>
                <Form.Item>
                  <TextArea rows={4} ref="post" />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" loading={this.submitting}
                    onClick={() => this.handleSubmit()} type="primary">
                    Send Message
                  </Button>
                </Form.Item>
              </div>
            }
          />
          <Divider />
          {this.state.content && <CommentList data={this.state.content} />}
        </Col>
      </Row>
    )
  }
}
export default Booking;

