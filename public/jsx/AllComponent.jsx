// Create a ES6 class component
// class Person extends React.Component {
//     // Use the render function to return JSX component

//     render() {
//         return (
//             <div className="person-info">
//                 <h3>Id: {this.props.Id}</h3>
//                 <ul>
//                     <li>Full Name: {this.props.fullName}</li>
//                     <li>account: {this.props.account}</li>
//                 </ul>
//             </div>
//         );
//     }
// }
function testing(number) {
  alert("you click join slot:" + number)
}

class BlankTemp extends React.Component {
  render() {
    return (
      <div></div>
    )
  }
}

class LobbyWaitingState extends React.Component {
  render() {
    if (this.props.isRoomMaster == false) {
      if (this.props.user1 == "" || this.props.user2 == "") {
        if (this.props.user1 == "") {
          return (
            <div>
              <button onClick={() => leaveRoom(this.props.roomId)}>Thoát phòng</button><br />
              <h1>Room Id: {this.props.roomId}</h1>
              <h2> Chủ phòng: {this.props.roomMaster}</h2>
              <br />
              Người chơi X: {this.props.user1 == "" ? '' : this.props.user1} <button onClick={() => clickJoinSlot(1, this.props.roomId)} >Vào</button> <br />
              Người chơi O: {this.props.user2 == "" ? '' : this.props.user2}
            </div>
          )
        }
        if (this.props.user2 == "") {
          return (
            <div>
              <button onClick={() => leaveRoom(this.props.roomId)}>Thoát phòng</button><br />
              <h1>Room Id: {this.props.roomId}</h1>
              <h2> Chủ phòng: {this.props.roomMaster}</h2>
              <br />
              Người chơi X: {this.props.user1 == "" ? '' : this.props.user1} <br />
              Người chơi O: {this.props.user2 == "" ? '' : this.props.user2} <button onClick={() => clickJoinSlot(2, this.props.roomId)} >Vào</button>
            </div>
          )
        }
      } else {
        return (
          <div>
            <button onClick={() => leaveRoom(this.props.roomId)}>Thoát phòng</button><br />
            <h1>Room Id: {this.props.roomId}</h1>
            <h2> Chủ phòng: {this.props.roomMaster}</h2>
            <br />
            Người chơi X: {this.props.user1 == "" ? '' : this.props.user1}<br />
            Người chơi O: {this.props.user2 == "" ? '' : this.props.user2}
          </div>
        )
      }
    } else {
      if (this.props.user1 == "" || this.props.user2 == "") {
        if (this.props.user1 == "") {
          return (
            <div>
              <button onClick={() => leaveRoom(this.props.roomId)}>Thoát phòng</button><br />
              <h1>Room Id: {this.props.roomId}</h1>
              <h2> Chủ phòng: {this.props.roomMaster}</h2>
              <br />
              Người chơi X: {this.props.user1 == "" ? '' : this.props.user1} <button onClick={() => clickJoinSlot(1, this.props.roomId)} >Vào</button> <br />
              Người chơi O: {this.props.user2 == "" ? '' : this.props.user2}<br />
              <button onClick={() => startGame(this.props.roomId)} > Bắt đầu</button>
            </div>
          )
        }
        if (this.props.user2 == "") {
          return (
            <div>
              <button onClick={() => leaveRoom(this.props.roomId)}>Thoát phòng</button><br />
              <h1>Room Id: {this.props.roomId}</h1>
              <h2> Chủ phòng: {this.props.roomMaster}</h2>
              <br />
              Người chơi X: {this.props.user1 == "" ? '' : this.props.user1} <br />
              Người chơi O: {this.props.user2 == "" ? '' : this.props.user2} <button onClick={() => clickJoinSlot(2, this.props.roomId)} >Vào</button>
              <br />
              <button onClick={() => startGame(this.props.roomId)} > Bắt đầu</button>
            </div>
          )
        }
      } else {
        return (
          <div>
            <button onClick={() => leaveRoom(this.props.roomId)}>Thoát phòng</button><br />
            <h1>Room Id: {this.props.roomId}</h1>
            <h2> Chủ phòng: {this.props.roomMaster}</h2>
            <br />
            Người chơi X: {this.props.user1 == "" ? '' : this.props.user1}<br />
            Người chơi O: {this.props.user2 == "" ? '' : this.props.user2}
            <br />
            <button onClick={() => startGame(this.props.roomId)} > Bắt đầu</button>
          </div>
        )
      }
    }
  }
}

class LobbyListViewer extends React.Component {
  render() {
    var listViewer = [];
    for (var i = 0; i < this.props.listViewer.length; i++) {
      var t = this.props.listViewer[i];
      listViewer.push(<div >{t}</div>);
    }

    return (
      <div>
        {listViewer}<br />
        <button onClick={() => joinListviewer(this.props.roomId)}>Vào xem</button>
      </div>
    )
  }
}


class RoomItemShow extends React.Component {
  render() {
    return (
      <div className="border">
        RoomID: {this.props.roomId} ({this.props.state})(view:{this.props.viewNumber})  <a href="#" onClick={() => quickJoinRoom(this.props.roomId)} > Vào</a>
        <br />
        Slot: {this.props.slot}
      </div>
    )
  }
}

class RoomList extends React.Component {
  render() {
    var allRoom = [];
    for (var i = 0; i < this.props.roomList.length; i++) {
      var t = this.props.roomList[i];
      allRoom.push(<RoomItemShow roomId={t.roomId} state={t.state} viewNumber={t.numberViewer} slot={t.slot} />);
    }
    return (
      <div>
        {allRoom}
      </div>

    )
  }
}

class MyModal extends React.Component {
  render() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">

          
        <div className="modal-header">
            <h4 className="modal-title">{this.props.header}</h4>
            <button type="button" className="close" data-dismiss="modal">&times;</button>
          </div>

          
        <div className="modal-body">
            {this.props.body}
        </div>
          
        <div className="modal-footer">
            <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    )
  }
}

class MyCell extends React.Component {
  render() {
    // console.log("props cell",this.props);
    if (this.props.isLastStep) {
      if (this.props.isPlayer == true) {
        if (this.props.canClick == true) {
          return (
            <td onClick={() => clickCell(this.props.roomId, this.props.i, this.props.j)}><b><u>{this.props.displayValue} </u></b>  </td>
          )
        } else {
          return (
            <td ><b><u>{this.props.displayValue} </u></b> </td>
          )

        }
      } else {
        return (
          <td ><b><u>{this.props.displayValue} </u></b> </td>
        )
      }
    } else {
      if (this.props.isPlayer == true) {
        if (this.props.canClick == true) {
          return (
            <td onClick={() => clickCell(this.props.roomId, this.props.i, this.props.j)}>{this.props.displayValue}</td>
          )
        } else {
          return (
            <td >{this.props.displayValue}</td>
          )

        }
      } else {
        return (
          <td >{this.props.displayValue}</td>
        )
      }
    }


  }
}

class GameRender extends React.Component {
  render() {
    var rows = [];
    for (var i = 0; i < this.props.matrixArr.length; i++) {
      var row = this.props.matrixArr[i];
      var listCell = [];
      for (var j = 0; j < row.length; j++) {
        var canClick = true;

        var value = "";
        var thisLastStep = false;
        if (row[j] == 1) {
          value = "X";
          if (this.props.lastStep.row == i && this.props.lastStep.col == j) {
            thisLastStep = true;
          }
          canClick = false;
        }
        if (row[j] == 2) {
          value = "O";
          if (this.props.lastStep.row == i && this.props.lastStep.col == j) {
            thisLastStep = true;
          }
          canClick = false;
        }


        // value = "r" + i + "c" + j

        listCell.push(<MyCell i={i} j={j} roomId={this.props.roomId} isPlayer={this.props.isPlayer} isLastStep={thisLastStep} canClick={canClick} displayValue={value} />);
      }
      rows.push(<tr>{listCell}</tr>)
    }
    var luot = (this.props.nextStep == 1 ? "Lượt X" : "Lượt O");
    if (this.props.user1 == username) {
      luot = (this.props.nextStep == 1 ? "Lượt Bạn" : "Lượt đối thủ");
    }
    if (this.props.user2 == username) {
      luot = (this.props.nextStep == 2 ? "Lượt Bạn" : "Lượt đối thủ");
    }
    if (this.props.gameIsDone == true && this.props.isRoomMaster == true) {
      return (
        <div>
          <button onClick={() => reloadGame(this.props.roomId)}>Reload Game</button><br />
          X:{this.props.user1} || O:{this.props.user2}<br />
          {luot}
          <br />
          <table id="myTable" className="table table-bordered table-dark fixed" >
            {rows}
          </table>
        </div>
      )
    } else {
      return (
        <div>
          <b>X</b>:{this.props.user1} || <b>O</b>:{this.props.user2}<br />
          {luot}
          <br />
          <table id="myTable" className="table table-bordered table-dark fixed" >
            {rows}
          </table>
        </div>
      )
    }


  }
}

class UsernameOfListUser extends React.Component{
  render(){
    return(
      <div> 
        <a href="#" onClick={()=>getUserInfo(this.props.username)} >{this.props.username}</a> {this.props.state}
      </div>
    )
  }
}
class ListUserOnline extends React.Component {
  render() {
    var listOnline = [];
    for (var i = 0; i < this.props.clientList.length; i++) {
      listOnline.push(<UsernameOfListUser username={this.props.clientList[i].username} state={this.props.clientList[i].state} />)
    }
    return (
      <div>
        List online<br />
        {listOnline}
      </div>
    )
  }
}

// class ListUser extends React.Component{




//   render() {
//     var listItems = this.props.data.list.map(e => (
//           <Person key={e.Id.toString()} Id={e.Id.toString()} fullName={e.FullName} account={e.UserName} />
//     ));
//     return (
//         <div >
//             {listItems}
//         </div>
//     );
//   }
// }
// var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function() {
//          if (this.readyState == 4 && this.status == 200) {
//               var data=JSON.parse(this.responseText);
//               console.log(data);
//               ReactDOM.render(
//                 <ListUser data={data} />, element1
//               )
//          }
//     };
// xhttp.open("GET", "http://localhost:3000/qltk/getlisttk", true);
// xhttp.setRequestHeader("Content-type", "application/json");
// xhttp.send();
// class MyButton extends React.Component {
//     constructor(props) {
//       super(props);

//       this.state = {
//         text: "Please Click me!",
//         clickCount: 0
//       };

//     }

//     // Method updateCount()
//     updateCount() {
//       this.setState(function(prevState, props) {
//         var obj={
//             clickCount: prevState.clickCount + 1,
//             text: "Clicked"
//           };
//         return obj;
//       });
//     }


//     render() {

//       return (
//         <button onClick={()=>{
//             this.updateCount();
//         }}>
//           {this.state.text} : {this.state.clickCount}
//         </button>
//       );
//     }
//   }

// Person.defaultProps={
//     firstName:"this first name",
//     lastName:"thist last name"
// }


// const element1 = document.getElementById('person1')
// const element2 = document.getElementById('person2')

// Use the ReactDOM.render to show your component on the browser


// Use the ReactDOM.render to show your component on the browser
// ReactDOM.render(
//     <Person personNo='2'  lastName='Trump' />, element2
// )

//button
// Render
// ReactDOM.render(<MyButton />, document.getElementById("button1"));

// Render
// ReactDOM.render(<MyButton />, document.getElementById("button2"));
///socketttttttttttttttttttt
var socket = null;
var username = document.getElementById("username").value;
var token = document.getElementById("token").value;
function ketNoiSocket() {
  // if(socket!=null){
  //     socket.disconnect();
  // }

  socket = io(window.location.hostname + ':3002', { query: { username: username, token: token } }).connect();
  var obj = { username: username, token: token }
  socket.emit('SYSTEM_CALL_INIT_ALL', JSON.stringify(obj));
  ReactDOM.render(<MyModal />,document.getElementById('myModal'));


  socket.on('SYSTEM_RESPONSE_INIT_ALL', function (data) {
    console.log(data);
    var _data = JSON.parse(data);
    //clientList[]: {username, state}
    //roomList[]:{roomId, state, roomMaster, numberViewer}

    // document.getElementById('list-user-online').innerHTML = buildListUserOnline(_data.clientList);
    ReactDOM.render(<ListUserOnline clientList={_data.clientList} />, document.getElementById('list-user-online'));
    ReactDOM.render(<RoomList roomList={_data.roomList} />, document.getElementById('room-list'));
    // buildRoomList(_data.roomList);
  })


  socket.on('SYSTEM_RESPONSE_ERROR', function (data) {
    var _data = JSON.parse(data);
    console.log(data);
    alert(_data.message);
  });


  socket.on('SYSTEM_RESPONSE_SHOW_MODAL',function (data) {
    var _data = JSON.parse(data);
    console.log(data);
    ReactDOM.render(<MyModal header={_data.header} body={_data.body} />,document.getElementById('myModal'));
    $('#myModal').modal();
  });

  socket.on('SYSTEM_RESPONSE_LOAD_MAIN_ROOM_CONTENT', function (data) {
    var _data = JSON.parse(data);
    console.log(data);

    if (_data.isStart == true) {
      ReactDOM.render(
        React.createElement(GameRender, _data, null), document.getElementById('main-content')
      );
    } else {
      ReactDOM.render(
        React.createElement(LobbyWaitingState, _data, null), document.getElementById('main-content')
      );
    }
    // ReactDOM.render(
    //   React.createElement(GameRender, _data, null), document.getElementById('main-content')
    // );

  });

  socket.on('SYSTEM_RESPONSE_LOAD_LIST_VIEWER', function (data) {
    var _data = JSON.parse(data);
    console.log(data);
    console.log("co yeu cau load list viewer");
    ReactDOM.render(<LobbyListViewer listViewer={_data.listViewer} roomId={_data.roomId} />, document.getElementById('room-listviewer'))
    // document.getElementById('room-listviewer').innerHTML = buildListViewerInRoom(_data);
  });

  socket.on('SYSTEM_RESPONSE_CLEAR_MAIN', function (data) {
    var _data = JSON.parse(data);
    console.log(data);
    ReactDOM.render(<BlankTemp />, document.getElementById('main-content'));
    ReactDOM.render(<BlankTemp />, document.getElementById('room-listviewer'))
  });

}
function joinListviewer(roomId) {
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(roomId)
  }
  socket.emit("SYSTEM_CALL_JOIN_LISTVIEWER", JSON.stringify(obj));
}
function leaveRoom(roomId) {
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(roomId)
  }
  socket.emit("SYSTEM_CALL_LEAVE_ROOM", JSON.stringify(obj));
}

function getUserInfo(_username) {
  var obj = {
    username:username,
    username_check: _username,
    token: token,
  }
  socket.emit('SYSTEM_CALL_GET_USER_INFO',JSON.stringify(obj))
}

function joinRoom() {
  var number = document.getElementById("txtbRoomId").value;
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(number)
  }
  socket.emit("SYSTEM_CALL_JOIN_ROOM", JSON.stringify(obj))
}
function quickJoinRoom(roomId) {
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(roomId)
  }
  socket.emit("SYSTEM_CALL_JOIN_ROOM", JSON.stringify(obj))
}

function createRoom() {
  var number = document.getElementById("txtbRoomId").value;
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(number)
  }
  socket.emit("SYSTEM_CALL_CREATE_ROOM", JSON.stringify(obj))
}

function clickCell(roomId, i, j) {
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(roomId),
    row: i,
    col: j,
  }
  socket.emit("SYSTEM_CALL_SEND_STEP", JSON.stringify(obj));
}

function clickJoinSlot(slotNumber, roomId) {
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(roomId),
    slotNumber: parseInt(slotNumber)
  }
  socket.emit("SYSTEM_CALL_JOIN_SLOT", JSON.stringify(obj));
}

function startGame(roomId) {
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(roomId)
  }
  socket.emit("SYSTEM_CALL_START_GAME", JSON.stringify(obj));

}

function reloadGame(roomId) {
  var obj = {
    username: username,
    token: token,
    roomId: parseInt(roomId)
  }
  socket.emit("SYSTEM_CALL_RELOAD_GAME", JSON.stringify(obj));
}

//build main game thuần script
function buildMainGame(obj) {
  var htmlRaw = "";
  htmlRaw += "RoomID:" + obj.roomId + "<br>";
  htmlRaw += "Chủ phòng:" + obj.roomMaster + "<br>";
  htmlRaw += "<br><br>Người chơi X:" + obj.user1 + "<br>"
  htmlRaw += "Người chơi O:" + obj.user2 + "<br>";
  return htmlRaw;
}
//build list online thuần javascript
function buildListUserOnline(obj) {
  var raw = "";
  for (var i = 0; i < obj.length; i++) {
    raw += obj[i].username + " (" + obj[i].state + ")" + "<br>";
  }
  return raw;
}

//build list viewer thuần javascript
function buildListViewerInRoom(obj) {
  var raw = "";
  for (var i = 0; i < obj.length; i++) {
    raw += obj[i] + "<br>";
  }
  return raw;
}


//build room thuần javascript
function buildRoomList(obj) {
  console.log(obj);
  var tbl = document.getElementById("room-list");
  tbl.innerHTML = "";
  for (var i = 0; i < obj.length; i++) {
    var tr = document.createElement("tr");
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell1Doc = "roomId:" + obj[i].roomId + " (" + obj[i].state + ")" + "(view:" + obj[i].numberViewer + ")";
    var a = document.createElement("a");
    a.href = "#";
    a.setAttribute("onClick", "quickJoin(" + obj[i].roomId + ")");
    // a.title="Vào";
    a.appendChild(document.createTextNode("Vào"));
    cell1.appendChild(document.createTextNode(cell1Doc));
    cell2.appendChild(a);
    tr.appendChild(cell1);
    tr.appendChild(cell2);
    tbl.appendChild(tr);
  }
}

//////////////////////////end build room thuần javascript



var count = 0;
function change(i, j) {
  console.log("you click " + i + " " + j);
  // var value = document.getElementById("myTable").rows[i].cells[j];
  console.log("value:" + value)
  if (value == "") {
    var t = (value === "" && count % 2 == 0) ? "x" : "o";
    // document.getElementById("luot").innerHTML = "Lượt " + ((t === "x") ? "y" : "x");
    document.getElementById("myTable").rows[i].cells[j].innerHTML = t;
    //alert("you clicked: cell "+myobj.cellIndex+", row:"+myobj.parentElement.rowIndex);
    count++;

  }
}
ketNoiSocket();