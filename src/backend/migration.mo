module {
  type BackgroundMode = {
    #solidWhite;
    #solidBlack;
  };

  type OldDisplayPreferences = {
    showPrintProfileButton : Bool;
  };

  type NewDisplayPreferences = {
    showPrintProfileButton : Bool;
    residentProfileEditorBackgroundMode : BackgroundMode;
  };

  type OldAppSettings = {
    displayPreferences : OldDisplayPreferences;
  };

  type NewAppSettings = {
    displayPreferences : NewDisplayPreferences;
  };

  type OldActor = {
    appSettings : OldAppSettings;
  };

  type NewActor = {
    appSettings : NewAppSettings;
  };

  public func run(old : OldActor) : NewActor {
    let newDisplayPreferences : NewDisplayPreferences = {
      old.appSettings.displayPreferences with
      residentProfileEditorBackgroundMode = #solidWhite;
    };

    let newAppSettings : NewAppSettings = {
      old.appSettings with displayPreferences = newDisplayPreferences;
    };

    {
      old with
      appSettings = newAppSettings;
    };
  };
};
