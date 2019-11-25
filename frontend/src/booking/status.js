import React, { Component } from 'react';
import {
  Row, Col, Input, Button, Modal, Tag, Popover, Divider, Rate, notification
} from 'antd';
import {
  AcceptRequest,
} from '../message/action.js'
import { PostReview, CancelBooking } from './action.js'
import { Link } from 'react-router-dom';
import moment from 'moment';
const { confirm } = Modal;


const openNotification = () => {
  notification.open({
    message: 'Your review have been successfully post',
    description:
      'Your review have been added. Wish you to have a good day.',
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

function showConfirm(history, id) {
  confirm({
    title: 'Do you want to accept the user request?',
    content: 'Click OK to accept.',
    onOk() {
      AcceptRequest(id, () => {
        history.push(history.location.pathname)
      }, () => {
        alert("error happen");
        window.location.reload();
      })
    },
    onCancel() {
    },
  });
}
function CancelConfirm(history, id) {
  confirm({
    title: 'Do you want cancel this booking?',
    content: 'Click OK to cancel.',
    onOk() {
      CancelBooking({ id: id }, () => {
        history.push(history.location.pathname)
      }, () => {
        alert("error happen");
        window.location.reload();
      })
    },
    onCancel() {
    },
  });
}
const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

class BookingStatus extends Component {
  state = {
    visible: false,
    confirmLoading: false,
    user_rate: 0,
    accommodation_rate: 0,
    user_review: '',
    accommodation_review: '',
  }
  allow_to_review(time) {
    return moment().isAfter(moment(time).startOf("day"), 'day');
  }
  info = (text) => (
    <div>
      <p>{text}</p>
    </div>
  );
  showModal = () => {
    this.setState({
      visible: true,
      review_error: false,
    });
  };
  handleOk = () => {
    // submit the review
    const { user_review, user_rate, accommodation_rate, accommodation_review } = this.state;
    if (user_review && user_rate && accommodation_rate && accommodation_review) {
      this.setState({
        confirmLoading: true,
        review_error: false,
      });
      const data = {
        booking: this.props.value.id,
        user: {
          rate: user_rate,
          content: user_review,
          user: this.props.value.accommodation.owner.id
        },
        accommodation: {
          rate: accommodation_rate,
          content: accommodation_review,
          accommodation: this.props.value.accommodation.id
        }
      }
      PostReview(data, () => {
        this.setState({
          confirmLoading: false,
          visible: false,
          review_error: false,
        });
        openNotification();
        this.props.history.push(this.props.history.location.pathname);
      }, (error) => { console.error(error) })
    } else {
      this.setState({
        review_error: true,
      })
    }
  };
  handleCancel = () => {
    this.setState({
      visible: false,
      confirmLoading: false,
    });
  };
  handleUserRateChange = (value) => {
    this.setState({ user_rate: value });
  }
  handleAccRateChange = (value) => {
    this.setState({ accommodation_rate: value });
  }
  render() {
    const { value, type, open_paid_modal } = this.props;
    const { user_rate, user_review, accommodation_rate, accommodation_review } = this.state;
    return (
      <span>{
        value.status === 'B' ?
          <span className="user-forms">
            {type === 'host' ?
              <Popover
                content={this.info("Accept the booking request")}
              >
                <Button type="primary" size="small"
                  onClick={() => showConfirm(this.props.history, value.id)}>
                  Accept
                </Button><br />
                <Link to='#' onClick={() => CancelConfirm(this.props.history, value.id)}>
                  Cancel booking
                </Link>
              </Popover>
              : <Popover
                content={this.info("Waiting for the owner to accept you request")}
              >
                <Tag color="cyan">
                  Booking
                </Tag><br />
                <Link to='#' onClick={() => CancelConfirm(this.props.history, value.id)}>
                  Cancel booking
                </Link>
              </Popover>}
          </span> :
          value.status === 'A' ?
            <span className="user-forms">
              <Tag color="blue">
                <Popover
                  content={this.info("You request has been accepted by the owner")}
                >
                  Accepted
                </Popover>
              </Tag>
              {type === 'renter' ?
                <span className="user-forms"
                  onClick={() => open_paid_modal(value.id, value.total)}
                >
                  <Popover content={this.info("Proceeding the payment")}>
                    <Link to={"#"}>pay</Link>
                  </Popover>
                </span> :
                <span />}
              <br />
              <Link to='#' onClick={() => CancelConfirm(this.props.history, value.id)}>
                Cancel booking
              </Link>
            </span> :
            value.status === 'P' ?
              <span>
                <Popover content={this.info("Your payment is finalized")}>
                  <Tag color="orange" className="tooltip">
                    Paid
                </Tag>
                </Popover>
              </span> :
              value.status === 'E' ?
                <Popover
                  content={this.info("Expired")}
                >
                  <Tag color="red">Expired</Tag>
                </Popover>
                :
                value.status === 'D' ?
                  <span>
                    <Popover
                      content={this.info("Completed")}
                    >
                      <Tag color="green">Completed</Tag>
                    </Popover>
                    {this.allow_to_review(value.end_time) && (type === 'renter') ?
                      <span className="user-forms">
                        <Popover content={this.info("Leave the review")}>
                          <Link to={"#"} onClick={() => { this.showModal() }}>review</Link>
                        </Popover>
                      </span>
                      : <span />}
                  </span> :
                  <Popover
                    content={this.info("Archived")}
                  >
                    <Tag color="geekblue">Archived</Tag>
                  </Popover>
      }
        <Modal
          title="Reviewing"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.confirmLoading}
          destroyOnClose={true}
        >
          <Row>
            <Col span={18} offset={3}>
              {this.state.review_error ?
                <h4 style={{ color: "red" }}>
                  You cannot leave a empty review
              </h4> : <span />}
              <h4>Host(
                <Link className="button-link" to={`/user/${value.renter.id}`}>
                  {value.renter.username}
                </Link>) review</h4>
              <Rate tooltips={desc} onChange={this.handleUserRateChange} value={user_rate} />
              {user_rate ? <span className="ant-rate-text">{desc[user_rate - 1]}</span> : ''}
              <Input.TextArea
                value={user_review}
                onChange={(e) => { this.setState({ user_review: e.target.value }) }}
                style={{ "width": "100%" }}
              />
              <Divider />
              <h4>Accommodation review<br/>
                <Link className="button-link" 
                  to={`/accommodation/${value.accommodation.id}`}>
                    {value.accommodation.address.raw}
                </Link>
              </h4>
              <Rate tooltips={desc} onChange={this.handleAccRateChange} value={accommodation_rate} />
              {accommodation_rate ? <span className="ant-rate-text">{desc[accommodation_rate - 1]}</span> : ''}
              <Input.TextArea
                value={accommodation_review}
                onChange={(e) => { this.setState({ accommodation_review: e.target.value }) }}
                style={{ "width": "100%" }}
              />
            </Col>
          </Row>
        </Modal>
      </span>
    )
  }
}
export default BookingStatus;