import React, { Component } from 'react';
import {
  Row, Col, Avatar, Modal, Badge, Divider, Button
} from 'antd';
import {
  GetFirstMessage,
  GetUnreadCount,
  ReadMessage
} from './action.js';
import MessageContent from './message_content.js';
import { Link } from 'react-router-dom';
import { BACKEND_DOMAIN } from '../global.js';
import BookingStatus from '../booking/status.js';


class Dialog extends Component {
  myRegexp = /(.+),.+/;
  state = { visible: false };
  ids = [];
  open_chat = (id, uid, img, username, ) => {
    this.setState({
      visible: true,
      booking_id: id,
      dialog_img: img,
      dialog_user_id: uid,
      dialog_username: username,
    })
  }
  _mounted = false;
  timer = {};
  componentDidMount() {
    this._mounted = true;
    this.timer['all_new_message'] =
      setInterval(() => {
        for (const id of this.props.new_message) {
          GetUnreadCount(id, ({ count }) => {
            if (count !== this.state[`unread${id}`] &&
              id !== this.state.booking_id && this._mounted) {
              this.setState({
                [`unread${id}`]: count
              })
            }
          })
          GetFirstMessage(id, ({ content }) => {
            if (content !== this.state[`message${id}`] && this._mounted) {
              this.setState({
                [`message${id}`]: content
              })
            }
          })
        }
      }, 1500);
  }
  get_one_dialog(id) {
    GetFirstMessage(id, ({ content }) => {
      this.setState({
        [`message${id}`]: content
      })
    })
  }
  get_unread(id) {
    GetUnreadCount(id, ({ count }) => {
      this.setState({
        [`unread${id}`]: count
      })
    })
  }
  componentWillUnmount() {
    this._mounted = false;
    for (const key in this.timer) {
      clearInterval(this.timer[key]);
    }
  }
  handleOk = e => {
    this.setState({
      visible: false,
    });
  };
  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };
  render() {
    const { type } = this.props;
    const title = (
      <div>
        <Link to={`/user/${this.state.dialog_user_id}`}>
          <Avatar
            src={this.state.dialog_img}
            size="large"
            alt="Owner image" icon="user" />
          <span className="ellipsis"
            style={{ marginLeft: "15px", marginBottom: "0px", fontWeight: 600 }}>
            {this.state.dialog_username}
          </span>
        </Link>
      </div>)
    return (<div>
      {this.props.data.map((value, index) => {
        if (this.state[`message${value.id}`] === undefined) {
          this.get_one_dialog(value.id);
        }
      if (this.state[`unread${value.id}`] === undefined) {
        this.get_unread(value.id);
      }
      const user = (type === 'renter') ? value.accommodation.owner : value.renter;
      const message_count = this.state[`unread${value.id}`]
        ? this.state[`unread${value.id}`] : 0
      return (
        <div key={index}>
          <Row type="flex" align="middle" className="message-box-bar"
            gutter={3}>
            <Col span={2}>
              <Link to={`/user/${user.id}`}>
                <Avatar
                  src={user.image ? BACKEND_DOMAIN + user.image : null}
                  size="large"
                  alt="Owner image" icon="user" />
              </Link>
            </Col>
            <Col span={3}>
              <center>
                <Link to={`/user/${user.id}`}>
                  <h3 className="ellipsis"
                    style={{ marginBottom: "0px", fontWeight: 600 }}>
                    {user.username}
                  </h3>
                </Link>
                <Badge overflowCount={9} count={message_count}
                  offset={[1, 15]}>
                  <Button className="chat-link-style"
                   style={{border:"0px"}}
                    onClick={() => {
                      ReadMessage(value.id, () => {
                        this.setState({
                          [`unread${value.id}`]: 0,
                        })
                      })
                      this.open_chat(
                        value.id,
                        user.id,
                        user.image ? BACKEND_DOMAIN + user.image : null,
                        user.username
                      )
                    }}>
                    chat
                  </Button>
                  </Badge>
              </center>
            </Col>
            <Col span={11}>
              <Link className="ellipsis" style={{ fontWeight: 600 }}
                to={"/accommodation/" + value.accommodation.id}>
                {this.myRegexp.exec(value.accommodation.address.raw)[1]}<br />
              </Link>
              <span style={{ color: "rgba(128, 128, 128, 0.70)" }}>
                {value.start_time} - {value.end_time}
              </span>
              <p className="ellipsis">
                {this.state[`message${value.id}`]}
              </p>
            </Col>
            <Col span={3}>
              <center>
                <BookingStatus value={value} history={this.props.history}
                  type={type} open_paid_modal={this.props.open_paid_modal}
                />
              </center>
            </Col>
            <Col span={3} style={{ fontWeight: 600 }}>
              <div >Total:</div>
              ${value.total}
            </Col>
            <Col className="user-forms">
              <Link to={`/booking/${value.id}`} >
                detail
              </Link>
            </Col>
          </Row>
          <Divider dashed />
        </div>
      )
    })}
    <Modal
        title={title}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={null}
        destroyOnClose={true}
        afterClose={() => {
          if (this.state.booking_id) {
            const id = this.state.booking_id;
            ReadMessage(id, () => {
              this.setState({
                [`unread${id}`]: 0,
              })
            })
            this.setState({
              booking_id: null
            })
            GetFirstMessage(id, ({ content }) => {
              if (content !== this.state[`message${id}`]) {
                this.setState({
                  [`message${id}`]: content
                })
              }
            })
          }
        }}
      >
        <MessageContent id={this.state.booking_id}
          receiver={this.state.dialog_user_id}
            />
      </Modal>
    </div>)
  }
}
export default Dialog;