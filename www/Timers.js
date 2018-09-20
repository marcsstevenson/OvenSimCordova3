/// <reference path="Lib/knockout-3.1.0.js" />

function Timers(self) {
    var blinkInterval = 300;

    //Global timer control - start

    self.SetIntervalWrapper = function (onTickFunction, interval) {
        if (self.TimersEnabled !== true) return 0;

        return setInterval(onTickFunction, interval);
    };

    self.ClearIntervalWrapper = function (timerId) {
        if (self.TimersEnabled !== true) return;

        clearInterval(timerId);
    };

    //Global timer control - end

    //***Steam - Start

    //SteamShot

    self.SteamShotModeTimerId = 1;
    self.IsWaitingForSteamShotModeOffInterval = false;
    self.SteamShotModeOffInterval = 1000; //ms

    self.ClearSteamShotModeTimer = function () {
        if (self.SteamShotModeTimerId !== 1)
            self.ClearIntervalWrapper(self.SteamShotModeTimerId);
    };

    self.StartSteamShotModeIntervalTimer = function () {
        self.ClearSteamShotModeTimer(); //Stop the timer
        self.SteamShotModeTimerId = self.SetIntervalWrapper(function () { self.NextSteamShotModeInterval(); }, self.SteamShotModeOffInterval);
        self.SteamShooting(true);
    };

    self.NextSteamShotModeInterval = function () {
        self.Log("NextSteamShotModeInterval");

        self.IsWaitingForSteamShotModeOffInterval = false; //Always reset this
        self.ClearSteamShotModeTimer(); //Stop the timer
        self.SteamShooting(false);
    };

    //*** Steam - End

    //***TempDisplay - Start

    self.TempDisplayTimerId = 3;
    self.IsWaitingForTempDisplayInterval = false;
    self.TempDisplayInterval = 5000; //ms

    self.ClearTempDisplayTimer = function () {
        if (self.TempDisplayTimerId !== 3)
            self.ClearIntervalWrapper(self.TempDisplayTimerId);
    };

    self.StartTempDisplayIntervalTimer = function () {
        self.ClearTempDisplayTimer(); //Stop the timer

        self.TempDisplayTimerId = self.SetIntervalWrapper(self.NextTempDisplayInterval, self.TempDisplayInterval);
    };

    self.NextTempDisplayInterval = function () {
        self.Log("NextTempDisplayInterval");

        self.IsWaitingForTempDisplayInterval = false; //Always reset this
        self.ClearTempDisplayTimer();
        self.StopDisplayingActualTemperature(); //TempDisplay off the oven
    };

    //***TempDisplay - End

    //Countdown

    self.TimerCountdownTimerId = 7;
    self.IsWaitingForTimerCountdownInterval = ko.observable(false);
    self.TimerCountdownInterval = 1000; //ms

    self.ClearTimerCountdownTimer = function () {
        self.ClearIntervalWrapper(self.TimerCountdownTimerId);
    };

    self.StartTimerCountdownIntervalTimer = function () {
        self.ClearTimerCountdownTimer(); //Stop the timer
        //return;
        var interval = self.TimerCountdownInterval / self.TimeDilation();

        self.TimerCountdownTimerId = self.SetIntervalWrapper(function () { self.NextTimerCountdownInterval(); }, interval); //
    };

    self.NextTimerCountdownInterval = function () {
        //Update timer current value
        self.ClearTimerCountdownTimer();

        if (!self.TimerRunning()) return;

        self.StartTimerCountdownIntervalTimer();

        self.SetTimerTimerNextValue();
    };

    //*** Timer - End

    //*** Status Values

    //Heating

    self.SetIntervalHeatingTimer = function () {
        self.ClearHeatingTimer();

        self.HeatingTimerId = self.SetIntervalWrapper(function () { self.NextHeatingInterval(); }, 50);
    };

    self.ClearHeatingTimer = function () {
        if (self.HeatingTimerId !== 0)
            self.ClearIntervalWrapper(self.HeatingTimerId);
    };

    self.StartIntervalHeatingTimer = function () {
        self.ClearHeatingTimer(); //Stop the timer
        self.SetIntervalHeatingTimer();
    };

    self.NextHeatingInterval = function () {
        //TODO: Cooling when not heating
        self.IncreaseTemperatureFromHeating();
        self.IncreaseCoreTemperatureFromHeating();
    };

    //*** Core Temperature - Start
    var coreTemperatureModeBlinkCount = 0;
    self.CoreTemperatureModeBlinkTimerId = 9;
    self.CoreTemperatureModeBlinkOffInterval = blinkInterval;

    self.ClearCoreTemperatureModeBlinkTimer = function () {
        if (self.CoreTemperatureModeBlinkTimerId !== 9)
            self.ClearIntervalWrapper(self.CoreTemperatureModeBlinkTimerId);
    };

    self.StartCoreTemperatureModeBlinkIntervalTimer = function () {
        self.ClearCoreTemperatureModeBlinkTimer(); //Stop the timer
        self.CoreTemperatureModeBlinkTimerId = self.SetIntervalWrapper(function () { self.NextCoreTemperatureModeBlinkInterval(); }, self.CoreTemperatureModeBlinkOffInterval);
    };

    self.NextCoreTemperatureModeBlinkInterval = function () {
        self.TargetCoreTemperatureBlinkOn(!self.TargetCoreTemperatureBlinkOn());

        //Set the based on every 2nd on blink

        self.TargetCoreTemperatureAlternate(coreTemperatureModeBlinkCount == 0);

        coreTemperatureModeBlinkCount++;
        if (coreTemperatureModeBlinkCount >= 4) coreTemperatureModeBlinkCount = 0; //Loop
    };


    //Actual Core Temp Display

    self.CoreTemperatureDisplayTimerId = 10;
    self.IsWaitingForCoreTemperatureDisplayInterval = false;
    self.CoreTemperatureDisplayInterval = 5000; //ms

    self.ClearCoreTemperatureDisplayTimer = function () {
        if (self.CoreTemperatureDisplayTimerId !== 10)
            self.ClearIntervalWrapper(self.CoreTemperatureDisplayTimerId);
    };

    self.StartCoreTemperatureDisplayIntervalTimer = function () {
        self.ClearCoreTemperatureDisplayTimer(); //Stop the timer
        self.CoreTemperatureDisplayTimerId = self.SetIntervalWrapper(function () { self.NextCoreTemperatureDisplayInterval(); }, self.CoreTemperatureDisplayInterval);
    };

    self.NextCoreTemperatureDisplayInterval = function () {
        self.IsWaitingForCoreTemperatureDisplayInterval = false; //Always reset this
        self.ClearCoreTemperatureDisplayTimer(); //Stop the timer
        self.StopDisplayingActualCoreTemperature(); //CoreTemperatureDisplay off the oven
    };

    //*** Core Temperature - End

    //MasterBlink - the blink to blink them all

    self.MasterBlinkTimerId = 100;
    self.MasterBlinkOffInterval = blinkInterval; //ms - this is used to turn the oven off

    self.StartMasterBlinkIntervalTimer = function () {
        //console.log('here');
        self.MasterBlinkTimerId = self.SetIntervalWrapper(function () { self.NextMasterBlinkInterval(); }, self.MasterBlinkOffInterval);
    };

    self.NextMasterBlinkInterval = function () {
        //console.log('here');
        self.MasterBlinkOn(!self.MasterBlinkOn());
    };

    if (self.BlinkingEnabled === true)
        self.StartMasterBlinkIntervalTimer(); //The master blink always blinks
}