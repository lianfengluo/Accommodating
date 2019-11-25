import React from "react";
import { Form, Modal, Input, Alert, Row, Col, Button, notification } from "antd";
import { GetVerificationCodeExists, ResetPassword } from "./action.js";


const FormItem = Form.Item;

class ResetForm extends React.Component {
  state = {
    loading: false,
    error: null,
    reset_error: null,
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
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  onErrorSendEmail = (data) => {
    if (!data) return;
    if ("errors" in data) {
      let seconds = parseInt(data.errors);
      this.setState({
        error: `Try to send it ${data.errors}s later.`,
        disabled_button: true,
        email_info: `Sent Email (${seconds})`
      });
      this.time_fun(seconds - 1, this);
    } else if ("email" in data) {
      this.setState({
        error: `${data.email}`,
        disabled_button: false,
        email_info: `Send Email`
      });
    }
  }
  openNotification = (data) => {
    notification.open({
      message: `User: ${data.username}`,
      description:
        'Your password have been updated!'
    });
  };
  onSuccessResetPass = (data) => {
    // handle the submitting if the user sending email succeed
    this.openNotification(data);
    this.setState({ loading: false });
  }
  onErrorResetPass = (data) => {
    if (!data) return;
    // handle the submitting if the user sending email error
    this.setState({
      loading: false,
      reset_error: data.errors
    });
  }
  resetPassword = () => {
    const { form } = this.props;

    form.validateFields((err, values) => {
      if (err) return;

      this.setState({ loading: true });
      ResetPassword(values, this.onSuccessResetPass, this.onErrorResetPass);
    });
  }
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
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
  sendMail = () => {
    if (this.state.disabled_button) return;
    const { form } = this.props;
    form.validateFields(["email"], (err, values) => {
      if (err) return;
      this.setState({
        disabled_button: true,
        email_info: `Sending Email..`,
        error: null,
      });
      GetVerificationCodeExists(values, this.onSuccessSendEmail, this.onErrorSendEmail);
    });
  }
  handleCancel = () => {
    const { closeModal } = this.props;
    const email = this.props.form.getFieldValue("email");
    this.props.form.setFields({
      email: {
        value: email,
      },
    });
    closeModal();
  };

  render() {
    const { form, visible } = this.props;
    const { error, loading, reset_error } = this.state;
    const { getFieldDecorator } = form;

    return (
      <Modal
        title={`Reset email`}
        visible={visible}
        confirmLoading={loading}
        onCancel={this.handleCancel}
        onOk={this.resetPassword}
      >
        <FormItem extra="Send verification code to email." >
          <Row gutter={8}>
            <Col span={12}>
              {getFieldDecorator('email', {
                rules: [{ type: "email", message: "Email is invalid" },
                { required: true, message: "Email is required" }],
              })(<Input type="text" placeholder="Email" />)}
            </Col>
            <Col span={12}>
              <Button onClick={() => this.sendMail()} disabled={this.state.disabled_button}>    
                {this.state.email_info}
              </Button>
            </Col>
          </Row>
          {error && <Alert message={error} type="error" className="error" />}
        </FormItem>
        <FormItem >
          <Row gutter={8}>
            <Col span={12}>
              {getFieldDecorator('verification', {
                rules: [
                  { len: 6, message: "Verification code will be length of 6." },
                  { required: true, message: "Verification code is required." }
                ],
              })(<Input placeholder="Enter your verification code" />)}
            </Col>
          </Row>
        </FormItem>
        <FormItem>
          <Row gutter={8}>
            <Col span={12}>
              {getFieldDecorator("password", {
                validateTrigger: "onBlur",
                rules: [
                  { min: 8, message: "Password must be at least 8 characters" },
                  { required: true, message: "Password is required" }
                ]
              })(<Input.Password autoComplete="off" onBlur={this.handleConfirmBlur} 
                    placeholder="Enter your password" />)}
            </Col>
          </Row>
        </FormItem>
        {reset_error && <Alert message={reset_error} type="error" className="error" />}
      </Modal>
    );
  }
}

export default Form.create()(ResetForm);
