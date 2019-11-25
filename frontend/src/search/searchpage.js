import React from "react";
import {
  Row,
  Icon,
  notification,
  Col,
  Form,
  Select,
  Pagination,
  Checkbox,
  Divider,
  Popover,
  InputNumber
} from 'antd';
import { FetchSearchInfo } from "./action.js"
import moment from "moment"
import SearchBar from "../home/searchbar.js"
import AccommodationList from "../accommodation/display.js"
import Map from "../accommodation/map.js"
import { BACKEND_PAGESIZE } from "../global.js"
const { Option } = Select;
const openNotification = () => {
  notification.open({
    message: 'Incorrect url',
    color: "red",
    description:
      'The url path is incorrect.',
    icon: <Icon type="meh" style={{ color: '#108ee9' }} />,
  });
};

class filter_form extends React.Component {
  selected = () => {
    const { getFieldValue } = this.props.form;
    let info = this.props.location.pathname.split("/");
    info[6] = getFieldValue("order");
    if (info.join('/') !== this.props.history.location.pathname)
      this.props.history.push(info.join("/"));
  }
  componentDidUpdate(prepProps) {
    this.max_days = moment(this.props.match.params.end_time, this.dateFormat).diff(
      moment(this.props.match.params.start_time, this.dateFormat), "days") + 1;
    if (prepProps.match !== this.props.match) {
      const { setFieldsValue, } = this.props.form;
      setFieldsValue({ "days": parseInt(this.props.match.params.days) });
    }
  }
  change_booking_day = () => {
    const { getFieldValue } = this.props.form;
    let info = this.props.location.pathname.split("/");
    info[9] = parseInt(getFieldValue("days")) > this.max_days ? 
                this.max_days : parseInt(getFieldValue("days"));
    if (info.join('/') !== this.props.history.location.pathname)
      this.props.history.push(info.join("/"));
  }
  render() {
    const InputWidth = '200px';
    const { getFieldDecorator } = this.props.form;
    const { order_by } = this.props.match.params;
    return (
      <Form
        layout="inline"
        style={{ width: "100%" }}
        hideRequiredMark={true}>
        <Row gutter={5}>
          <Col offset={2} span={21}>
            {/* Order by input field */}
            <Form.Item label="Order by">
              {getFieldDecorator('order', {
                initialValue: order_by ? order_by : "price"
              })(
                <Select
                  style={{ width: InputWidth, marginRight: '3%' }}
                  placeholder="Order by"
                  onSelect={() => this.selected()}
                >
                  <Option value="price">Price</Option>
                  <Option value="rate">Rating</Option>
                  <Option value="start_time">Available time</Option>
                  <Option value="popularity">Popularity</Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('more_than', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Checkbox onChange={() => { this.props.change_more_than() }}>
                  Room more than given
                </Checkbox>
              )}
            </Form.Item>
            <Form.Item label="How many days you want to book?">
              <Popover
                placement="bottom"
                content={
                  <span>
                    <p>Press Enter to search!</p>
                    <p>The number of days include the end date.</p>
                  </span>
                }
              >
                {getFieldDecorator('days',
                  {
                    initialValue: this.props.match.params.days,
                    validateTrigger: "onPressEnter",
                    "rules": [
                      {
                        pattern: /^\d*$/g,
                        message: 'Please input a number.'
                      }
                    ]
                  }
                )(
                  <InputNumber
                    min={1} max={this.max_days}
                    style={{ width: "200px" }}
                    onPressEnter={this.change_booking_day}
                    placeholder="Days to stay?"
                  />
                )}
              </Popover>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }
}
const FiterBar = Form.create()(filter_form);


class SearchPage extends React.Component {
  _isUnMounted = false;
  constructor(props) {
    super(props);
    this.state = { data: [], count: 0 }
    this.more_than = true;
  }
  get_info = (info) => {
    const { start_time, end_time, longitude, latitude,
      room_count, order_by, page, acc_type, days } = info;
    const offset = (page - 1) * BACKEND_PAGESIZE;
    let request_query = `start_time=${start_time}&end_time=${end_time}&latitude=${latitude}&longitude=${longitude}&days=${days}&order=${order_by}&offset=${offset}`;
    if (room_count !== 'any') {
      request_query = request_query.concat(`&room_count=${room_count}`);
    }
    if (acc_type !== 'any') {
      request_query = request_query.concat(`&acc_type=${acc_type}`);
    }
    if (this.more_than === true) {
      request_query = request_query.concat(`&more_than=1`);
    }
    FetchSearchInfo(request_query, (data) => {
      if (this._isUnMounted || !data || !data.results) return;
      this.setState({
        data: data.results,
        count: data.count,
      })
    },
      () => {
        openNotification();
        setTimeout(() => {
          this.props.history.goBack();
        }, 2000)
      });
  }
  componentDidMount() {
    this.get_info(this.props.match.params);
  }
  componentDidUpdate(prepProps) {
    if (this.props.location.pathname !== prepProps.location.pathname) {
      this.get_info(this.props.match.params);
      window.scroll(0, 0);
    }
  }
  change_more_than = () => {
    this.more_than = !this.more_than
    this.get_info(this.props.match.params)
  }
  componentWillUnmount() {
    this._isUnMounted = true;
  }
  page_change = (page) => {
    let info = this.props.location.pathname.split("/");
    info[7] = page;
    this.props.history.push(info.join("/"));
  }
  render() {
    return (
      <Row style={{ paddingTop: "30px", paddingBottom: "30px" }}>
        <div className="search-page-search-bar">
          <SearchBar address_info={this.props.history.location.state ?
            this.props.history.location.state.address_info : undefined} {...this.props} />
          <FiterBar selected={(data) => { this.get_info(data) }}
            change_more_than={this.change_more_than}
            days={parseInt(this.props.match.params.days)}
            {...this.props} />
        </div>
        <Row align="middle">
          <Col span={14}>
            <Divider dashed />
            <AccommodationList data={this.state.data} go_to_accommodation={
              (value) => {
                this.props.history.push(`/accommodation/${value}`)
              }} day={parseInt(this.props.match.params.days)} />
          </Col>
          <Col span={10} className="search-page-map"
            style={{ height: window.screen.height }}>
            {this.state.data ?
              <Map style={{ width: "100%", height: "100%" }}
                {...this.props}
                data={this.state.data}
                day={parseInt(this.props.match.params.days)}
                lng={this.props.match.params.longitude}
                lat={this.props.match.params.latitude}
                history={this.props.history}
              /> : <span />}
          </Col>
        </Row>
        <center style={{ width: "100%", margin: "30px" }}>
          <Pagination
            style={{ fontSize: "20px" }}
            total={this.state.count}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            pageSize={BACKEND_PAGESIZE}
            onChange={(page) => this.page_change(page)}
            current={parseInt(this.props.match.params.page)}
          />
        </center>
      </Row>
    )
  }
}

export default SearchPage;