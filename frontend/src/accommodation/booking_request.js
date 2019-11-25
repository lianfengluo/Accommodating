import React, { Component } from 'react';
import {
  notification,
  Row,
  Col,
  DatePicker,
  Form,
  Button,
  Icon,
  Checkbox,
  Input,
  Popover
} from "antd";
import moment from 'moment';
import { GetUnavailable, postBooking } from './action.js';
const { RangePicker } = DatePicker;

const openNotification = () => {
  notification.open({
    message: 'Succeed!',
    color: "green",
    description:
      'Your Booking request has been sent.',
    icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
  });
};

class Booking extends Component {
  state = {
    not_date: null,
    num_day: null,
    date_range: null,
    error: null,
    checked: false
  }
  dateFormat = 'YYYY-MM-DD';
  get_day = (date_value) => {
    if (date_value) {
      this.setState({
        date_range: date_value,
        num_day: (date_value[1].diff(date_value[0], 'days') + 1)
      })
    }
  }
  componentDidMount() {
    GetUnavailable(this.props.acc_id, ({ not_date }) => {
      this.setState({
        not_date: not_date.map(date =>
          moment(date).toString())
      })
    }, () => {
    })
  }
  disabledDate = (current) => {
    return current.endOf('day') < (moment().endOf('day')) ||
      (this.state.not_date.indexOf(current.startOf('day').toString()) !== -1) ||
      current.endOf('day') < moment(this.props.start_time).endOf('day')
      || current.endOf('day') > moment(this.props.end_time).endOf('day');
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ error: null })
    this.props.form.validateFields((err, value) => {
      if (err) { return }
      if (!this.state.checked) {
        this.setState({ error: "You have to agree the rules." })
        return
      }
      const [start, end] = this.state.date_range;
      for (const key in this.state.not_date) {
        if (start.startOf('day') <= moment(this.state.not_date[key]).startOf('day')
          && end.startOf('day') >= moment(this.state.not_date[key]).startOf('day')) {
          this.setState({ error: 'You cannot picker the date are not available.' })
          return;
        }
      }
      const data = {
        start_time: start.startOf('day').format(this.dateFormat),
        end_time: end.startOf('day').format(this.dateFormat),
        accommodation: this.props.acc_id,
        content: value.content,
      }
      postBooking(data, () => {
        openNotification();
        this.props.history.push("/message/renter")
      }, () => {
        this.setState({
          error: "Error occur.."
        })
      })
    })
  }
  info = (text1, text2) => (
    <div>
      <p>{text1}</p>
      <p>{text2}</p>
    </div>
  );
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const config = {
      rules: [{ required: true, message: 'Please select time!' }],
    };
    return (
      <div>
        <center>
          {this.state.error ?
            <h2 style={{ color: "red" }}>{this.state.error}</h2> : <span />
          }
          <Form layout="inline" onSubmit={this.handleSubmit}
            style={{ width: "400px" }}>
            <Row>
              <Col span={24}>
                <h2>Rules:</h2>
                <p className="booking-requirement-text-box">{this.props.rules}
                </p>
              </Col>
              <Row>
                <Form.Item className="booking-date-range">
                  <Popover
                    content={this.info(
                      `The starting date of night you will stay in and the ending date of night you want to stay in.`,
                      `Check out date should be the next day of ending date.`)}
                  >
                    {getFieldDecorator('date_range', config)(
                      <RangePicker
                        allowClear={false}
                        disabledDate={this.disabledDate}
                        format={this.dateFormat}
                        onChange={this.get_day}
                      />
                    )}
                  </Popover>
                </Form.Item>
              </Row>
              <Row style={{ marginTop: "20px" }}>
                <Form.Item style={{}}>
                  {getFieldDecorator('content',
                    {
                      "rules": [{
                        initialValue: "",
                        required: true,
                        message: 'Input the something about yourself!'
                      }]
                    }
                  )(
                    <Input.TextArea
                      prefix={<Icon type="edit" />}
                      style={{ borderRadius: "5px", width: "400px" }}
                      autosize={{ minRows: 5, maxRows: 12 }}
                      type="textarea"
                      placeholder="Input the something about yourself..."
                    />
                  )}
                </Form.Item>
              </Row>
              {/* </Col> */}
              <center style={{ marginTop: "10px" }}>
                <Col>
                  <Checkbox
                    onChange={e => this.setState({
                      checked: e.target.checked,
                    })}
                  >I agree the rules</Checkbox>
                </Col>
                <Button size={"large"} type="danger" htmlType="submit" style={{ fontWeight: 600, marginTop: "10px" }} disabled={!this.state.checked}>
                  Send
                </Button>
              </center>
            </Row>
          </Form>
        </center>
        <Row>
          {this.state.num_day ? <div style={{ float: "right", fontSize: "25px", fontWeight: 800 }}>
            Total: ${`${this.state.num_day * this.props.price}`}
          </div> : <span />}
        </Row>
      </div>
    )
  }
}
export default Form.create()(Booking);