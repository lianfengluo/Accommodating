import 'antd/dist/antd.css';
import React from 'react';
import { Route, Switch, BrowserRouter as Router, Redirect } from 'react-router-dom';
import Header from './header.js';
import Home from './home/home.js';
import { Login } from './user/login.js';
import Profile from './profile/profile.js';
import Wisheslist from './wisheslist/wisheslist.js';
import Message from './message/message.js';
import { My_Footer as Footer } from './footer.js'
import { UserPage } from './userpage/userpage.js';
import Accommodation from './accommodation/accommodation.js';
import { NoMatch } from './no_match.js';
import Advertise from './accommodation/advertise.js';
import SearchPage from './search/searchpage.js';
import Booking from './booking/booking.js';
import { AllUnreadCount } from './message/action.js';
import './App.css';
import 'react-image-gallery/styles/css/image-gallery.css';

// App component includes route, the header and the footer
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: localStorage.getItem("token"),
    }
    this.count = '0';
    this.new_message = '';
    this.headerComponent = React.createRef();
    this.messageComponent = React.createRef();
  }
  // Get the new message count
  get_message = () => {
    if (this.state.token) {
      AllUnreadCount((data) => {
        this.count = data.count;
        this.new_message = data.new_message;
        this.headerComponent.update(this.count);
        if (window.location.href.indexOf("/message/") !== -1) {
          this.messageComponent.update(this.count, this.new_message);
        }
      });
      // fetch new message every 2s
      setInterval(() => AllUnreadCount((data) => {
        if (data.count !== this.count ||
          JSON.stringify(data.new_message) !== JSON.stringify(this.new_message)) {
          this.count = data.count;
          this.new_message = data.new_message;
          this.headerComponent.update(this.count);
          if (window.location.href.indexOf("/message/") !== -1) {
            this.messageComponent.update(this.count, this.new_message);
          }
        }
      }), 2000);
    }
  }
  componentDidMount() {
    this.get_message();
  }
  // A authenticated component
  AuthenticatedRoute({
    component: Component, path, exact, ...argv
  }) {
    const { token } = this.state;
    return (
      <Route
        exact={exact}
        path={path}
        render={props => {
          return token ? 
          ( <Component {...props} {...argv} />) : 
          (<Redirect to="/" />)
        }
        }
      />
    );
  };
  message_ref = (ref) => {
    this.messageComponent = ref
  }
  render() {
    return (
      <Router basename='/#'>
        <Header count={this.count} childRef={ref => (this.headerComponent = ref)} />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/user/:user' component={UserPage} />
          <Route path='/accommodation/:acc_id' component={Accommodation} />
          <Route path={"/search/:start_time/:end_time/:longitude/:latitude" +
            "/:order_by/:page/:acc_type/:days/:room_count?/"} component={SearchPage} />
          <Route path='/login'
            render={({ history }) => {
              return (<Login loginSucceed={() => {
                this.setState({ token: localStorage.getItem("token") });
                this.get_message();
              }}
                history={history}
                {...this.props}
              />)
            }
            } />
          {this.AuthenticatedRoute({
            path: "/profile",
            component: Profile,
            exact: true
          })}
          {this.AuthenticatedRoute({
            path: "/message/:type",
            component: Message,
            exact: true,
            childRef: this.message_ref,
          })}
          {this.AuthenticatedRoute({
            path: "/booking/:id",
            component: Booking,
            exact: true
          })}
          {this.AuthenticatedRoute({
            path: "/wisheslist/:page",
            component: Wisheslist,
            exact: true
          })}
          {this.AuthenticatedRoute({
            path: "/advertise",
            component: Advertise,
            exact: true
          })}
          <Route component={NoMatch} />
        </Switch>
        <Footer />
      </Router>
    )
  }
}

export default App;
