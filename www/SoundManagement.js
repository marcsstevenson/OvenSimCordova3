/// <reference path="Lib/knockout-3.1.0.js" />
/// <reference path="Lib/moment-2.8.4.min.js" />
/// <reference path="Lib/knockout-3.1.0.js" />

function SoundManagement(self) {

    //Sounds
    self.Beep = function () {
        if (!self.SoundEnabled === true) return; //Sound will not work in tests

        var cordovaMediaPluginAvailable = (typeof Media !== 'undefined');
        
        if (cordovaMediaPluginAvailable)
            self.PlayAudioCordova('beep1.mp3');
        else {
            var soundFile = document.getElementById("beepControl");
            soundFile.load();
            soundFile.play();
        }
    };

    var alarmMasterBlinkOnSubscription;

    self.StartAlarm = function () {
        console.log('here');
        alarmMasterBlinkOnSubscription = self.MasterBlinkOn.subscribe(function () {
            console.log('here');
            self.Beep();
        });
    };

    self.StopAlarm = function () {
        //Dispose the subscription that is bringing the beeping
        if (alarmMasterBlinkOnSubscription) alarmMasterBlinkOnSubscription.dispose();
    };

    self.PlayAudioCordova = function (file) {
        
        var p = window.location.pathname;
        var root = p.substring(0, p.lastIndexOf('/')) + '/Sounds/';
        var src = root + file;

        var media = new Media(src, 

            // success callback
             function () { },
            // error callback
             function (error) {
                 alert('code: ' + error.code + '\n' +
                 'message: ' + error.message + '\n');
             }
            );
        media.play();
    }
}
