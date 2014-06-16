angular.module('cam').controller('simpleMessagingCtrl', ['$scope', '$timeout', function ($scope) {
    var _init = function () {
        $scope.user = {};
        $scope.users = [];
        $scope.chat = {allMsgs: '', msg: ''};
        
        easyrtc.setPeerListener(_addToConversation);
        easyrtc.setRoomOccupantListener(_convertListToButtons);
        easyrtc.connect("easyrtc.instantMessaging", _loginSuccess, _loginFailure);  
        easyrtc.webSocket.on('test', function (resp) {
            _addToConversation(resp.from + " (TO ALL)", "message", resp.msg);
        });
    };
    
    $scope.sendAll = function () {
        easyrtc.webSocket.emit('test', { msg: $scope.chat.msg, from: $scope.user.easyRtcId });
        _addToConversation("Me (TO ALL)", "message", $scope.chat.msg);
        $scope.chat.msg = ''; 
    };
    
    $scope.sendTo = function (to) {
        easyrtc.sendDataWS(to, "message",  $scope.chat.msg);
        _addToConversation("Me", "message", $scope.chat.msg);
        $scope.chat.msg = ''; 
    };
    
    var _loginSuccess = function (easyrtcid) {
        $scope.user.easyRtcId = easyrtcid;
        $scope.$apply();
    };
    
    var _loginFailure = function (errorCode, message) {
        easyrtc.showError(errorCode, message);
        $scope.$apply();
    };
    
    var _addToConversation = function (who, msgType, content) {
        setTimeout(function() {
            $scope.$apply(function () {
                $scope.chat.allMsgs += "<b>" + who + ":</b>&nbsp;" + content + "<br />"; 
            }, 0);            
        });
    };
    
    var _convertListToButtons = function (roomName, occupants, isPrimary) {
        $scope.users = [];
        
        for (easyRtc in occupants) {
            $scope.users.push({
                easyRtcId: easyRtc,
                name: easyRtc
            });
        }
        
        $scope.$apply();
    };

    _init();
}]);