angular.module('cam').controller('audioVideoSimpleCtrl', ['$scope', function ($scope) {
    var _init = function () {
        $scope.user = {};
        $scope.users = [];
        $scope.chat = {allMsgs: '', msg: ''};
        
        easyrtc.setPeerListener(_peerListener);
        easyrtc.setRoomOccupantListener(_convertListToButtons);
        easyrtc.easyApp("easyrtc.audioVideo", "selfVideo", ["callerVideo"], _loginSuccess, _loginFailure);
    };
    
    $scope.call = function (to) {
        _hangupAllClients();
        easyrtc.call(to, _callSuccess, _callFailed, _callAccepted);
        easyrtc.sendDataWS(to, "chat:videoconnected",  null);
    };
    
    $scope.hangup = function (to) {
        _hangupAllClients();
        easyrtc.sendDataWS(to, "chat:videodisconnected",  null);
    };
    
    var _peerListener = function (who, msgType, content) {
        if (msgType === 'chat:videoconnected') {
            _findUserByEasyRtcId(who).isConnected = true;
        }
        else if (msgType === 'chat:videodisconnected') {
             _findUserByEasyRtcId(who).isConnected = false;
        }
        
        $scope.$apply();
    };
    
    var _callSuccess = function (to) { 
        _findUserByEasyRtcId(to).isConnected = true; 
        $scope.$apply();
    };
    
    var _callFailed = function (errCode, errMsg) { };
    
    var _callAccepted = function (accepted, from) { };
    
    var _hangupAllClients = function () {
        easyrtc.hangupAll();
        
        if ($scope.users) {
            for (var i = 0; i < $scope.users.length; i++) {
                $scope.users[i].isConnected = false;
            }
        }  
    };
    
    var _loginSuccess = function (easyrtcid) {
        $scope.user.easyRtcId = easyrtcid;
        $scope.$apply();
    };
    
    var _loginFailure = function (errorCode, message) {
        easyrtc.showError(errorCode, message);
        $scope.$apply();
    };
    
    var _convertListToButtons = function (roomName, occupants, isPrimary) {
        var oldUsers = angular.copy($scope.users);
        $scope.users = [];
        
        for (easyRtc in occupants) {
            $scope.users.push({
                easyRtcId: easyRtc,
                name: easyRtc,
                isConnected: _findOldUser(oldUsers, easyRtc)
            });
        }
        
        $scope.$apply();
    };
    
    var _findOldUser = function (oldUsers, easyRtc) {
        if (oldUsers) {
            for (var i = 0; i < oldUsers.length; i++) {
                if (oldUsers[i].easyRtcId === easyRtc) {
                    return oldUsers.isConnected;
                }
            }  
        }
        
        return false;
    };
    
    var _findUserByEasyRtcId = function (id) {
        if (id) {
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].easyRtcId === id) {
                    return $scope.users[i];
                }
            }
        }  
        
        return null;
    };
    
    _init();
}]);