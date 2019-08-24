var express = require('express');
var router = express.Router();
var randomstring = require("randomstring");
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';
var sqlConnector = require('../sqlConnector.js');

var serv = require('http').Server(express())
serv.listen(3002, function () {
    console.log("sv running at port 3002");
})
router.get("/", function (req, res) {

})
var _USERSTT_BAN = "Bận";
var _USERSTT_RANH = "Rảnh";
var _USERSTT_INLOBBY_WAIT = "Chờ bắt đầu";
var _USERSTT_INLOBBY_VIEW = "Đang xem";
var _LOBBYSTT_WAIT = "Đợi bắt đầu";
var _LOBBYSTT_START = "Đang chơi";
var io = require('socket.io')(serv, {});
var clientList = [];
var roomList = [];

io.sockets.on('connection', function (clientSocket) {
    if (clientSocket.handshake.query.username && clientSocket.handshake.query.token) {
        console.log("username:", clientSocket.handshake.query.username, " token:", clientSocket.handshake.query.token);
    } else {
        return;
    }
    var isHave = false;
    for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].username == clientSocket.handshake.query.username) {
            clientList[i].clientSocket.emit('SYSTEM_RESPONSE_ERROR', JSON.stringify({ message: "Có người đăng nhập vào tài khoản của bạn!" }))
            // clientList[i].clientSocket.disconnect();
            clientList[i].clientSocket = clientSocket;
            isHave = true;
            break;
        }
    }
    if (!isHave) clientList.push({ clientSocket: clientSocket, username: clientSocket.handshake.query.username, token: clientSocket.handshake.query.token, state: _USERSTT_RANH, roomId: -1 });
    console.log(io.engine.clientsCount);
    console.log("có người kết nối:" + clientSocket.id);

    //clientSocket.on để bắt sự kiện client gửi đến server.
    clientSocket.on('SYSTEM_CALL_INIT_ALL', function (data) {
        //thực hiện build roomList (hiển thị) và danhsach useronline (kèm trạng thái)
        console.log(data);
        io.sockets.emit('SYSTEM_RESPONSE_INIT_ALL', JSON.stringify({ clientList: buildListUserOnline(), roomList: buildListRoom() }));
        // return clientSocket.emit('SYSTEM_RESPONSE_INIT_ALL',JSON.stringify({clientList:buildListUserOnline(),roomList:buildListRoom()}));
    });

    clientSocket.on('SYSTEM_CALL_RELOAD_GAME',function(data){
        console.log(data);
        var _data=JSON.parse(data);
        reloadGame(_data.username,_data.roomId,_data.token,clientSocket);
    })

    //
    clientSocket.on('SYSTEM_CALL_CREATE_ROOM', function (data) {
        //thực hiện việc tạo phòng
        //data cần : username,roomId,token;
        console.log("SYSTEM_CALL_CREATE_ROOM:", data);
        var _data = JSON.parse(data);
        canCreateRoom(_data.username, _data.roomId, _data.token, function (cb) {
            if (cb.success == false) {
                return clientSocket.emit('SYSTEM_RESPONSE_ERROR', JSON.stringify({ message: cb.message }));
            } else {
                outRoomWhenViewerCreateRoom(_data.username);
                console.log(_data);
                var obj = {
                    roomId: _data.roomId,
                    roomMaster: _data.username,
                    user1: _data.username,
                    user2: "",
                    nextStep: 1,
                    state: _LOBBYSTT_WAIT,
                    isStart: false,
                    listViewer: [],
                    matrixArr: createMatrix(),
                    user1Step: [],
                    user2Step: [],
                    lastStep:{row:-1,col:-1}
                }
                roomList.push(obj);
                changeUserState(_data.username, _USERSTT_INLOBBY_WAIT, _data.roomId);
                clientSocket.emit('SYSTEM_RESPONSE_LOAD_LIST_VIEWER', JSON.stringify(buildListViewer(_data.roomId)));
                clientSocket.emit("SYSTEM_RESPONSE_LOAD_MAIN_ROOM_CONTENT", JSON.stringify(buildMainGame(_data.roomId, true, true)));

                sendReloadRoomAndUserListToClient();
            }
        });
    });
    clientSocket.on('SYSTEM_CALL_SEND_STEP', function (data) {
        console.log(data);
        var _data=JSON.parse(data);
        sendStep(_data.username,_data.roomId,_data.row,_data.col,clientSocket,_data.token);
    })
    //sự kiện vào vị trí chơi
    clientSocket.on('SYSTEM_CALL_JOIN_SLOT', function (data) {
        // 2 trường  hợp: người chơi đổi chỗ, viewer vào chỗ
        var _data = JSON.parse(data);
        joinRoomSlot(_data.username, _data.roomId, _data.token, _data.slotNumber, clientSocket);
    });

    //bắt sự kiện vào room
    clientSocket.on('SYSTEM_CALL_JOIN_ROOM', function (data) {
        // data cần: username,roomId,token;
        console.log("SYSTEM_CALL_JOIN_ROOM:", data);
        var _data = JSON.parse(data);
        joinRoom(_data.username, _data.roomId, _data.token, clientSocket);
    })

    //sự kiện start game
    clientSocket.on('SYSTEM_CALL_START_GAME', function (data) {
        var _data = JSON.parse(data);
        if (_data.username && _data.roomId && _data.token) {
            return clientSocket.emit('SYSTEM_RESPONSE_ERROR', JSON.stringify({ message: "Thiếu thông tin, vui lòng thử lại" }));
        }
        startGame(_data.username, _data.roomId, _data.token, clientSocket);
    })

    //bắt sự kiện disconnect
    clientSocket.on('disconnect', function () {
        for (var i = 0; i < clientList.length; i++) {
            if (clientList[i].clientSocket.id == clientSocket.id) {
                removeRoomAfterMasterDisconectOrOut(clientList[i].username);
                if (clientList[i].roomId != -1) {

                    outRoomWhenViewerDisconnectOrLeave(clientList[i].username, clientList[i].roomId);
                    whenPlayerDisconnectOrLeave(clientList[i].username, clientList[i].roomId);
                }
                clientList.splice(i, 1);
                break;
            }
        }

        clientSocket.disconnect();
        sendReloadRoomAndUserListToClient();

    })
    //người chơi chuyển qua listview. chủ phòng không được chuyển.
    clientSocket.on('SYSTEM_CALL_JOIN_LISTVIEWER',function(data){
        var _data=JSON.parse(data);
        joinListViewer(_data.username,_data.token,_data.roomId,clientSocket);
        console.log(data);
    })
    //người chơi/chủ phòng hoặc listviewer thoát room.
    clientSocket.on('SYSTEM_CALL_LEAVE_ROOM',function(data){
        var _data=JSON.parse(data);
        console.log(data);
        leaveRoom(_data.username,_data.token,_data.roomId,clientSocket);
    })

    //check thong tin co ban cua nguoi choi.
    clientSocket.on('SYSTEM_CALL_GET_USER_INFO',function(data){
        var _data=JSON.parse(data);
        console.log(data);
        getUserInfo(_data.username_check,_data.username,_data.token,clientSocket);
    })


});
function getUserInfo(usernameCheck,username,token,clientSocket){
    if(checkValidateUser(username,token)){
        var query="select *  from (select count(username) as win from game.user_play_log where username=? and isWin=1)  as win_tab, (select count(username) as lose from game.user_play_log where username=? and isWin=0) as lose_tab";
        sqlConnector.query(query,[usernameCheck,usernameCheck],function(err,result){
            if(err){
                console.log(err);
                clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Lỗi hệ thống, thử lại sau!" }));
                return;
            }else{
                var obj={
                    username:usernameCheck,
                    win:result[0].win,
                    lose:result[0].lose,
                    header:"Thông tin người chơi:"+usernameCheck,
                    body:"Tổng trận:"+(result[0].win+result[0].lose)+"\nThẳng:"+result[0].win+"\nThua:"+result[0].lose+"\nTLT:"+parseFloat((result[0].win*100)/(result[0].lose+result[0].win))+'%'
                }
                clientSocket.emit("SYSTEM_RESPONSE_SHOW_MODAL", JSON.stringify(obj));
                return;
            }
        })
    }else{
        clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Sai thông tin, vui lòng thử lại" }));
    }
}

function leaveRoom(username,token,roomId,clientSocket){
    if(checkValidateUser(username,token)){
        for(var i=0;i<roomList.length;i++){
            if(roomId==roomList[i].roomId){
                if(username==roomList[i].roomMaster){
                    clientSocket.emit("SYSTEM_RESPONSE_CLEAR_MAIN", JSON.stringify({ message: "clear main-content" }));
                    removeRoomAfterMasterDisconectOrOut(username);
                    changeUserState(username,_USERSTT_RANH,-1);
                    sendReloadRoomAndUserListToClient();
                    return;
                }
                if(username==roomList[i].user1 || username==roomList[i].user2){
                    var userPos=(username==roomList[i].user1?1:2);
                    roomList[i]['user'+userPos]="";
                    clientSocket.emit("SYSTEM_RESPONSE_CLEAR_MAIN", JSON.stringify({ message: "clear main-content" }));
                    changeUserState(username,_USERSTT_RANH,-1);
                    whenPlayerDisconnectOrLeave(username,roomId);
                    sendReloadListViewerToClient(roomId);
                    sendReloadMainRoomContent(roomId);
                    sendReloadRoomAndUserListToClient();
                    return;
                }
                clientSocket.emit("SYSTEM_RESPONSE_CLEAR_MAIN", JSON.stringify({ message: "clear main-content" }));
                changeUserState(username,_USERSTT_RANH,-1);
                outRoomWhenViewerDisconnectOrLeave(username,roomId);
                
                break;
            }
        }
    }else{
        return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Sai thông tin, vui lòng thử lại" }));
    }
}

function joinListViewer(username,token,roomId,clientSocket){
    if(checkValidateUser(username,token)){
        for(var i=0;i<roomList.length;i++){
            if(roomId==roomList[i].roomId){
                if(roomList[i].user1==username || roomList[i].user2==username){
                    var userPos=(roomList[i].user1==username? 1:2);
                    if(username==roomList[i].roomMaster){
                        return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Bạn là chủ phòng, không thể vào xem" }));
                        
                    }
                    roomList[i].listViewer.push({username:username,clientSocket:clientSocket});
                    roomList[i]['user'+userPos]="";
                    changeUserState(username,_USERSTT_INLOBBY_VIEW,roomId);
                    sendReloadListViewerToClient(roomId);
                    sendReloadMainRoomContent(roomId);
                    sendReloadRoomAndUserListToClient();
                    return;
                }
                break;
            }
        }
    }else{
        return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Sai thông tin, vui lòng thử lại" }));
    }
}
function reloadGame(username,roomId,token,clientSocket){
    if(checkValidateUser(username,token)==false){
        return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Sai thông tin, vui lòng thử lại" }));
    }
    for(var i=0;i<roomList.length;i++){
        if(roomList[i].roomId==roomId){
            if(roomList[i].roomMaster!=username){
                return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Bạn không phải chủ phòng, không thể reload game!" }));
            }
            // var obj = {
            //     roomId: roomList[i].roomId,
            //     roomMaster: roomList[i].roomM,
            //     user1: _data.username,
            //     user2: "",
            //     nextStep: 1,
            //     state: _LOBBYSTT_WAIT,
            //     isStart: false,
            //     listViewer: [],
            //     matrixArr: createMatrix(),
            //     user1Step: [],
            //     user2Step: [],
            //     lastStep:{row:-1,col:-1}
            // }
            roomList[i].lastStep={row:-1,col:-1};
            roomList[i].state=_LOBBYSTT_WAIT;
            roomList[i].nextStep=1
            roomList[i].matrixArr=createMatrix();
            roomList[i].user1Step=[];
            roomList[i].user2Step=[];
            roomList[i].isStart=false;
            roomList[i].gameIsDone=false;
            changeUserState(roomList[i].user1,_USERSTT_INLOBBY_WAIT,roomId);
            changeUserState(roomList[i].user2,_USERSTT_INLOBBY_WAIT,roomId);
            sendErrorMessageToRoom(roomId,"Chủ phòng đã reload lại game, khởi tạo lại giao diện lobby!");
            sendReloadMainRoomContent(roomId);
            sendReloadRoomAndUserListToClient();
            break;
        }
    }
}

function sendStep(username,roomId,row,col,clientSocket,token){
    if(checkValidateUser(username,token)==false){
        return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Sai thông tin, vui lòng thử lại" }));
    }
    for(var i=0;i<roomList.length;i++){
        if(roomList[i].roomId==roomId){
            if(roomList[i].matrixArr[row][col] !=0){
                clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Vị trí đã được đánh, vui lòng đánh lại!" }));
            }else{
                
                var currentStep=roomList[i].nextStep;
                if(username != roomList[i]['user'+currentStep]){
                    clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Không phải lượt của bạn!" }));
                    return;
                }
                roomList[i].matrixArr[row][col]=roomList[i].nextStep;
                roomList[i].nextStep= (currentStep == 1? 2:1);
                roomList[i]['user'+currentStep+"Step"].push({row:row,col:col});
                roomList[i].lastStep={row:row,col:col};
                var t=i;
                checkWin(roomList[i].matrixArr,currentStep,row,col,function(mycb){
                    if(mycb.gameIsDone==true){
                        roomList[t].nextStep=-1;
                        roomList[t].gameIsDone=true;
                        sendReloadMainRoomContent(roomId);
                        roomList[i].userWinner=roomList[t]['user'+mycb.winner];
                        updateGameInfoLog(roomList[i]);
                        sendErrorMessageToRoom(roomId,"Người chơi "+roomList[t]['user'+mycb.winner]+" đã chiến thắng!");
                        
                    }else{
                        sendReloadMainRoomContent(roomId);
                    }
                })
            }
            break;
        }
    }
}
function startGame(username, roomId, token, clientSocket) {
    console.log(" room:" + roomId + " username:" + username);
    for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].username == username) {
            if (roomId != clientList[i].roomId || token != clientList[i].token) {
                clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Thông tin sai lệch, vui lòng f5!" }));
                return;
            }
            break;
        }
    }

    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId == roomId) {

            if (roomList[i].roomMaster != username) {
                clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Bạn không phải chủ phòng, không có quyền bắt đầu!" }));
                return;
            }
            if (roomList[i].user1 == "" || roomList[i].user2 == "") {
                console.log("heee")
                clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Không đủ người, trận đấu không thể bắt đầu" }));
                return;
            }
            createGameInfoLog(roomList[i],function(cb){
                if(cb.success==false){
                    clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Khởi tạo lỗi, thử lại sau!" }));
                    return;
                }else{
                    roomList[i].phienId=cb.phienId;
                    roomList[i].isStart = true;
                    roomList[i].state = _LOBBYSTT_START;
                    changeUserState(roomList[i].user1, _LOBBYSTT_START, roomId);
                    changeUserState(roomList[i].user2, _LOBBYSTT_START, roomId);
                    sendReloadMainRoomContent(roomId);
                    sendReloadRoomAndUserListToClient();
                    return;
                }
            })
            
            break;
        }
    }
}

function joinRoomSlot(username, roomId, token, slotNumber, clientSocket) {
    console.log("slot:" + slotNumber + " room:" + roomId + " username:" + username);
    for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].username == username) {
            if (roomId != clientList[i].roomId || token != clientList[i].token) {
                clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Thông tin sai lệch, vui lòng f5!" }));
                return;
            }
            break;
        }
    }
    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId == roomId) {
            var lv = roomList[i].listViewer;
            //check trong listviewer trước
            for (var j = 0; j < lv.length; j++) {
                if (username == lv[j].username) {
                    if (slotNumber == 1) {
                        if (roomList[i].user1 == "") {
                            roomList[i].user1 = username;
                            changeUserState(username, _USERSTT_INLOBBY_WAIT, roomId);
                        } else {
                            return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Vị trí đã có người chơi, thử lại sau!" }));
                        }
                    }
                    if (slotNumber == 2) {
                        if (roomList[i].user2 == "") {
                            roomList[i].user2 = username;
                            changeUserState(username, _USERSTT_INLOBBY_WAIT, roomId);
                        } else {
                            return clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Vị trí đã có người chơi, thử lại sau!" }));
                        }
                    }
                    roomList[i].listViewer.splice(j, 1);
                    sendReloadRoomAndUserListToClient();
                    sendReloadMainRoomContent(roomId);
                    sendReloadListViewerToClient(roomId);
                    return;
                }
            }
            //check trong các slot 1 2
            if (roomList[i].user1 == username || roomList[i].user2 == username) {
                if (roomList[i].user1 == username) {
                    roomList[i].user1 = "";
                    roomList[i].user2 = username;

                } else {
                    roomList[i].user2 = "";
                    roomList[i].user1 = username;
                }
                sendReloadMainRoomContent(roomId);
                return;
            }
        }
    }
    clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Phòng không tồn tại để vào vị trí, vui lòng f5!" }));
}


function whenPlayerDisconnectOrLeave(username, roomId) {
    for (var i = 0; i < roomList.length; i++) {
        if (roomId == roomList[i].roomId) {
            if (roomList[i].user1 == username) {
                roomList[i].user1 = "";
                if (roomList[i].isStart == false) {
                    roomList[i].user1 = "";
                    
                } else {
                    roomList[i].isStart=false;
                    sendErrorMessageToRoom(roomId, "Người chơi " + username + " vừa thoát khỏi phòng, phòng sẽ đc reload lại");
                    roomList[i].matrixArr=createMatrix();
                }
                
                sendReloadMainRoomContent(roomId);
                sendReloadRoomAndUserListToClient();
                break;
            }
            if (roomList[i].user2 == username) {
                roomList[i].user2 = "";
                if (roomList[i].isStart == false) {
                    sendReloadMainRoomContent(roomId);
                } else {
                    roomList[i].isStart=false;
                    roomList[i].matrixArr=createMatrix();
                    sendErrorMessageToRoom(roomId, "Người chơi " + username + " vừa thoát khỏi phòng, phòng sẽ đc reload lại");
                }
                sendReloadMainRoomContent(roomId);
                sendReloadRoomAndUserListToClient();

                break;
            }
            break;
        }
        
    }

}

function outRoomWhenViewerDisconnectOrLeave(username, roomId) {
    console.log("outRoomWhenViewerDisconnect");
    console.log(username, roomId);
    for (var i = 0; i < roomList.length; i++) {
        if (roomId == roomList[i].roomId) {
            for (var j = 0; j < roomList[i].listViewer.length; j++) {
                if (roomList[i].listViewer[j].username == username) {
                    roomList[i].listViewer.splice(j, 1);
                    sendReloadListViewerToClient(roomId);
                    sendReloadRoomAndUserListToClient();
                    break;
                }
            }
            break;
        }
    }
}

function outRoomWhenViewerCreateRoom(username) {
    console.log("outRoomWhenViewerCreateRoom");
    for (var i = 0; i < clientList.length; i++) {
        if (username == clientList[i].username) {
            outRoomWhenViewerDisconnectOrLeave(username, clientList[i].roomId);
            break;
        }
    }
}



function removeRoomAfterMasterDisconectOrOut(username) {
    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomMaster == username) {
            var lv = roomList[i].listViewer
            var userNotMasterPos=(roomList[i].user1==username?2:1)
            for (var j = 0; j < lv.length; j++) {
                changeUserState(lv[i].username,_USERSTT_RANH,-1);
                lv[i].clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Chủ phòng đã thoát!" }));
                lv[i].clientSocket.emit("SYSTEM_RESPONSE_CLEAR_MAIN", JSON.stringify({ message: "clear main-content" }));
            }
            for(var j=0;j<clientList.length;j++){
                if(clientList[j].username==roomList[i]['user'+userNotMasterPos]){
                    clientList[j].state=_USERSTT_RANH;
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Chủ phòng đã thoát!" }));
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_CLEAR_MAIN", JSON.stringify({ message: "clear main-content" }));
                    break;
                }

            }
            roomList.splice(i, 1);
            break;
        }
    }
}



function joinRoom(username, roomId, token, clientSocket) {
    if (checkValidateUser(username, token) == true) {
        //check xem có ở room nào không, nếu đã vào room thì sẽ xóa username ở listview ở room cũ đi và thêm vào room mới
        var room = checkDoJoinRoom(username);
        // console.log(room);
        if (room != -1) {
            console.log("go here");
            deleteUserInListViewer(username, room);
        }
        if (room == -2) {
            clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Bạn đang trong phòng, vui lòng không bấm linh tinh!" }))
            return;
        }
        var haveRoom = false;
        for (var i = 0; i < roomList.length; i++) {
            if (roomList[i].roomId == roomId) {
                roomList[i].listViewer.push({ username: username, clientSocket: clientSocket });
                sendReloadListViewerToClient(roomId);
                haveRoom = true;
                break;
            }
        }
        if (haveRoom == false) {
            clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Không tồn tại phòng " + roomId }));
        } else {

            changeUserState(username, _USERSTT_INLOBBY_VIEW, roomId);
            clientSocket.emit("SYSTEM_RESPONSE_LOAD_MAIN_ROOM_CONTENT", JSON.stringify(buildMainGame(roomId, false, false)));
            sendReloadRoomAndUserListToClient();
        }
    } else {
        clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: "Sai lệch thông tin, vui lòng đăng nhập lại!" }))
    }
}

function deleteUserInListViewer(username, roomId) {

    console.log("usernamee:", username, "roomId:", roomId);
    for (var i = 0; i < roomList.length; i++) {
        console.log(roomList[i]);
        if (roomList[i].roomId == roomId) {
            console.log(roomList[i].listViewer);
            for (var j = 0; j < roomList[i].listViewer.length; j++) {
                if (roomList[i].listViewer[j].username == username) {
                    roomList[i].listViewer.splice(j, 1);
                    console.log("listview:", roomList[i].listViewer);
                    break;
                }
            }
            break;
        }
    }
    sendReloadListViewerToClient(roomId);
}




function sendReloadListViewerToClient(roomId) {
    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId == roomId) {
            console.log(roomList[i]);
            var l = roomList[i].listViewer;
            var listviewstring = JSON.stringify(buildListViewer(roomId));
            for (var j = 0; j < l.length; j++) {
                l[j].clientSocket.emit("SYSTEM_RESPONSE_LOAD_LIST_VIEWER", listviewstring);
            }
            for (var j = 0; j < clientList.length; j++) {
                if (clientList[j].username == roomList[i].roomMaster) {
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_LOAD_LIST_VIEWER", listviewstring);
                }
                if (clientList[j].username == roomList[i].user1) {
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_LOAD_LIST_VIEWER", listviewstring);
                }
                if (clientList[j].username == roomList[i].user2) {
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_LOAD_LIST_VIEWER", listviewstring);
                }
            }
            break;
        }
    }
}
function sendReloadMainRoomContent(roomId) {
    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId == roomId) {
            var l = roomList[i].listViewer;
            var mainRoomContent = JSON.stringify(buildMainGame(roomId, false, false));
            for (var j = 0; j < l.length; j++) {
                l[i].clientSocket.emit("SYSTEM_RESPONSE_LOAD_MAIN_ROOM_CONTENT", mainRoomContent);
            }
            var count = 0;
            for (var j = 0; j < clientList.length; j++) {
                // if (clientList[j].username == roomList[i].roomMaster) {
                //     mainRoomContent.isRoomMaster=true;
                //     mainRoomContent.isPlayer=true;
                //     clientList[j].clientSocket.emit("SYSTEM_RESPONSE_LOAD_MAIN_ROOM_CONTENT", mainRoomContent);
                //     mainRoomContent.isRoomMaster=false;
                //     mainRoomContent.isPlayer=false;
                // }
                if (clientList[j].username == roomList[i].user1) {
                    count++;
                    var mainRoomContentPlayer = JSON.stringify(buildMainGame(roomId, roomList[i].user1 == roomList[i].roomMaster ? true : false, roomList[i].nextStep==1?true:false));
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_LOAD_MAIN_ROOM_CONTENT", mainRoomContentPlayer);

                }
                if (clientList[j].username == roomList[i].user2) {
                    var mainRoomContentPlayer = JSON.stringify(buildMainGame(roomId, roomList[i].user2 == roomList[i].roomMaster ? true : false,  roomList[i].nextStep==2?true:false));
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_LOAD_MAIN_ROOM_CONTENT", mainRoomContentPlayer);
                    count++;

                }
                if (count >= 2) break;
            }
            break;
        }
    }
}
function sendErrorMessageToRoom(roomId, message) {
    for (var i = 0; i < roomList.length; i++) {
        if (roomId == roomList[i].roomId) {
            for (var j = 0; j < roomList[i].listViewer.length; j++) {
                roomList[i].listViewer[j].clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: message }))
            }
            for (var j = 0; j < clientList.length; j++) {
                if (clientList[j].username == roomList[i].user1) {
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: message }))
                }
                if (clientList[j].username == roomList[i].user2) {
                    clientList[j].clientSocket.emit("SYSTEM_RESPONSE_ERROR", JSON.stringify({ message: message }))
                }
            }
        }
    }
}


function checkDoJoinRoom(username) {
    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomMaster == username) return -2;
        if (roomList[i].user1 == username) return -2;
        if (roomList[i].user2 == username) return -2;
        for (var j = 0; j < roomList[i].listViewer.length; j++) {

            if (roomList[i].listViewer[j].username == username) {
                return roomList[i].roomId;
            }
        }
    }
    return -1;
}

function checkValidateUser(username, token) {
    for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].username == username) {
            if (clientList[i].token == token) {
                return true;
            } else return false;
        }
    }
    return false;
}




function sendReloadRoomAndUserListToClient() {
    io.sockets.emit('SYSTEM_RESPONSE_INIT_ALL', JSON.stringify({ clientList: buildListUserOnline(), roomList: buildListRoom() }));
}


function createMatrix() {
    var arr = [];
    for (var j = 0; j < 20; j++) {
        var row = [];
        for (var i = 0; i < 20; i++) {
            row.push(0);
        }
        arr.push(row);
    }
    return arr;
}
function changeUserState(username, state, roomId) {
    for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].username == username) {
            clientList[i].state = state;
            if (roomId != -1) {
                clientList[i].roomId = roomId;
            }
            break;
        }
    }
}

function buildListUserOnline() {
    var obj = [];
    for (var i = 0; i < clientList.length; i++) {
        obj.push({ username: clientList[i].username, state: clientList[i].state });
    }
    return obj;
}
function buildListRoom() {
    var obj = [];
    for (var i = 0; i < roomList.length; i++) {
        var slot = "1/2";
        if (roomList[i].user1 != "" && roomList[i].user2 != "") {
            slot = "2/2";
        }
        var t = {
            roomId: roomList[i].roomId,
            state: roomList[i].state, slot: slot,
            roomMaster: roomList[i].roomMaster,
            numberViewer: roomList[i].listViewer.length
        };
        obj.push(t);
    }
    return obj;
}

function buildListViewer(roomId) {
    var obj = [];
    for (var i = 0; i < roomList.length; i++) {
        if (roomId == roomList[i].roomId) {
            for (var j = 0; j < roomList[i].listViewer.length; j++) {
                obj.push(roomList[i].listViewer[j].username);
            }
        }
    }
    return {listViewer:obj,roomId:roomId};
}
function buildMainGame(roomId, isRoomMaster, isPlayer) {
    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId == roomId) {
            var room = roomList[i];
            var obj = {
                roomId: room.roomId,
                roomMaster: room.roomMaster,
                nextStep: room.nextStep,
                state: room.state,
                isStart: room.isStart,
                user1: room.user1,
                user2: room.user2,
                matrixArr: room.matrixArr,
                lastStep: room.lastStep,
                isRoomMaster: isRoomMaster,
                isPlayer: isPlayer,
                gameIsDone:room.gameIsDone
            }
            return obj;
        }
    }
}


function canCreateRoom(username, roomId, token, cb) {
    // console.log("roomlist:",roomList);
    var canCreate = true;
    var message = "";
    for (var i = 0; i < roomList.length; i++) {
        if (roomList[i].roomId == roomId) {
            canCreate = false;
            message += "roomId:" + roomId + " đã tồn tại.\n";

        }
        if (roomList[i].roomMaster == username) {
            canCreate = false;
            message += "Bạn đang là chủ phòng, vui lòng thoát ra để tạo phòng khác!\n";
        }
    }
    for (var i = 0; i < clientList.length; i++) {
        if (username == clientList[i].username) {
            if (clientList[i].token != token) {
                canCreate = false;
                message += "Sai lệch thông tin, vui lòng đăng nhập lại!\n"
                break;
            }
        }
    }
    if (canCreate == false) {
        return cb({ success: false, message: message });
    } else {

        return cb({ success: true, message: message });
    }
}

function checkWin(matrix,numberCheck,trow,tcol,callback){
    var leftEnd=false,rightEnd=false,topEnd=false,botEnd=false,topLeftEnd=false,botRightEnd=false,topRightEnd=false,botLeftEnd=false;
    var countLeft=0,countRight=0,countTop=0,countBot=0, countTopLeft=0,countBotRight=0,countTopRight=0,countBotLeft=0;
    var k=(numberCheck==1) ? "x":"o";
    for(var i=1;i<5;i++){
        //hàng ngang
        if((tcol-i)>=0)
            if(matrix[trow][tcol-i] == numberCheck && !leftEnd){
                countLeft++;
            }else{
                leftEnd=true;
            }
        if((tcol+i)<20)
            if(matrix[trow][tcol+i] == numberCheck && !rightEnd){
                countRight++;
            }else{
                rightEnd=true;
            }
        
        //hàng dọc
        if((trow-i) >=0)
            if(matrix[trow-i][tcol] == numberCheck && !topEnd){
                countTop++;
            }else{
                topEnd=true;
            }
        if((trow+i) <20)
            if(matrix[trow+i][tcol] == numberCheck && !botEnd){
                countBot++;
            }else{
                botEnd=true;
            }
        //chéo trên trái xuống phải topleft+botright
        if((trow-i)>=0 && (tcol-i)>=0)
            if(matrix[trow-i][tcol-i] == numberCheck && !topLeftEnd){
                countTopLeft++;
            }else{
                topLeftEnd=true;
            }
        if((trow+i)<20 && (tcol+i)<20)
            if(matrix[trow+i][tcol+i] == numberCheck && !botRightEnd){
                countBotRight++;
            }else{
                botRightEnd=true;
            }
        
        
        //chéo trên phải xuống trái topRight+botLeft
        if((trow-i)>=0 && (tcol+i)<20)
            if(matrix[trow-i][tcol+i] == numberCheck && !topRightEnd){
                countTopRight++;
            }else{
                topRightEnd=true;
            }
        if((trow+i)<20 && (tcol-i)>=0)
            if(matrix[trow+i][tcol-i] == numberCheck && !botLeftEnd){
                countBotLeft++;
            }else{
                botLeftEnd=true;
            }
    }
    if((countLeft+countRight)>=4){
        return callback({gameIsDone:true,winner:numberCheck})
        
    }
    if((countTop+countBot)>=4){
        return callback({gameIsDone:true,winner:numberCheck})
    }
    if((countTopLeft+countBotRight)>=4){
        return callback({gameIsDone:true,winner:numberCheck})
    }
    if((countTopRight+countBotLeft)>=4){
        return callback({gameIsDone:true,winner:numberCheck})
    }
    return callback({gameIsDone:false})
}


function createGameInfoLog(room,cb){
    //state : 1 : start, 2: done
    var query='INSERT INTO `game`.`game_info` (`username1`, `username2`, `resultMatrix`, `state`) VALUES (?,?,?,?);';
    
    sqlConnector.query(query,[room.user1,room.user2,JSON.stringify(room.matrixArr),1],function(err,result){
        if(err){
            console.log(err);
            return cb({success:false});
        }else{
            console.log(result);
            return cb({success:true,phienId:result.insertId})
        }
    });
}

function updateGameInfoLog(room){
    var date=new Date();
    var query="UPDATE `game`.`game_info` SET `resultMatrix` = ?, `timeEnd` = ?, `userWiner` = ? WHERE (`id` = ?);"
    sqlConnector.query(query,[JSON.stringify(room.matrixArr),date,room.userWinner,room.phienId],function(err,result){
        if(err){
            console.log(err);
        }else{
            logUser(room.user1,room.phienId,room.user1==room.userWinner,JSON.stringify(room.user1Step),true,date);
            logUser(room.user2,room.phienId,room.user2==room.userWinner,JSON.stringify(room.user2Step),false,date);
        }
    })
}


function logUser(username,gameInfoId,isWin,userStep,isFirstplay,time){
    var query="INSERT INTO `game`.`user_play_log` (`username`, `gameInfoId`, `isWin`, `userStep`, `isFirstPlay`,`timeLog`) VALUES (?,?,?,?,?,?);";
    sqlConnector.query(query,[username,gameInfoId,isWin,userStep,isFirstplay,time],function(err,result){
        if(err){
            console.log(err);
        }else{

        }
    })

}

module.exports = router;