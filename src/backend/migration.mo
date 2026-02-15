import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
    userType : {
      #staff;
      #resident;
      #familyMember;
    };
    relatedResidentIds : [Nat];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    // Keep all other fields unchanged
  };

  type NewUserProfile = {
    name : Text;
    userType : {
      #staff;
      #resident;
      #familyMember;
    };
    relatedResidentIds : [Nat];
    showResidentProfileReport : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    // All other fields remain unchanged
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        { oldProfile with showResidentProfileReport = true };
      }
    );
    {
      old with
      userProfiles = newUserProfiles;
    };
  };
};
