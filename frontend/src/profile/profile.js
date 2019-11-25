import React from "react";
import {
  Form,
  Input,
  Icon,
  Avatar,
  Select,
  Button,
  Divider,
  message,
  Row,
  Col,
  Alert
} from 'antd';
import { Link } from 'react-router-dom';
import { SubmitUpdateInfo, UploadImageAction } from './action.js'
import { GetVerificationCodeNotExists } from '../user/action.js'

const { Option } = Select;
const IconSize = 20;
const InputWidth = '65%';


const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};


class ProfilieForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmDirty: false,
      autoCompleteResult: [],
      updateField: [],
      imgErrorMessage: null,
      imgSrc: localStorage.getItem('image'),
      send_email_error: null,
      email_info: "Send Email",
      disabled_button: false,
    };
  }
  timer = null;
  onSuccessSendEmail = () => {
    // button timeout
    const timeout = process.env.REACT_APP_EMAIL_VERIFICATION_TIMEOUT;
    this.setState({
      email_info: `Sent Email (${timeout})`,
    });
    this.time_fun(timeout - 1, this);
  }
  time_fun(second, other) {
    if (second >= 0) {
      this.timer = setTimeout(() => {
        other.setState({
          email_info: `Sent Email (${second})`
        });
        this.time_fun(second - 1, other);
      }, 1000)
    } else {
      other.setState({
        disabled_button: false,
        email_info: `Send Email`
      });
    }
  }
  onErrorSendEmail = (data) => {
    if (!data) return;
    if ("errors" in data) {
      let seconds = parseInt(data.errors);
      this.setState({
        send_email_error: `Try to send it ${data.errors}s later.`,
        disabled_button: true,
        email_info: `Sent Email (${seconds})`
      });
      this.time_fun(seconds - 1, this);
    } else if ("email" in data) {
      this.setState({
        send_email_error: `${data.email}`,
        disabled_button: false,
        email_info: `Send Email`,
      });
    }
  }
  sendMail = () => {
    if (this.state.disabled_button) return;
    const { form } = this.props;
    form.validateFields(["email"], (err, values) => {
      if (err) return;
      if (values['email'] === localStorage.getItem('email')) {
        this.setState({
          send_email_error: "Please enter the email you want to update.",
        });
        return;
      }
      this.setState({
        disabled_button: true,
        email_info: `Sending Email..`,
        send_email_error: null,
      });
      GetVerificationCodeNotExists(values, this.onSuccessSendEmail, this.onErrorSendEmail);
    });
  }
  handleSubmit() {
    const init_field =
      (this.props.form.getFieldValue("gender") === localStorage.getItem("gender")) ?
        [] : ["gender"];
    let submitField = init_field.concat(this.state.updateField);
    if (submitField.indexOf("password") !== -1) {
      submitField = submitField.concat("confirm")
    }
    if (submitField.indexOf("email" !== -1)) {
      submitField = submitField.concat("verification");
      this.setState({send_email_error: null})
    }
    this.props.form.validateFieldsAndScroll(submitField, (err, values) => {
      if (err) return;
      delete values.confirm
      if (Object.keys(values).length > 0) {
        SubmitUpdateInfo(values, this.onSuccess, this.onError);
      }
    });
  };
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  onSuccess = (data) => {
    // handle the submitting if the user login succeed
    for (const key in data) {
      localStorage.setItem(key, data[key]);
    }
    if (this.state.updateField.indexOf("password") !== -1) {
      data['password'] = null;
    }
    let description = 'You updated profile in field(s): '
    for (let key in data) {
      if (key === 'description')
        key = "bio";
      else if (key === 'first_name')
        key = "first name"
      else if (key === 'last_name')
        key = "last name"
      description += key;
      description += ', '
    }
    message.success(<h3>{description.slice(0, description.length - 2)}</h3>, 3.0);
  }
  onError = (data) => {
    // handle the error
    if (!data) return;
    const { setFields, getFieldValue } = this.props.form;
    for (const key in data) {
      setFields({
        [key]: {
          value: getFieldValue(key),
          errors: [new Error(data[key])],
        },
      });
    }
  }
  onImgSuccess = (data) => {
    localStorage.setItem("image", data["image"]);
    this.setState({
      imgSrc: data["image"]
    })
    this.props.history.push(this.props.location.pathname)
  }
  onImgError = () => {
    this.setState({
      imgErrorMessage: "Invalid photo file."
    })
  }
  trigerUpload = () => {
    this.setState({
      imgErrorMessage: null
    })
    this.refs.img.click();
  }
  UploadImage = () => {
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/jpg',];
    const file = this.refs.img.files[0];
    const fileType = file['type'];
    if (!validImageTypes.includes(fileType) || !file) {
      this.setState({
        imgErrorMessage: "Invalid photo file."
      })
    } else {
      const formData = new FormData();
      formData.append("image", file);
      UploadImageAction(formData, this.onImgSuccess, this.onImgError);
    }
  }
  lockEnableField(enable, field) {
    return enable ?
      <Icon type='unlock'
        onClick={() => {
          this.props.form.resetFields(field);
          this.setState(
            { updateField: this.state.updateField.filter(v => v !== field) }
          )
        }} style={{ fontSize: IconSize }} />
      :
      <Icon type='lock'
        onClick={() => {
          this.setState(
            { updateField: this.state.updateField.concat(field) }
          )
        }}
        style={{ fontSize: IconSize }} />
  }
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { updateField } = this.state;
    const enable_email = updateField.indexOf("email") !== -1;
    const enable_password = updateField.indexOf("password") !== -1;
    const enable_first_name = updateField.indexOf("first_name") !== -1;
    const enable_last_name = updateField.indexOf("last_name") !== -1;
    const enable_city = updateField.indexOf("city") !== -1;
    const enable_phone = updateField.indexOf("phone") !== -1;
    const enable_description = updateField.indexOf("description") !== -1;
    return (
      <div style={{
        maxWidth: 700, minWidth: 550, textAlign: 'left',
        marginBottom: '30px', marginTop: '20px', border: "solid 1px rgba(179, 176, 176, 0.500)",
        padding: "10px",
        borderRadius: "5%",
      }}>
        <h1 style={{ textAlign: "center" }}>Profile Center <Icon type="profile" /></h1>
        <Divider />
        <center style={{ marginBottom: "20px" }}>
          <Avatar src={this.state.imgSrc}
            size={200} alt="Your user image" icon="user" />
          <br />
          <Link to="#" style={{
            verticalAlign: 'middle', fontSize: 20,
            fontWeight: 600
          }} onClick={() => this.trigerUpload()} >
            <Icon type="upload" />Change profile photo
        </Link>
          <input type="file" style={{ display: 'none' }} ref='img'
            onChange={() => this.UploadImage()}
          />

          {
            this.state.imgErrorMessage ?
              <div>
                <h2 style={{ color: "red" }}>
                  {this.state.imgErrorMessage}</h2>
              </div>
              : <span />
          }
        </center>
        <Form {...formItemLayout}
          hideRequiredMark={true}>
          <Form.Item label="Username">
            {getFieldDecorator('username', {
              initialValue: localStorage.getItem("username"),
              rules: [{ type: 'username' }],
            })(
              <Input
                type="text"
                style={{ width: InputWidth, marginRight: '3%' }}
                disabled={true}
              />)}
          </Form.Item>
          {/* Email input field */}
          <Form.Item label="Email">
            {getFieldDecorator('email', {
              initialValue: localStorage.getItem("email"),
              rules: [
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail!',
                },
              ],
            })(
              <Input
                type="text"
                style={{ width: InputWidth, marginRight: '3%' }}
                disabled={!enable_email}
              />
            )}
            {this.lockEnableField(enable_email, "email")}
          </Form.Item>
          {/* email verification code bar */}
          {
            enable_email ?
            (<Form.Item extra="Send verification code to email." 
              {...formItemLayout} label="Verification">
              <Row gutter={8}>
                <Col span={8}>
                  {getFieldDecorator('verification', {
                    rules: [
                      { len: 6, message: "Verification code will be length of 6." },
                      { required: true, message: "Verification code is required." }
                    ],
                  })(<Input type="text" />)}
                </Col>
                <Col span={10}>
                  <Button onClick={() => this.sendMail()} disabled={this.state.disabled_button}>    
                    {this.state.email_info}
                  </Button>
                </Col>
              </Row>
              <div style={{ width:"60%" }}>
              {this.state.send_email_error && 
              <Alert message={this.state.send_email_error} type="error" className="error" />}
              </div>
            </Form.Item>) : (<span />)
          }

          {/* Password form */}
          <Form.Item label="Password">
            {getFieldDecorator('password', {
              validateTrigger: "onBlur",
              rules: [
                {
                  min: 8,
                  message: 'You password has to be at least 8 letter',
                },
                {
                  required: true,
                  message: 'Please input your Password!',
                },
              ],
            })(
              <Input.Password
                autoComplete="off"
                type="password"
                onBlur={this.handleConfirmBlur}
                disabled={!enable_password}
                style={{ width: InputWidth, marginRight: '3%' }}
              />)}
            {this.lockEnableField(enable_password, "password")}

            {/* comfirm password form */}
          </Form.Item>
          {
            enable_password ?
              (<Form.Item label="Confirm Password">
                {getFieldDecorator('confirm', {
                  validateTrigger: "onBlur",
                  rules: [
                    getFieldValue("password")
                      ? {
                        type: "enum",
                        enum: [getFieldValue("password")],
                        message: "Password does not match"
                      }
                      : {},
                    {
                      required: true,
                      message: "Password confirmation is required"
                    }
                  ],
                })(
                  <Input.Password
                    autoComplete="off"
                    style={{ width: InputWidth, marginRight: '3%' }}
                    onBlur={this.handleConfirmBlur} />)}
              </Form.Item>) : (<span />)
          }
          {/* First name input field */}
          <Form.Item label="First name">
            {getFieldDecorator('first_name', {
              initialValue: localStorage.getItem("first_name"),
              rules: [
                {
                  required: true,
                  message: 'Please input your First name!',
                },
              ],
            })(
              <Input
                style={{ width: InputWidth, marginRight: '3%' }}
                disabled={!enable_first_name}
              />
            )}
            {this.lockEnableField(enable_first_name, "first_name")}
          </Form.Item>

          {/* Last name input field */}
          <Form.Item label="Last name">
            {getFieldDecorator('last_name', {
              initialValue: localStorage.getItem("last_name"),
              rules: [
                {
                  required: true,
                  message: 'Please input your Last name!',
                },
              ],
            })(
              <Input
                style={{ width: InputWidth, marginRight: '3%' }}
                disabled={!enable_last_name}
              />
            )}
            {this.lockEnableField(enable_last_name, "last_name")}
          </Form.Item>

          {/* Gender input field */}
          <Form.Item label="Gender">
            {getFieldDecorator('gender', {
              initialValue: localStorage.getItem("gender")
            })(
              <Select
                style={{ width: InputWidth, marginRight: '3%' }}
                placeholder="Select a option and change input text above"
              >
                <Option value="M">male</Option>
                <Option value="F">female</Option>
                <Option value="O">other</Option>
                <Option value="N">&nbsp;</Option>
              </Select>
            )}
          </Form.Item>
          {/* City input field */}
          <Form.Item label="City">
            {getFieldDecorator('city', {
              initialValue: localStorage.getItem("city"),
            })(
              <Input
                style={{ width: InputWidth, marginRight: '3%' }}
                disabled={!enable_city}
              />
            )}
            {this.lockEnableField(enable_city, "city")}
          </Form.Item>
          {/* Phone input field */}
          <Form.Item label="Phone number">
            {getFieldDecorator('phone', {
              initialValue: localStorage.getItem("phone"),
              rules: [
                {
                  required: true,
                  pattern: new RegExp("^[0-9]{3,}$"),
                  message: "Wrong format Phone!"
                },
              ],
            })(
              <Input
                style={{ width: InputWidth, marginRight: '3%' }}
                disabled={!enable_phone}
              />
            )}
            {this.lockEnableField(enable_phone, "phone")}
          </Form.Item>
          {/* description input field */}
          <Form.Item label="Bio">
            {getFieldDecorator('description', {
              initialValue: localStorage.getItem("description"),
            })(
              <Input.TextArea
                autosize={{ minRows: 3, maxRows: 6 }}
                type="textarea"
                style={{ width: InputWidth, marginRight: '3%' }}
                disabled={!enable_description}
              />
            )}
            {this.lockEnableField(enable_description, "description")}
          </Form.Item>
          <center>
            <Button type="primary" htmlType="submit"
              style={{ fontWeight: 800, widht: "80%" }}
              onClick={() => this.handleSubmit()}>
              Update submit</Button>
          </center>
        </Form>
      </div>
    )
  }
}

const WrappedProfilieForm = Form.create()(ProfilieForm);

class Profile extends React.Component {
  render() {
    return <center><WrappedProfilieForm {...this.props} /></center>
  }
}

export default Profile;