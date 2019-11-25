import React from "react";
import {
  Input,
  Row,
  Col,
  DatePicker,
  Form,
  Icon,
  Button,
  Select,
  Popover
} from "antd";
import moment from 'moment';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import { API_KEY } from "../global.js"
import { GoogleApiWrapper } from 'google-maps-react';
const { Option } = Select;
const { RangePicker } = DatePicker;


class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    const { longitude, latitude, start_time, end_time } = this.props.match.params;
    this.data = {
      lng: longitude,
      lat: latitude,
    }
    const init_date =
      (start_time && end_time) ? [moment(start_time), moment(end_time)] : null
    this.state = {
      address: {},
      address_info: this.props.address_info,
      date: init_date
    };
    this.dateFormat = 'YYYY-MM-DD';
    this.restriction = {
      componentRestrictions: {
        country: ['au'],
      },
    }
  }
  disabledDate(current) {
    return current.endOf('day') < (moment().endOf('day'));
  }
  handleChange = address => {
    this.setState({ address });
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (!this.data.lng || !this.data.lat) {
        this.setState({ address_error: "Address invalid." })
        return;
      }
      if (err) {
        return;
      }
      const { start_time, end_time, order_by } = this.props.match.params;
      const start = fieldsValue['date_range'][0].format(this.dateFormat) ?
        fieldsValue['date_range'][0].format(this.dateFormat) : start_time;
      const end = fieldsValue['date_range'][1].format(this.dateFormat) ?
        fieldsValue['date_range'][1].format(this.dateFormat) : end_time;
      const room_count = fieldsValue['room_count'] ? fieldsValue['room_count'] : "any";
      const acc_type = fieldsValue['acc_type']
      const { lat, lng } = this.data;
      const order = order_by ? order_by : "price";
      const days = moment(end, this.dateFormat).diff(moment(start, this.dateFormat), "days") + 1;
      this.props.history.push(`/search/${start}/${end}` +
        `/${lng}/${lat}/${order}/1/${acc_type}/${days}/${room_count}/`,
        { address_info: this.state.address_info, lng: lng, lat: lat });
    });
  };
  info = (text1, text2) => (
    <div>
      <p>{text1}</p>
      {text2 ? <p>{text2}</p> : <span />}
    </div>
  );
  handleSelect = address => {
    this.setState({
      address_error: "",
    });
    geocodeByAddress(address)
      .then(results => {
        const result = results[0];
        this.setState({
          address_info: result.formatted_address,
        })
        return getLatLng(result)
      })
      .then(result => {
        this.data = result;
      })
  };
  render() {
    const { getFieldDecorator, } = this.props.form;
    const config = {
      rules: [{ required: true, message: 'Please select time!' }],
      initialValue: this.state.date,
    };
    return (
      <Form onSubmit={this.handleSubmit} style={{ minWidth: "800px" }}>
        <Row gutter={5}>
          <Col offset={2} span={20}>
            <Col span={10}>
              <PlacesAutocomplete
                searchOptions={this.restriction}
                value={this.state.address_info ? this.state.address_info : ""}
                onChange={(address) => { this.setState({ address_info: address }) }}
                onSelect={this.handleSelect}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div style={{ position: "relative" }}>
                    <Input
                      prefix={<Icon type="search" />}
                      style={{ marginBottom: "20px", height: "45px" }}
                      {...getInputProps({
                        placeholder: 'Search address here.',
                        className: 'location-search-input',
                      })} />
                    <div className="autocomplete-dropdown-container" style={{ position: "absolute", zIndex: 999, width: "100%" }}>
                      {loading && <div>Loading...</div>}
                      {suggestions.map(suggestion => {
                        const className = suggestion.active
                          ? 'suggestion-item--active'
                          : 'suggestion-item';
                        const style = suggestion.active
                          ? {
                            backgroundColor: '#b9d1f5', cursor: 'pointer',
                          }
                          : {
                            backgroundColor: '#ffffff', cursor: 'pointer',

                          };
                        return (
                          <div
                            {...getSuggestionItemProps(suggestion, {
                              className,
                              style,
                            })}
                          >
                            <span>{suggestion.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Popover
                  content={
                    this.info(`The starting date of night you will stay in and the ending date of night you want to stay in.`, `Check out date 
                    "should be the next day of ending date.`)}
                  placement="bottom"
                >
                  {getFieldDecorator('date_range', config)(
                    <RangePicker
                      placeholder={["From date",
                        "To date"]}
                      className="search-bar-style"
                      disabledDate={this.disabledDate}
                      format={this.dateFormat}
                    />
                  )}
                </Popover>
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item className="search-bar-style-select">
                <Popover
                  content={this.info("Accommodation type.")}
                  placement="bottom"
                >
                  {getFieldDecorator('acc_type',
                    {
                      initialValue: this.props.match.params.acc_type ? this.props.match.params.acc_type : undefined,
                      "rules": [
                        {
                          required: true,
                          message: 'Choose your house type.'
                        }
                      ]
                    })(
                      <Select
                        style={{ fontSize: "25px" }}
                        placeholder="type"
                        className="search-bar-style-select"
                      >
                        <Option style={{ height: "35px" }} value="any">Any</Option>
                        <Option style={{ height: "35px" }} value="HE">House</Option>
                        <Option style={{ height: "35px" }} value="A">Apartment</Option>
                        <Option style={{ height: "35px" }} value="HL">Hotel</Option>
                        <Option style={{ height: "35px" }} value="T">Town house</Option>
                        <Option style={{ height: "35px" }} value="D">Dormitory</Option>
                        <Option style={{ height: "35px" }} value="V">Villa</Option>
                      </Select>
                    )}
                </Popover>
              </Form.Item>
            </Col>
            {/* Room form */}
            <Col span={3}>
              <Form.Item style={{ width: "100%", height: "45px" }}>
                <Popover
                  placement="bottom"
                  content={this.info(`How many rooms you requirent at least.`, `With no requirement just leave it blank.`)}
                >
                  {getFieldDecorator('room_count',
                    {
                      initialValue: this.props.match.params.room_count
                        ?
                        (this.props.match.params.room_count === "any" ? "" :
                          this.props.match.params.room_count)
                        : "",
                      "rules": [
                        {
                          pattern: /^\d*$/g,
                          message: 'Please enter a number or None.'
                        }
                      ]
                    }
                  )(
                    <Input
                      prefix={<Icon type="team" />}
                      style={{ width: "100%", height: "45px" }}
                      placeholder="Rooms"
                    />
                  )}
                </Popover>
              </Form.Item>
            </Col>
            <Col span={2}>
              <Button type="danger"
                className="search-bar-button"
                htmlType="submit"
              >
                Search
              </Button>
            </Col>
          </Col>
        </Row>
      </Form>
    )
  }
}

const SearchBarWrapper = Form.create({ name: 'Search Bar' })(SearchBar);
// export default SearchBarWrapper;
export default GoogleApiWrapper({
  apiKey: API_KEY,
  libraries: ["places"]
})(SearchBarWrapper);