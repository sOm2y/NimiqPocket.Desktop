// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Table, Divider, Tag, Input,  Spin, Tabs, Card, Badge } from 'antd';
import axios from 'axios';
import moment from 'moment';
import routes from '../constants/routes.json';

const Search = Input.Search;
const TabPane = Tabs.TabPane;
moment.locale('zh-cn');

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  constructor(){
    super();

    this.state = {
      loadingBalance:false,
      activeDevices:[],
      inactiveDevices:[],
      balance:0,
      userAddress:'',
      

    };
  }
  componentDidMount(){
   let address = localStorage.getItem('walletAddress');
   if(address){
    this.fetchActiveDevice(address);
    this.fetchInactiveDevice(address);
    this.fetchBalance(address);
   }
  }
  fetchBalance = walletAddress =>{
    axios.get(`http://localhost:8080/api/balance/${walletAddress}`)
    .then(res => {
     
      this.setState({
        balance:res.data.userBalance.balance
      });
      
    })
    .catch(err => {
      console.log(err);
    });
  }
  fetchInactiveDevice = (walletAddress) =>{

    this.setState({
      loadingBalance: true
    });

    axios.get(`http://localhost:8080/api/device/inactive/${walletAddress}`)
    .then(res => {
      // res.data.activeDevices.map(
      //   device => (device.hashrate = this.humanHashes(device.hashrate))
      // );
      this.setState({
        // isBalanceModalOpen: false,
        // loadingBalance: false,

        inactiveDevices: res.data.inactiveDevices,

      });

      
    })
    .catch(err => {
      console.log(err);
    });
  }
   fetchActiveDevice = (walletAddress) =>{

    this.setState({
      loadingBalance: true
    });

    axios.get(`http://localhost:8080/api/device/active/${walletAddress}`)
    .then(res => {
      // res.data.activeDevices.map(
      //   device => (device.hashrate = this.humanHashes(device.hashrate))
      // );
      this.setState({
        isBalanceModalOpen: false,
        loadingBalance: false,

        activeDevices: res.data.activeDevices,
        userAddress:walletAddress
      });
      localStorage.setItem('walletAddress', walletAddress);
      
    })
    .catch(err => {
      console.log(err);
    });
  }

  
  humanHashes = bytes => {
    let thresh = 1000;
    if (Math.abs(bytes) < thresh) {
      return bytes + ' H/s';
    }
    let units = [
      'kH/s',
      'MH/s',
      'GH/s',
      'TH/s',
      'PH/s',
      'EH/s',
      'ZH/s',
      'YH/s'
    ];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  };

  render() {
    const walletAddressColumn = [
      {
        title: '设备识别号',
        dataIndex: 'device',
        key: 'device'
      },
      {
        title: '设备名称',
        dataIndex: 'name'
      },
      {
        title: '实时算力',
        dataIndex: 'hashrate',
        render: hashrate => <span>{this.humanHashes(hashrate)}</span>
      },
      {
        title: '24小时算力',
        dataIndex: 'dayHashrate'
      },
      {
        title: '上次更新',
        dataIndex: 'datetime',
        render: lastUpdate => <a>{ moment(lastUpdate).fromNow()}</a>,
      }
    ];
    
    return (
      <div data-tid="container">
         
      <Card
        title={`${'当前矿池余额'} : ${this.state.balance / 100000} NIM，钱包地址：${this.state.userAddress}`}
        bordered={true}
      >
       <Search
            placeholder="请输入钱包地址"
            onSearch={(value)=>this.fetchDevice(value)}
            enterButton
            style={{marginBottom:20}}
          />

        <Tabs type="card">
    <TabPane tab={<span>在线矿机 <Badge count={this.state.activeDevices && this.state.activeDevices.length} overflowCount={999} style={{ backgroundColor: '#52c41a',fontSize:12 }} /></span>} key="1" >
            <Table pagination={{pageSize:50, pageSizeOptions: ['50', '100', '200']}} rowKey={record => record.deviceId} columns={walletAddressColumn} dataSource={this.state.activeDevices}  loading={this.state.loadingBalance} />
          </TabPane>
          <TabPane tab={<span>掉线矿机 <Badge overflowCount={999} count={this.state.inactiveDevices && this.state.inactiveDevices.length} /></span>} key="2" >
            <Table pagination={{pageSize:50, pageSizeOptions: ['50', '100', '200']}} rowKey={record => record.deviceId} columns={walletAddressColumn} dataSource={this.state.inactiveDevices}  loading={this.state.loadingBalance} />
          </TabPane>
        </Tabs>

        <p>
          {'在线矿机'} :{' '}
          {this.state.activeDevices &&
            this.state.activeDevices.length}{' '}
          |   {'当前总算力'} :{' '}
          {/* {this.state.devices.activeDevices &&
            this.humanHashes(
              this.state.devices.totalActiveDevicesHashrate
            )}{' '} */}
        </p>

        </Card>
      </div>
    );
  }
}
