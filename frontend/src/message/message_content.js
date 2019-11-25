import React, { Component } from 'react';
import { Row, Col, Avatar, Input, Button, } from 'antd';
import ReactDOM from 'react-dom';
import { GetAllMessage, PostMessage } from './action.js';
import moment from 'moment'
import { BACKEND_DOMAIN } from '../global.js'

class MessageContent extends Component {
  _isUnmount = false
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
    this.today = moment();
  }
  send(content, time, image, index) {
    const m_time = moment(time);
    const print_time = m_time.isSame(this.today, 'date') ?
      m_time.format("HH:mm") : m_time.format("YYYY-MM-DD")
    return (<div className="message-box msg-img-right darker" key={index}>
      <Col span={21}>
        <p>{content}</p>
        <span className="time-right">{print_time}</span>
      </Col>
      <Col span={3} className="message-content-sender-image">
        <Avatar alt={"sender"} icon="user" src={image}
        />
      </Col>
    </div>)
  }
  receive(content, time, image, index) {
    const m_time = moment(time);
    const print_time = m_time.isSame(this.today, 'date') ?
      m_time.format("HH:mm") : m_time.format("YYYY-MM-DD")
    return (
      <div className="message-box msg-img-left" key={index}>
        <Col span={3}>
          <Avatar alt={"receiver"} icon="user" src={image} />
        </Col>
        <Col span={21}>
          <p style={{ whiteSpace: "pre-line" }}>{content}</p>
          <div className="time-left">{print_time}</div>
        </Col>
      </div>)
  }
  ToBottom() {
    const mess_window = ReactDOM.findDOMNode(this.refs.message);
    mess_window.scrollTop = mess_window.scrollHeight;
  }
  send_message = () => {
    const node = ReactDOM.findDOMNode(this.refs.send_content);
    const value = node.value;
    node.value = '';
    if (value) {
      const send_data = {
        booking: this.props.id,
        content: value,
        receiver: this.props.receiver
      }
      PostMessage(send_data, (new_data) => {
        this.setState(({ data }) => ({ data: [...data, new_data] }));
      }, (error) => {
        console.error(error)
      })
    }
  }
  fetch_data = async (id) => {
    if (!this._isUnmount) {
      GetAllMessage(id, (data) => {
        this.setState({
          data: data
        });
      }, () => { })
    }
  }
  componentDidUpdate() {
    if (!this._isUnmount) {
      this.ToBottom();
    }
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this._isUnmount = true;
  }
  componentDidMount() {
    this.fetch_data(this.props.id);
    this.timer = setInterval(() => GetAllMessage(this.props.id, (data) => {
      if (data.length !== this.state.data.length && !this._isUnmount) {
        this.setState({
          data: data
        })
      }
    }, () => { }), 2000);
  }
  render() {
    return (
      <Row>
        <Col offset={2} span={20} ref={"message"} id='message-window'>
          {this.state.data.map((value, index) => {
            if (value.message.sender.username === localStorage.getItem("username")) {
              const image =
                (value.message.sender.image) ? (BACKEND_DOMAIN + value.message.sender.image) :
                  null;
              return this.send(value.content, value.created_time, image,
                index);
            } else {
              const image = (value.message.sender.image) ? (BACKEND_DOMAIN + value.message.sender.image) :
                null;
              return this.receive(value.content, value.created_time,
                image, index);
            }
          }
          )}
        </Col>
        <Col offset={2} span={16}>
          <Input.TextArea
            ref={"send_content"}
            className="message-post-bar"
            placeholder="Input the message..."
            autosize={false}
          />
        </Col>
        <Col span={4}>
          <Button type="primary"
            onClick={() => this.send_message()}
            style={{
              height: "50px", width: "100%",
              fontWeight: 800,
            }}>Send</Button>
        </Col>
      </Row>
    );
  }
}


export default MessageContent;