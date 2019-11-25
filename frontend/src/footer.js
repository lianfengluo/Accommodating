import React from 'react';
import { Layout, Icon } from 'antd';
import './App.css';

const Footer = Layout.Footer;
// The footer of the app
export const My_Footer = () =>
  <Footer style={{ textAlign: 'center' }}>
    JRMA Design ©2019 Created by JRMA Group (Developer: Lianfeng Luo
    <Icon style={{ fontSize: "15px" }}
      type="linkedin"
      onClick={() => {
        window.location.href = "https://www.linkedin.com/in/richard-luo-849a87103/";
      }} />)
  </Footer>

