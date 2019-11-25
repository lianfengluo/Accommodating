import React from "react";
import moment from 'moment';
import { SubmitAdvertise } from "./action.js";
import { API_KEY } from "../global.js"
import { GoogleApiWrapper } from 'google-maps-react';
import {
  Col,
  Row,
  Button,
  DatePicker,
  Form,
  Icon,
  Input,
  InputNumber,
  Upload,
  Modal,
  Select,
  notification,
  Divider
} from 'antd';
import PlacesAutocomplete, {
  getLatLng,
  geocodeByAddress,
} from 'react-places-autocomplete';
import Map from './map.js';

const { Option } = Select;

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
const openNotification = (status, msg) => {
  const args = {
    message: status,
    description: msg,
    duration: 0,
  };
  notification.open(args);
};

class AdvertiseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: {
        street_number: '',
        route: '',
        locality: '',
        state: '',
        post_code: 0,
      },
      previewVisible: false,
      previewImage: null,
      fileList: [],
      address_info: '',
    };
    this.restriction = {
      componentRestrictions: {
        country: ['au'],
      },
    }
    this.start_time = null;
    this.end_time = null;
    this.disabledDate_end = this.disabledDate_end.bind(this);
    this.disabledDate_start = this.disabledDate_start.bind(this);
  }

  disabledDate_start(current) {
    if (this.end_time)
      return current.endOf('day') < (moment().endOf('day')) || current.endOf('day') > this.end_time;
    return current.endOf('day') < (moment().endOf('day'));
  }
  disabledDate_end(current) {
    if (this.start_time)
      return current.endOf('day') < (moment().endOf('day')) ||
        current.endOf('day') < this.start_time;
    return current.endOf('day') < (moment().endOf('day'));
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (!this.state.address_info || !this.state.address.longitude || err) {
        this.setState({ address_error: "Address invalid (Cannot locate your property)." });
        window.scrollTo(0, 0);
        return;
      }
      const data = new FormData();
      for (const key in fieldsValue) {
        data.append(key, fieldsValue[key])
      }
      data.append("start_time",
        fieldsValue['start_time'].startOf('day').format('YYYY-MM-DD'));
      data.append("end_time",
        fieldsValue['end_time'].startOf('day').format('YYYY-MM-DD'));
      this.state.fileList.slice(0, 8).map(({ originFileObj }) =>
        data.append("images", originFileObj));
      for (const key in this.state.address) {
        data.append(key, this.state.address[key]);
      }
      SubmitAdvertise(data, ({ id }) => {
        openNotification("Success", "Your accommodation has been advertised");
        this.props.history.push(`/accommodation/${id}/`);
      },
        (error) => {
          if (!error) return;
          this.setState({ submitInfoError: error.error })
        })
    });
  };
  handleSelect = address => {
    this.setState({
      address_error: "",
    });
    let data = {};
    let info = null;
    geocodeByAddress(address)
      .then(results => {
        const result = results[0];
        result.address_components.forEach((value, _) => {
          if (
            value.types.indexOf("administrative_area_level_1") !== -1
          ) {
            data['state'] = value.short_name;
          } else if (value.types.indexOf("postal_code") !== -1) {
            data['post_code'] = value.short_name;
          } else if (value.types.indexOf("locality") !== -1) {
            data['locality'] = value.short_name;
          } else if (value.types.indexOf("route") !== -1) {
            data['route'] = value.short_name;
          } else if (value.types.indexOf("street_number") !== -1) {
            data['street_number'] = value.short_name;
          }
        })
        if (!data['post_code'] || !data['state'] || !data['post_code'] || !data['locality']) {
          this.setState({ address_error: "Address is not specific enough." })
        }
        data['raw'] = result.formatted_address;
        info = result.formatted_address;
        return getLatLng(result)
      })
      .then(result => {
        data['longitude'] = result.lng;
        data['latitude'] = result.lat;
        this.setState({
          address_info: info,
          address: data,
        });
      })
      .catch(error => console.error('Error', error));
  };
  handleCancel = () => this.setState({ previewVisible: false });
  handleChange = ({ fileList }) => this.setState({ fileList });
  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: null || file.preview,
      previewVisible: true,
    });
  };
  render() {
    const { form } = this.props;
    const config = {
      rules: [{ type: 'object', required: true, message: 'Please select time!' }],
    };
    const { previewVisible, fileList, previewImage } = this.state;
    const { getFieldDecorator } = form;
    const uploadButton = (
      <div style={{ width: "100%", height: "80px" }}>
        <Row style={{ width: "100%", height: "100%" }} type="flex" justify="space-around" align="middle">
          <Row>
            <Icon type="plus" style={{ fontSize: "35px" }} />
          </Row>
          <div className="ant-upload-text"
            style={{
              color: "black",
              fontSize: "15px"
            }}>Upload image (maximum 8)</div>
        </Row>
      </div>
    );
    const make_label = (info) => {
      return (<span style={{
        color: "black", textAlign: "left",
        fontSize: "20px", fontWeight: 600
      }}>{info}</span>)
    }
    return (
      <center>
        <Row style={{ marginTop: "30px", marginBottom: "30px" }}>
          <h1 style={{ fontWeight: 1000 }}>Advertise <Icon type="home" /></h1>
          <Col offset={3} span={18}
            style={{ border: "1px dashed rgb(194, 194, 194)", borderRadius: "2%", padding: "10px" }}>
            <Form onSubmit={this.handleSubmit}>
              {this.state.address.longitude ?
                <Row style={{ width: "90%", height: "500px", marginBottom: "20px" }}>
                  <Map
                    data={[]}
                    lng={this.state.address.longitude}
                    lat={this.state.address.latitude}
                    history={this.props.history}
                  />
                </Row> : <span />}
              <Row>
                {
                  this.state.submitInfoError ?
                    <h2>this.state.submitInfoError</h2> :
                    <span />
                }
                {/* Google address filling */}
                <Col offset={3} span={18}>
                  <PlacesAutocomplete
                    searchOptions={this.restriction}
                    value={this.state.address_info}
                    onChange={(address) => { this.setState({ address_info: address }) }}
                    onSelect={this.handleSelect}
                  >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (<div style={{ position: "relative" }}>
                      <Input
                        prefix={<Icon type="search" />}
                        style={{ marginBottom: "20px", height: "45px" }}
                        {...getInputProps({
                          placeholder: 'Input your address here',
                          className: 'location-search-input',
                        })} />
                      <div className="autocomplete-dropdown-container"
                        style={{ position: "absolute", zIndex: 999, width: "100%" }}>
                        {loading && <div>Loading...</div>}
                        {suggestions.map(suggestion => {
                          const className = suggestion.active
                            ? 'suggestion-item--active'
                            : 'suggestion-item';
                          // inline style for demonstration purpose
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
                  <h2 style={{ color: "red", }}>
                    {this.state.address_error ? this.state.address_error : ""}
                  </h2>
                </Col>
              </Row>
              <Divider dashed />
              <Row>
                <Col span={12}>
                  <center>
                    <Form.Item
                      label={make_label("Start date")}
                    >
                      {getFieldDecorator('start_time', config)(<DatePicker
                        onChange={(date) => { this.start_time = date }}
                        disabledDate={this.disabledDate_start}
                        style={{ width: "60%" }}
                        placeholder={"Start date"}
                      />)}
                    </Form.Item>
                  </center>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={make_label("End  date")}
                  >
                    {getFieldDecorator('end_time', config)(
                      <DatePicker
                        style={{ width: "60%" }}
                        disabledDate={this.disabledDate_end}
                        placeholder={"End date"}
                        onChange={(date) => { this.end_time = date }}
                      />)}
                  </Form.Item>
                </Col>
                <Divider dashed />
                <Col span={12}>
                  <Form.Item
                    label={make_label("Number of room")}
                  >
                    {getFieldDecorator('room_count',
                      {
                        initialValue: 0,
                        "rules": [{
                          required: true,
                          message: 'Input the number of room!'
                        }]
                      }
                    )(
                      <InputNumber size="large"
                        min={0} max={100}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={make_label("Price/day")}
                  >
                    {getFieldDecorator('price',
                      {
                        initialValue: 50,
                        "rules": [{
                          required: true,
                          message: 'Input the price per day!'
                        }]
                      }
                    )(
                      <InputNumber
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Divider dashed />
              <Row style={{ widht: "100%" }}>
                <center>
                  <Form.Item label={make_label("Type")}>
                    {getFieldDecorator('acc_type',
                      {
                        "rules": [{
                          required: true,
                          message: 'Please select your accommodation type.'
                        }]
                      }
                    )(
                      <Select
                        style={{
                          width: "50%", fontSize: "15px",
                        }}
                        placeholder="Select your accommodation type."
                      >
                        <Option style={{ height: "35px" }} value="HE">House</Option>
                        <Option style={{ height: "35px" }} value="A">Apartment</Option>
                        <Option style={{ height: "35px" }} value="HL">Hotel</Option>
                        <Option style={{ height: "35px" }} value="T">Town house</Option>
                        <Option style={{ height: "35px" }} value="D">Dormitory</Option>
                        <Option style={{ height: "35px" }} value="V">Villa</Option>
                      </Select>
                    )}
                  </Form.Item>
                </center>
              </Row>
              <Divider dashed />
              <Row style={{ widht: "100%", textAlign: "left" }}>
                <Col offset={1} span={11}>
                  <Form.Item
                    label={<span style={{
                      fontWeight: 800,
                      fontSize: "20px"
                    }}>{"Description"}</span>}>
                    {getFieldDecorator('description',
                      {
                        "rules": [{
                          initialValue: "",
                          required: true,
                          message: 'Input the description!'
                        }]
                      }
                    )(
                      <Input.TextArea
                        prefix={<Icon type="edit" />}
                        style={{ borderRadius: "5px", width: "90%" }}
                        autosize={{ minRows: 5, maxRows: 12 }}
                        type="textarea"
                        placeholder="Input your accommodation description here."
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col offset={1} span={11}>
                  <Form.Item
                    label={<span style={{
                      fontWeight: 800,
                      fontSize: "20px"
                    }}>{"Rules"}</span>}>
                    {getFieldDecorator('rules',
                      {
                        "rules": [{
                          initialValue: "",
                          required: true,
                          message: 'Input the rules!'
                        }]
                      }
                    )(
                      <Input.TextArea
                        prefix={<Icon type="edit" />}
                        style={{ borderRadius: "5px", width: "90%" }}
                        autosize={{ minRows: 5, maxRows: 12 }}
                        type="textarea"
                        placeholder="Input your accommodation rules here."
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Divider dashed />
              <Row style={{ marginBottom: "30px" }}>
                <Col offset={3} span={18}>
                  <Upload
                    customRequest={({ _, onSuccess }) => {
                      setTimeout(() => {
                        onSuccess("ok");
                      }, 0);
                    }}
                    accept=".png,.jpg,.jpeg,.gif"
                    listType="picture"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                    multiple={true}
                    style={{ cursor: "pointer" }}
                  >
                    {fileList.length >= 8 ? null : uploadButton}
                  </Upload>
                  <Modal visible={previewVisible} footer={null}
                    width={"70%"} onCancel={this.handleCancel}>
                    <center>
                      <img style={{ width: '90%', height: '90%' }}
                        src={previewImage} alt={"preview house"} />
                    </center>
                  </Modal>
                </Col>
              </Row>
              <Divider dashed />
              <Col offset={6} span={12} style={{ marginTop: "20px" }}>
                <Button type="primary" htmlType="submit"
                  style={{
                    fontWeight: 800,
                    width: "100px",
                    fontSize: "20px",
                    height: "50px"
                  }}>
                  Submit
              </Button>
              </Col>
            </Form>
            <span style={{ lineHeight: "50px" }}><br />&nbsp;</span>
          </Col>
        </Row>
      </center>
    )
  }
}
const WrappedAdvertiseForm = Form.create({ name: 'AdvertiseForm' })(AdvertiseForm);

export default GoogleApiWrapper({
  apiKey: API_KEY,
  libraries: ["places"]
})(WrappedAdvertiseForm);