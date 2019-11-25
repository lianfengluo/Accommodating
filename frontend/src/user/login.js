import React from 'react';
import { Form, Icon, Input, Button, Checkbox, Row, Col } from 'antd';
import { Redirect } from 'react-router-dom';
import Register from './register';
import { Link } from 'react-router-dom';
import ForgotPass from './forgot_password.js'
import { SubmitLogin, SetLocalStorage } from './action'
import '../App.css';
const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registerVisible: false,
      ForgotPassVisible: false,
      ErrorMessage: null,
      confirmDirty: false,
      method: "username"
    }
  }
  componentDidMount() {
    this.props.form.setFieldsValue({
      username: localStorage.getItem("username"),
      email: localStorage.getItem("email"),
    });
  }
  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };
  onSuccess = (data) => {
    // handle the submitting if the user login succeed

    SetLocalStorage(data);
    this.props.loginSucceed();
    this.props.history.push(
      localStorage.getItem('url_before_login') ?
        localStorage.getItem('url_before_login') : '/');
  }
  onError = ({ error }) => {
    // handle the error
    if (!error) return;
    this.setState({
      "ErrorMessage": error,
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.remember) {
          localStorage.setItem('username', values.username);
          localStorage.setItem('email', values.email);
          delete values.remember
        }
        SubmitLogin(values, this.onSuccess, this.onError);
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form user-forms" style={{ width: 350 }}>
        <h1>Sign in ({this.state.method})</h1>
        {
          this.state.ErrorMessage ? <h2 style={{ color: "red" }}>{this.state.ErrorMessage}</h2> : <h2>&nbsp;</h2>
        }
        <div
          style={{ textAlign: "right", zIndex: 999, cursor: "pointer" }}
        >
          <Link
            to="#"
            onClick={() =>
              this.setState(state =>
                state.method === "username" ?
                  { method: "email" } :
                  { method: "username" }
              )
            }
          >Using {this.state.method === "username" ? "email" : "username"}</Link>
        </div>
        {
          this.state.method === "username" ?
            <FormItem>
              {getFieldDecorator('username', {
                initialValue: localStorage.getItem("username"),
                rules: [
                  { min: 6, message: "Username must be at least 6 characters" },
                  { required: true, message: 'Please input your username!' },
                ],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" autoComplete="off" />
              )}
            </FormItem> :
            <FormItem>
              {getFieldDecorator("email", {
                initialValue: localStorage.getItem("email"),
                rules: [
                  { type: "email", message: "Email is invalid" },
                  { required: true, message: "Email is required" }
                ]
              })(<Input prefix={<Icon type="mail" style={{ fontSize: 13 }} />} placeholder="Email" type="email" autoComplete="off" />)}
            </FormItem>
        }

        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input.Password prefix={<Icon type="lock" style={{ fontSize: 13 }} />} placeholder="Password" autoComplete="off" />
          )}
        </FormItem>
        <FormItem>
          <Row>
            <Col span={12} offset={12}>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: false,
              })(
                <Checkbox>Remember me</Checkbox>
              )}</Col>
            <Col span={12} offset={12}>
            <a className="login-form-forgot" onClick={(e) => {
              e.preventDefault();
              this.setState({ ForgotPassVisible: true })
            }}>Forgot password</a>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" 
                className="login-form-button" style={{ width: "100%" }}>
            Log in
          </Button>
          <span> </span>Or <a
            onClick={() => {
              this.setState({ registerVisible: true })
            }}>register now!</a>
          <Register
            visible={this.state.registerVisible}
            closeModal={() =>
              this.setState({ registerVisible: false })
            }
            loginSucceed={this.props.loginSucceed}
            history={this.props.history}
          />
          <ForgotPass visible={this.state.ForgotPassVisible}
            closeModal={() =>
              this.setState({ ForgotPassVisible: false })
            } />
        </FormItem>
      </Form>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export const Login = (props) => {

  return (!localStorage.getItem("token")) ?
    (
      <div style={{ background: '#fff', padding: 24, minWidth: 350 }}>
        <center><WrappedNormalLoginForm {...props} /></center>
      </div>) :
    (
      <Redirect
        to={{ pathname: '/', state: { from: props.location } }}
      />
    )
}