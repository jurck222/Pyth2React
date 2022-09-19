import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  baseText: {
    fontSize: 15,
    fontFamily: 'Cochin',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rowView: {
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  buttons:{
    padding:15,
    justifyContent: 'space-around',
    width: 20
  },
  centeredView: {
    flex: 1,
   
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    width:300,
    height:210,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    width:100,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    height: 40,
    margin: 12,
    width:200,
    borderWidth: 1,
    padding: 10,
  },
  pressableView:{
    flexDirection:'row',
    justifyContent:'space-between',
  }
});