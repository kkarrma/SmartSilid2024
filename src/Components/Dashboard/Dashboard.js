// import React from 'react';
// import './Dashboard.css';

// function Dashboard() {
//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <div class="left-head">
//           <div class="head-logo"><i class="fa-solid fa-circle"></i> &nbsp; </div>
//           <div class="head-atec">
//               <span>ATEC</span> &nbsp; TECHNOLOGICAL COLLEGE
//           </div>
//         </div>
//         <div class="right-head">
//           <div class="prof-icon"><i class="fa-regular fa-user"></i></div>
//           <div class="prof-name">Juan Dela Cruz</div>
//           <div class="drop"><i class="fa-solid fa-angle-right"></i></div>
//         </div>
//       </div>
//       <div className="dashboard-panels-wrapper">
//         <div className="side-panel-L">
//           <div class="in-panel room-sched"></div>
//           <div class="in-panel your-sched"></div>
//           <div class="in-panel logbook"></div>
//           <div class="in-panel rfid-reg"></div>
//         </div>
//         <div className="dashboard-panels">
//           <div className="panel">Panel 1</div>
//           <div className="panel">Panel 2</div>
//           <div className="panel">Panel 3</div>
//           <div className="panel">Panel 4</div>
//         </div>
//         <div className="side-panel-R">
//           Side Panel 2
//         </div>
//       </div>
//       <div className="dashboard-footer">
//         Footer
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
const items1 = ['1', '2', '3'].map((key) => ({
  key,
  label: `nav ${key}`,
}));
const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);
  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,
    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});
const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items1}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        />
      </Header>
      <Content
        style={{
          padding: '0 48px',
        }}
      >
        <Breadcrumb
          style={{
            margin: '16px 0',
          }}
        >
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <Layout
          style={{
            padding: '24px 0',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Sider
            style={{
              background: colorBgContainer,
            }}
            width={200}
          >
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{
                height: '100%',
              }}
              items={items2}
            />
          </Sider>
          <Content
            style={{
              padding: '0 24px',
              minHeight: 280,
            }}
          >
            Content
          </Content>
        </Layout>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};
export default App;