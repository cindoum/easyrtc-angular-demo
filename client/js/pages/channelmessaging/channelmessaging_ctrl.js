angular.module('cam').controller('channelMessagingCtrl', ['$scope', '$filter', function ($scope, $filter) {
    var _init = function () {
        $scope.user = {};
        $scope.users = [];
        $scope.chat = {allMsgs: '', msg: ''};
        
        _setEasyRtcOptions();
        
        easyrtc.setDataChannelOpenListener(_openListener);
        easyrtc.setDataChannelCloseListener(_closeListener);
        easyrtc.setPeerListener(_addToConversation);
        easyrtc.setRoomOccupantListener(_convertListToButtons);
        easyrtc.connect("easyrtc.dataMessaging", _loginSuccess, _loginFailure);
    };
    
    $scope.sendTo = function (to) {
        if (easyrtc.getConnectStatus(to) === easyrtc.IS_CONNECTED) {
            easyrtc.sendDataP2P(to, 'msg', $scope.chat.msg);
        }
        else {
            easyrtc.showError("NOT-CONNECTED", "not connected to " + easyrtc.idToName(to) + " yet.");
        }
    
        _addToConversation("Me", "msgtype", $scope.chat.msg);
    };
    
    $scope.disconnect = function (to) {
        easyrtc.hangup(to);
        _findUserByEasyRtcId(to).isConnected = false;
    };
    
    $scope.connect = function (to) {
        if (easyrtc.getConnectStatus(to) === easyrtc.NOT_CONNECTED) {
        try {
            easyrtc.call(to,
                function(caller, media) { // success callback
                    if (media === 'datachannel') {
                        // console.log("made call succesfully");
                        _findUserByEasyRtcId(to).isConnected = true;
                    }
                    
                    $scope.$apply();
                },
                function(errorCode, errorText) {
                    _findUserByEasyRtcId(to).isConnected = false;
                    easyrtc.showError(errorCode, errorText);
                    
                     $scope.$apply();
                },
                function(wasAccepted) {
                    // console.log("was accepted=" + wasAccepted);
                }
            );
            }catch( callerror) {
                console.log("saw call error ", callerror);
            }
        }
        else {
            easyrtc.showError("ALREADY-CONNECTED", "already connected to " + easyrtc.idToName(to));
        }
    };
    
    var _setEasyRtcOptions = function () {
        easyrtc.enableDebug(false);
        easyrtc.enableDataChannels(true);
        easyrtc.enableVideo(false);
        easyrtc.enableAudio(false);
        easyrtc.enableVideoReceive(false);
        easyrtc.enableAudioReceive(false);  
    };
    
    var _loginSuccess = function (easyrtcid) {
        $scope.user.easyRtcId = easyrtcid;
        $scope.$apply();
    };
    
    var _loginFailure = function (errorCode, message) {
        easyrtc.showError(errorCode, message);
        $scope.$apply();
    };
    
    var _openListener = function (otherParty) {
        if (otherParty) {
            _findUserByEasyRtcId(otherParty).isConnected = true;
            $scope.$apply();
        }  
    };
    
    var _closeListener = function(otherParty) {
        if (otherParty) {
            _findUserByEasyRtcId(otherParty).isConnected = false;
            $scope.$apply();
        }  
    };
    
    var _addToConversation = function (who, msgType, content) {
        setTimeout(function() {
            $scope.$apply(function () {
                $scope.chat.allMsgs += "<b>" + who + " </b> <span class=\"chat_timespan\">[<i>" + $filter('date')(new Date(), 'H:mm ss') + "</i>]</span> : &nbsp;" + content + "<br />"; 
            }, 0);            
        });
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