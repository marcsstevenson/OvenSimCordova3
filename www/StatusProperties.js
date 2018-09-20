/// <reference path="Lib/knockout-3.1.0.js" />
/// <reference path="Lib/moment-2.8.4.min.js" />
/// <reference path="OvenProgramFactory.js" />
/// <reference path="TemperatureConfigFactory.js" />

function StatusProperties(self, defaultIsCelcius) {
    self.MasterBlinkOn = ko.observable(true);

    self.StartTemperature = 18;

    self.MaxTimeDilation = 64; //times
    self.MinTimeDilation = 1;
    self.TimeDilation = ko.observable(1);

    self.ActualTemperature = ko.observable(0);
    
    self.DisplayingActualCoreTemperature = ko.observable();
    self.DisplayingActualTemperature = ko.observable();

    self.CoreProbeConnected = ko.observable(false);
    self.ActualCoreTemperature = ko.observable(0);
    self.TargetCoreTemperatureSet = ko.observable(false);
    self.IsPreheating = ko.observable(false);

    self.TargetCoreTemperatureBlinkOn = ko.observable(false);
    self.TargetCoreTemperatureAlternate = ko.observable(false);
    self.CoreTemperatureCookingStarted = ko.observable(false);

    self.TimerStarted = ko.observable(false);
    self.TimerRunning = ko.observable(false);
    self.TimerComplete = ko.observable(false);
    
    //Temperature configs
    var temperatureConfigIndex = 0;

    if (defaultIsCelcius !== 'undefined' && defaultIsCelcius !== null && defaultIsCelcius === false)
        temperatureConfigIndex = 1;

    self.TemperatureConfigs = ko.observableArray(new TemperatureConfigFactory().BuildAll());
    self.CurrentTemperatureConfig = ko.observable(self.TemperatureConfigs()[temperatureConfigIndex]);

    //Programming
    self.ProgrammingArea = ko.observable(0); //0 = Not, 1 = Display Program, 2 = Edit Program, 3 = Edit Program Stage Values
    self.IsProgramming = ko.computed(function() {
        return self.ProgrammingArea() > 0;
    });

    self.OvenPrograms = ko.observableArray();

    self.ResetPrograms = function () {
        self.OvenPrograms(new OvenProgramFactory().BuildEmptyOvenPrograms(self.CurrentTemperatureConfig()));
    };

    self.ResetPrograms();

    var manualOvenProgram = new OvenProgram();
    var manualModeProgramStage = new OvenProgramStage(true, self.CurrentTemperatureConfig());
    manualOvenProgram.AddOvenProgramStage(manualModeProgramStage);
    manualModeProgramStage.IsManualModeStep(true);
    self.ManualModeProgramStage = ko.observable(manualModeProgramStage);
    
    self.DisplayingProgramStage = ko.observable(manualModeProgramStage);

    //self.TimerDirectionUp = ko.observable(true);

    self.TimerDirectionUp = ko.computed(function () {
        if (!self.DisplayingProgramStage()) return true;

        return self.DisplayingProgramStage().TimerDirectionUp();
    });

    self.DisplayingProgram = ko.computed(function() {
        if (!self.DisplayingProgramStage()) return null;

        return self.DisplayingProgramStage().OvenProgram();
    });

    //self.Test = function() {
    //    console.log(self.ConvertDurtaionToDisplay(self.OvenPrograms()[0].TotalTimeRemaining()));
    //};

    self.EditingOvenProgramIndex = ko.observable(0);
    self.EditingOvenProgramStageIndex = ko.observable(0);
    self.CookingOvenProgramIndex = ko.observable(0);
    self.CookingOvenProgramStageIndex = ko.observable(0);
    
    //Status Values
    self.OvenIsOn = ko.observable();
    self.LightIsOn = ko.observable();
    self.MoistureModeOn = ko.observable();
    self.DisplayingMoistureSetup = ko.observable();
    
    self.IsManualMode = ko.observable();
    self.IsCooking = ko.observable();
    self.SteamShooting = ko.observable();
    self.IsHeating = ko.observable(false);
    
    //Button functions
    self.TempButtonTapFunction = ko.observable();
    
    self.TimerButtonTapFunction = ko.observable();
    self.TimerButtonTapHoldFunction = ko.observable();

    self.LightOn_TimerFunction = ko.observable();

    self.Temp_MinusClickFunction = ko.observable();
    self.Temp_PlusClickFunction = ko.observable();
    self.Timer_MinusClickFunction = ko.observable();
    self.Timer_PlusClickFunction = ko.observable();

    //Display functions
    self.TopDisplayFunction = ko.observable(null);
    self.BottomDisplayFunction = ko.observable(null);

    //Blinkingness
    //  Buttons
    self.SteamButtonIsBlinking = ko.observable(false);
    self.ProgramButtonIsBlinking = ko.observable(false);
    self.TempButtonIsBlinking = ko.observable(false);
    self.LightPowerButtonIsBlinking = ko.observable(false);
    self.FanButtonIsBlinking = ko.observable(false);
    self.TimerButtonIsBlinking = ko.observable(false);

    //  Displays
    self.TopDisplayIsBlinking = ko.observable(false);
    self.BottomDisplayIsBlinking = ko.observable(false);
    
    self.SetDefaults = function () {
        self.ManualModeProgramStage(manualModeProgramStage); //Set back to manual mode

        self.OvenIsOn(false);
        self.LightIsOn(false);
        self.DisplayingActualTemperature(false);
        
        self.ActualTemperature(self.StartTemperature);
        
        self.ActualCoreTemperature(self.StartTemperature);
        self.TargetCoreTemperatureSet(false);
        self.IsPreheating(false);
        self.TargetCoreTemperatureAlternate(false);
        self.CoreTemperatureCookingStarted(false);

        self.SetDefaults_Timer();
        self.ClearHeatingTimer();

        self.MoistureModeOn(false);
        self.DisplayingMoistureSetup(false);

        //Button functions
        self.SetDefaults_TempUi();
        self.SetDefaults_TimerUi();
        
        //Display functions
        //self.TimerDisplayValue = ko.computed(function () {
        //    return self.DisplayingProgramStage().TimerDisplayValue();
        //});
        self.TopDisplayFunction(self.TargetTemperature);
        self.BottomDisplayFunction(self.TimerDisplayValue);

        //Blinkingness
        self.SteamButtonIsBlinking(false);
        self.ProgramButtonIsBlinking(false);
        self.TempButtonIsBlinking(false);
        self.LightPowerButtonIsBlinking(false);
        self.FanButtonIsBlinking(false);
        self.TimerButtonIsBlinking(false);
        self.TopDisplayIsBlinking(false);
        self.BottomDisplayIsBlinking(false);

        self.IsManualMode(true);
        self.IsCooking(true);
        self.SteamShooting(false);
        self.IsHeating(false);

        //Clear all timers
        //self.ClearPowerTimer();
        //self.ClearTempDisplayTimer();
        //self.ClearMoistureModeTimer();
        //self.ClearTimerCountdownTimer();

        //Programming
        self.SetDefaults_Programming();

        //Manual Program Step
        self.ManualModeProgramStage().SetDefaults();
        
        //Display the manual stage
        self.DisplayingProgramStage(self.ManualModeProgramStage());

        //Stop any alarm
        self.StopAlarm();
    };

    self.SetDefaults_Timer = function () {
        self.TimerStarted(false);
        self.TimerRunning(false);
        self.TimerComplete(false);

        self.ClearSteamShotModeTimer();
        self.ClearTempDisplayTimer();
        self.ClearTimerCountdownTimer();
        self.ClearCoreTemperatureModeBlinkTimer();
        self.ClearCoreTemperatureDisplayTimer();
    };

    self.SetDefaults_TempUi = function () {
        self.TopDisplayFunction(self.TargetTemperature);
        self.TempButtonTapFunction(self.ToggleTempDisplay);
        self.Temp_MinusClickFunction(self.DecreaseTargetTemperature);
        self.Temp_PlusClickFunction(self.IncreaseTargetTemperature);
    };

    self.SetDefaults_TimerUi = function () {
        self.BottomDisplayFunction(self.TimerDisplayValue);
        self.LightOn_TimerFunction(self.TimerStarted);
        self.Timer_MinusClickFunction(self.DecreaseTimer);
        self.Timer_PlusClickFunction(self.IncreaseTimer);

        self.SetDefaults_TimerButtons();
    };

    self.SetDefaults_TimerButtons = function () {
        self.TimerButtonTapFunction(self.TimerTap);
        self.TimerButtonTapHoldFunction(self.TimerTapHold);
    };

    self.SetDefaults_Programming = function () {
        self.ProgrammingArea(0);
        
        //The programs persist
        self.EditingOvenProgramIndex(0);
        self.EditingOvenProgramStageIndex(0);
        self.CookingOvenProgramIndex(0);
        self.CookingOvenProgramStageIndex(0);
    };

}