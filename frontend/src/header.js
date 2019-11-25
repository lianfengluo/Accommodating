import React from 'react';
import {
  PageHeader,
  Badge,
  Icon,
  Button,
  Input,
  Avatar,
  Menu,
  Dropdown,
  Row
} from 'antd';
import { SubmitLogout } from './user/action.js';
import { NavLink } from 'react-router-dom';
import './App.css';
import { withRouter } from 'react-router-dom';
import { GetUserId } from './user/action.js'
// The title of the app
export const WEB_TITLE = <div style={{
  cursor: "pointer",
  fontSize: "35px"
}}>Accommodating</div>;
const { Search } = Input;
// The len between the icon on the header of the app
const gap_len = "15px";

// A search bar for the user
const search_user = (history, target) => {
  const { value } = target;
  GetUserId({ username: value }, ({ id }) => {
    // clear the target value
    target.value = '';
    history.push(`/user/${id}`)
  },
    () => {
      target.value = '';
      target.placeholder = "Invalid input username";
      setTimeout(() => { target.placeholder = "Input the username"; }, 2000);
    })
}

/**
 * A menu that is the shown after click on the user image icon
 * @param {router history} history 
 */
const menu = (history) => {
  return (
    <Menu>
      <Menu.Item key="0" style={{ fontWeight: 600 }}>
        <NavLink to={`/user/${localStorage.getItem("id")}/`}>User center</NavLink>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" style={{ fontWeight: 600 }}>
        <NavLink to={`/profile`}>Edit profile</NavLink>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2"
        style={{ fontWeight: 600 }}
        onClick={() => {
          SubmitLogout(history);
        }}>
        Logout
      </Menu.Item>
    </Menu>
  )
}
// Making a title link component
const WEB_TITLE_Component = <NavLink className="website-title" to="/">{WEB_TITLE}</NavLink>

/**
 * A header react component
 * Before login it contains:
 * The app title, the user search bar and sign in button
 * 
 * After login it contains:
 * The app title, the user search bar and the advisetise button, inbox, wisheslist and user (menu)
 */
class Header extends React.Component {
  User_search_place = (
    <div>
      <Search
        className="user-search-input" placeholder="Input the username"
        onSearch={(_, e) => { search_user(this.props.history, e.target) }}
      />
    </div>
  )
  state = { count: "0" }
  update(count) {
    this.setState({ count: count });
  }
  componentDidMount() {
    this.props.childRef(this)
  }
  render() {
    const { history } = this.props;
    if (!localStorage.getItem('token')) {
      // not login
      return (<PageHeader className={"Page-header"}
        subTitle={this.User_search_place} title={WEB_TITLE_Component}
        extra={
          <Button size='large' >
            <NavLink to="/login" onClick={() => {
              localStorage.setItem(
                'url_before_login', history.location.pathname)
            }}>Sign in</NavLink>
          </Button>}
      />
      )
    }
    else {
      // logined
      return (<PageHeader className={"Page-header"}
        subTitle={
          this.User_search_place
        }
        title={WEB_TITLE_Component}
        extra={
          <div style={{ marginRight: gap_len }}>
            <Row type="flex" align="bottom">
              <Button key={0} type="danger" style={{
                fontSize: "20px", marginRight: "25px",
                height: "90%"
              }}
              >
                {/* A link to advise the property */}
                <NavLink to='/advertise'>Become a host</NavLink>
              </Button>
              <Badge overflowCount={99} key={1} count={this.state.count} offset={[-15, 10]}>
                <NavLink to='/message/renter'>
                  <Icon style={{ fontSize: "32px", marginRight: gap_len }} type="inbox"
                  />
                </NavLink>
              </Badge>
              <span key={3}>
                <NavLink to="/wisheslist/1">
                  <Icon type="heart" theme="outlined"
                    style={{ fontSize: "32px", marginRight: gap_len }} />
                </NavLink>
              </span>
              <span key={4} style={{ float: 'right', cursor: 'pointer' }}>
                <Dropdown trigger={['click']}
                  overlay={() => menu(history)} key={4}
                  placement="bottomCenter">
                  <Avatar src={localStorage.getItem('image')} alt="Your user image" icon="user" />
                </Dropdown>
              </span>
            </Row>
          </div>}
      />
      )
    }
  }
}
export default withRouter(Header);
