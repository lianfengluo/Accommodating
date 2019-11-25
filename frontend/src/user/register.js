import React from "react";
import { Form, Modal, Input, Alert, Icon, Row, Col, Button } from "antd";
import { SubmitRegister, SetLocalStorage, GetVerificationCodeNotExists } from "./action.js";


const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
  },
};

class Register extends React.Component {
  state = {
    loading: false,
    ErrorMessage: null,
    error: null,
    confirmDirty: false,
    send_email_error: null,
    email_info: "Send Email",
    disabled_button: false,
  };
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
      this.setState({
        disabled_button: true,
        email_info: `Sending Email..`,
        send_email_error: null,
      });
      GetVerificationCodeNotExists(values, this.onSuccessSendEmail, this.onErrorSendEmail);
    });
  }
  onSuccess = (data) => {
    // handle the submitting if the user register succeed
    SetLocalStorage(data);
    this.props.loginSucceed();
    this.props.history.push(
      localStorage.getItem('url_before_login') ?
        localStorage.getItem('url_before_login') : '/');
  }
  onError = (data) => {
    if (!data) return;
    for (const key in data) {
      this.props.form.setFields({
        [key]: {
          value: this.props.form.getFieldValue(key),
          errors: [new Error(data[key])],
        },
      });
    }
    this.setState({ loading: false });
  }
  handleOk = () => {
    const { form } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      this.setState({ loading: true, send_email_error: null });

      delete values.confirmPassword;
      SubmitRegister(values, this.onSuccess, this.onError);
    });
  };

  handleCancel = () => {
    const { closeModal } = this.props;
    const email = this.props.form.getFieldValue("email");
    const username = this.props.form.getFieldValue("username");
    this.props.form.setFields({
      email: {
        value: email,
      },
    });
    this.props.form.setFields({
      username: {
        value: username,
      },
    });
    this.setState({ loading: false });
    closeModal();
  };
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  render() {
    const { form, visible } = this.props;
    const { error, loading } = this.state;
    const { getFieldDecorator, getFieldValue } = form;

    return (
      <Modal
        title={<h3>Sign up <Icon type="user-add" /></h3>}
        visible={visible}
        confirmLoading={loading}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <FormItem {...formItemLayout} label="Username">
          {getFieldDecorator("username", {
            validateTrigger: "onBlur",
            rules: [
              { min: 6, message: "Username must be at least 6 characters" },
              { required: true, message: "Username is required" }
            ]
          })(<Input autoComplete="off" />)}
        </FormItem>

        <FormItem {...formItemLayout} label="Email">
          {getFieldDecorator("email", {
            validateTrigger: "onBlur",
            rules: [
              { type: "email", message: "Email is invalid" },
              { required: true, message: "Email is required" }
            ]
          })(<Input type="text" autoComplete="off" />)}
        </FormItem>

        <FormItem extra="Send verification code to email." {...formItemLayout} label="Verification">
          <Row gutter={8}>
            <Col span={14}>
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
          {this.state.send_email_error && 
            <Alert message={this.state.send_email_error} type="error" className="error" />}
        </FormItem>

        <FormItem {...formItemLayout} label="First name">
          {getFieldDecorator("first_name", {
            rules: [{ required: true, message: "First name is required" }]
          })(<Input autoComplete="off" />)}
        </FormItem>

        <FormItem {...formItemLayout} label="Last name">
          {getFieldDecorator("last_name", {
            rules: [{ required: true, message: "Last name is required" }]
          })(<Input />)}
        </FormItem>

        <FormItem {...formItemLayout} label="Password">
          {getFieldDecorator("password", {
            validateTrigger: "onBlur",
            rules: [
              { min: 8, message: "Password must be at least 8 characters" },
              { required: true, message: "Password is required" }
            ]
          })(<Input.Password autoComplete="off" onBlur={this.handleConfirmBlur} />)}
        </FormItem>

        <FormItem {...formItemLayout} label="Confirm password">
          {getFieldDecorator("confirmPassword", {
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
            ]
          })(<Input.Password autoComplete="off" onBlur={this.handleConfirmBlur} />)}
        </FormItem>
        {error && <Alert message={error} type="error" className="error" />}
      </Modal>);
  }
}

export default Form.create()(Register);
