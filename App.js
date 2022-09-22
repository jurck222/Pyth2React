import React, {useState} from 'react';

import {
  TouchableOpacity,
  Button,
  PermissionsAndroid,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';




import {BleManager, Characteristic, Device, LogLevel} from 'react-native-ble-plx';
import {styles} from './Styles/styles';
import {LogBox} from 'react-native';

import {decode, encode} from 'base-64'

if (!global.btoa) {  global.btoa = encode }

if (!global.atob) { global.atob = decode } 

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications


const BLTManager = new BleManager();
BLTManager.setLogLevel("Verbose");
const g_ble_pkt_size = 244;
// g_ble_pkt_size = 132
let g_ble_rx_rflag = 0;
let g_ble_pkt = new ArrayBuffer(g_ble_pkt_size);
console.log(g_ble_pkt);
const CharacteristicUUID ='00002a04-0000-1000-8000-00805f9b34fb';
const ServiceUUID='00001800-0000-1000-8000-00805f9b34fb';
let g_ble_rx_pkt = new ArrayBuffer(g_ble_pkt_size);
const SERVICE_UUID = '197a1398-719d-48cf-87c2-4d0535cb48b1';
//'197A1398-7197-48CF-87C2-4D0535CB48B1';

const CHARACTERISTIC_UUID = '10e0c266-b3f3-4fb5-a0df-3b1570be06e8';




export default function App() {
  //Is a device connected?
  const [isConnected, setIsConnected] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [text, onChangeText] = React.useState("");
  
  //What device is connected?
  const [connectedDevice, setConnectedDevice] = useState();

  const [message, setMessage] = useState('Nothing Yet');
  const [boxvalue, setBoxValue] = useState(false);

   function setCaptureActionAUDIO(action, size){
    let n = 0;
    let pktsize  = 9;
    let pktdata = new ArrayBuffer(pktsize);
    for(let i = 0; i<9;i++){
      pktdata[i]= 0x00;
    }
    
    // generate packet
	  pktdata[0] = 0xA5;
	  pktdata[1] = 0x52;
	  pktdata[2] = 0x05;
	  pktdata[3] = action;
    
    n = 4;
    let tmp = size;
    
    pktdata[n+0] = parseInt(tmp/2**24);
	  tmp = tmp - pktdata[n+0]*(2**24)
	  pktdata[n+1] = parseInt(tmp/2**16);
	  tmp = tmp - pktdata[n+1]*(2**16)
	  pktdata[n+2] = parseInt(tmp/2**8);
	  tmp = tmp - pktdata[n+2]*(2**8)
	  pktdata[n+3] = parseInt(tmp);
    txPktBLE(pktdata, pktsize, 0x0012);
    console.log("-> BLE: setting action mode"+action+"S \n"+size);
    
  }
  
  function getCaptureStatusAUDIO(){
    let n = 0;
    let pktsize = 4;
    let pktdata = new ArrayBuffer(pktsize);

    
    for(let i = 0; i<pktsize; i++){
      pktdata[i]= 0x00;
    }

    // generate packet
    pktdata[0] = 0xA5;
	  pktdata[0] = 0x50;
	  pktdata[0] = 0x00;

    txPktBLE(pktdata, pktsize, 0x0012);
    /*
    print("-> BLE: waiting for reply...");
    */
    if(wait4RespBLE(2000) == 0){
      return;
    }
    //print("-> BLE: Audio capture status: %d\n" %g_ble_rx_pkt[3]);
  }
  function wait4RespBLE(period){
    
    //g_ble_rx_rflag = 0;
    period = period*10;
    for(let i = 0; i<period; i++){
      if (g_ble_rx_rflag == 1){
        g_ble_rx_rflag = 0;
        return 1;
      }
      console.log("here");
      sleepUs(100);
    }
    return 0;
}

function txPktBLE(pkt, pktlen, hnd){
  
  pkt[pktlen-1]=0x00;
  let crc0 = 0;

  for(let i = 0; i<pktlen-1; i++){
    if((crc0  + pkt[i]) > 255){
      crc0 = crc0 + pkt[i] - 256;
    }
    else{
      crc0 = crc0 + pkt[i];
    }
  }

  pkt[pktlen-1] = (crc0^0xFF);
  if((pkt[pktlen-1] + 1) > 255){
    pkt[pktlen-1] = 0;
  }
  else{
    pkt[pktlen-1] = pkt[pktlen-1] + 1;
  }
  
  //# print("-> BLE: Tx\n%s " %(binascii.hexlify(pkt[0:pktlen])))
  g_ble_rx_rflag = 0
  //# this should be true!
  var base64 = btoa(
    new Uint8Array(pkt)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  connectedDevice.writeCharacteristicWithoutResponseForService(SERVICE_UUID,CHARACTERISTIC_UUID,base64);
  
  //device.char_write_handle(hnd, pkt, False);
}

  function sleepMs(s) {
      return new Promise(
        resolve => setTimeout(resolve, s/1000)
      );
  }
  function sleepUs(s) {
    return new Promise(
      resolve => setTimeout(resolve, s/1000000)
    );
}
   function readDataAUDIO(){
    let n = 0;
    let pktsize = 9;
    
    let pktdata = new ArrayBuffer(g_ble_pkt_size);
    let bdata = new ArrayBuffer(2*512*1024);
    let fdata = [];
    let pdata = [];
    for(let i = 0; i<512*1024; i++){
      fdata.push(0);
      pdata.push(0);
    }
    for(let i = 0;i<pktsize;i++){
      pktdata[i] = 0x00;
    }
    
    // generate packet
    pktdata[0] = 0xA5;
    pktdata[1] = 0x53;
    pktdata[2] = 0x00;
    console.log("testing 1");
    txPktBLE(pktdata, 4, 0x0012);
    
    console.log("-> BLE: waiting for reply...")
    if(wait4RespBLE(2000) == 0){
      console.log("-> BLE: write timeout")
      return;
    }
    
    n = 3;	
    let cap_size = 0;
    let cbyte = (g_ble_rx_pkt[n + 0]);
    cap_size = cap_size + parseInt(cbyte)*(2**24);
    cbyte = (g_ble_rx_pkt[n + 1]);
    cap_size = cap_size + parseInt(cbyte)*(2**16);
    cbyte = (g_ble_rx_pkt[n + 2]);
    cap_size = cap_size + parseInt(cbyte)*(2**8);
    cbyte = (g_ble_rx_pkt[n + 3]);
    cap_size = cap_size + parseInt(cbyte);
    
    console.log("-> BLE: preparing for download of "+cap_size+" B");
    
    
    let ridx = 0;
    while(true){
      
      /*print("-> BLE: req block %d - " %ridx, "%d" %cap_size, end='\r');
      # print("-> BLE: req block %d - " %ridx, "%d" %cap_size);
      # generate packet*/
      pktdata[0] = 0xA5;
      pktdata[1] = 0x55;
      pktdata[2] = 0x04;
      n = 3;
      let tmp = ridx;
      
      pktdata[n + 0] = parseInt(tmp/2**24)
      tmp = tmp - pktdata[n + 0]*(2**24)
      pktdata[n + 1] = parseInt(tmp/2**16)
      tmp = tmp - pktdata[n + 1]*(2**16)
      pktdata[n + 2] = parseInt(tmp/2**8)
      tmp = tmp - pktdata[n + 2]*(2**8)
      pktdata[n + 3] = parseInt(tmp);
      
      txPktBLE(pktdata, 8, 0x0012);
      /*
      # print("-> BLE: waiting for data %d..." %ridx);
      */
      if(wait4RespBLE(3000) == 0){
        break;
      }
      
      if(g_ble_rx_pkt[1] != 0x56){
        print("-> BLE: error unexpected packet "+g_ble_rx_pkt[1]+" - need 0x56");
        return;
      }
  
      let addr = parseInt(g_ble_rx_pkt[3])*256*256*256;
      addr = addr +parseInt(g_ble_rx_pkt[4])*256*256;
      addr = addr +parseInt(g_ble_rx_pkt[5])*256;
      addr = addr +parseInt(g_ble_rx_pkt[6]);
      
      
      let rxed_bytes = (g_ble_rx_pkt[2]-4);
      /*
      # print("-> BLE: A: %d " %addr, " R: %d" %ridx, "Rx: %d" %rxed_bytes);
      */
      n = 0;
      
      if(addr == ridx){
        for (let i = 0; i<rxed_bytes; i=i+2){
          
          tmp = parseInt(g_ble_rx_pkt[7+i+1])*256 + parseInt(g_ble_rx_pkt[7+i]);
          
          fdata[ridx+n] = tmp;
          pdata[ridx+n] = tmp;
          // print("-> BLE: %d " %g_ble_rx_pkt[7+k], " %d" %g_ble_rx_pkt[7+k+1]);
          n =n+ 1;
        }
          
        
        rtx = 0;
        ridx =ridx + n;
      }
      else{
        rtx =rtx + rtx + 1;
        //# print("-> BLE: RTX %d\n" %rtx);
        console.log(`-> BLE: RTX:${rtx}`)
        if(rtx >= 3){
          //print("-> BLE: retransmission timeout\n");
          console.log("-> BLE: retransmission timeout\n")
          return;
        }
      }
      
      if(ridx >= cap_size){
        break;
      }
        
    }
    
    /*print("-> BLE: req block %d - " %ridx, "%d" %cap_size, end='\r');
    tx_etime  = datetime.datetime.now();
    tx_time = tx_etime - tx_btime;
    print("\n\n-> BLE: file downloaded in %s ms\n" %(int(tx_time.total_seconds() * 1000)));
    print("-> 0: %d " %fdata[0], "1: %d\n" %fdata[1]);*/
    
    n = 0;
    let res;
    
    for(let i = 0;i<cap_size;i++){
      tmp = fdata[i];
      res = getInt64Bytes(tmp);
      bdata[n] = res[1];
      bdata[n+1] = res[0];
      n =n+ 2;
    }
    console.log("done");
    /*
    s1f_name = "audio.bin";
    s1f_fid = open(s1f_name, 'wb');
    s1f_fid.write(bdata[0:cap_size*2]);
    s1f_fid.close();
    
    wav_header =  wav.getHeaderWAV(bdata[0:cap_size*2]);
    file = open("audio.wav", "wb");
    file.write(wav_header);
    file.write(bdata[0:cap_size*2]);
    file.close();
    */
  }
  function getInt64Bytes(x) {
    let y= Math.floor(x/2**32);
    return [y,(y<<8),(y<<16),(y<<24), x,(x<<8),(x<<16),(x<<24)].map(z=> z>>>24)
  }
  // Scans availbale BLT Devices and then call connectDevice
  async function scanDevices() {
    console.log(g_ble_pkt.byteLength);
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permission Localisation Bluetooth',
        message: 'Requirement for Bluetooth',
        buttonNeutral: 'Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ).then(answere => {
      console.log('scanning');
      // display the Activityindicator

      BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn(error);
        }

        if (scannedDevice && scannedDevice.name == 'Audio PCM Streamer') {
          BLTManager.stopDeviceScan();
          connectDevice(scannedDevice);
        }
      });

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        BLTManager.stopDeviceScan();
      }, 5000);
    });
  }

  // handle the device disconnection (poorly)
  async function disconnectDevice() {
    console.log('Disconnecting start');

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction('messagetransaction');
        BLTManager.cancelTransaction('nightmodetransaction');

        BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
          console.log('DC completed'),
        );
      }

      const connectionStatus = await connectedDevice.isConnected();
      if (!connectionStatus) {
        setIsConnected(false);
      }
    }
  }
  async function connectDevice(device) {
    console.log('connecting to Device:', device.name);

    device
      .connect()
      .then(device => {
        setConnectedDevice(device);
        setIsConnected(true);
        console.log(device.discoverAllServicesAndCharacteristics())
        setMessage("Connected to: "+device.name);
        return device.discoverAllServicesAndCharacteristics();
      })
      
    }
   function start(){
    
    let samples2capture = 1600*4;
    connectedDevice.requestMTU(247);
    setCaptureActionAUDIO(1, samples2capture);
    sleepMs(2000 + samples2capture/16);
    
    readDataAUDIO();
  }
  
  return (
    <View>
      <View style={{paddingBottom: 200}}></View>

      {/* Title */}
      <View style={styles.rowView}>
        <Text style={styles.titleText}>Audio PCM Streamer</Text>
      </View>

      <View style={{paddingBottom: 20}}></View>

      {/* Connect Button */}
      <View style={styles.rowView}>
        <TouchableOpacity style={{width: 120}}>
          {!isConnected ? (
            <Button
              title="Connect"
              onPress={() => {
                scanDevices();
              }}
              disabled={false}
            />
          ) : (
            <Button
              title="Disonnect"
              onPress={() => {
                disconnectDevice();
              }}
              disabled={false}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={{paddingBottom: 20}}></View>

      {/* Monitored Value */}

      <View style={styles.rowView}>
        <Text style={styles.baseText}>{message}</Text>
      </View>

      <View style={{paddingBottom: 100}}></View>

      {/* Checkbox */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Please choose a filename</Text>
            <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />
      <View style={styles.pressableView}>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>
            <View styles={{width:10}}></View>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            ><Text style={styles.textStyle}>Cancel</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {isConnected &&
        <View style={{width: 150, marginLeft: 110,
        }}>
        
        <Button style={styles.buttons} title='Record' onPress={()=>start()}></Button>
        <View style={{paddingBottom: 20}}></View>
        <Button style={styles.buttons} title='test2'></Button>
        <View style={{paddingBottom: 20}}></View>
        <Button style={styles.buttons} title='test3'></Button>
        </View>
      }
      
    </View>
  );
}