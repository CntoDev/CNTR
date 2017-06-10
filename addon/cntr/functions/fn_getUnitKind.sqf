/*
	Author: Shakan

	Description:
	Determines the kind of unit.
*/

params ["_unit"];

private _isOfficer = { params ["_unit"];
 _unit call _isLeader and rank _unit in ["CAPTAIN", "MAJOR", "COLONEL"];
};

private _isLeader = { params ["_unit"];
 leader group _unit == _unit;
};

private _isAntitank = { params ["_unit"];
  getText(configFile >> "CfgWeapons" >> secondaryWeapon _unit >> "UIPicture") == "\a3\weapons_f\data\ui\icon_at_ca.paa";
};

private _isAutorifleman = { params ["_unit"];
  getText(configFile >> "CfgWeapons" >> primaryWeapon _unit >> "UIPicture") == "\a3\weapons_f\data\ui\icon_mg_ca.paa";
};

private _isMedic = { params ["_unit"];
  (getNumber (configFile >> "CfgVehicles" >> typeOf _unit >> "attendant") isEqualTo 1) or (player getUnitTrait "Medic");
};

private _isEngineer = { params ["_unit"];
  (getNumber (configFile >> "CfgVehicles" >> typeOf _unit >> "engineer") isEqualTo 1) or (player getUnitTrait "Engineer");
};

private _isSniper = { params ["_unit"];
  private _optics = primaryWeaponItems _unit select 2;

  if (not isNil {_optics}) then {
    private _modes = "true" configClasses (configFile >> "CfgWeapons" >> _optics >> "ItemInfo" >> "OpticsModes");

    private _mag = 1;

    {
      private _defaultFov = 0.75;
      private _magFov = getNumber(_x >> "opticsZoomInit");

      if (_defaultFov / _magFov > _mag) then {
        _mag = _defaultFov / _magFov;
      }
    } forEach _modes;

    _mag > 2;
  } else {
    false;
  };
};


if (_unit call _isOfficer) exitWith { "Officer" };
if (_unit call _isLeader) exitWith { "Leader" };
if (_unit call _isAntitank) exitWith { "AT" };
if (_unit call _isAutorifleman) exitWith { "AR" };
if (_unit call _isMedic) exitWith { "Medic" };
if (_unit call _isEngineer) exitWith { "Engineer" };
if (_unit call _isSniper) exitWith { "Sniper" };
"Man";
