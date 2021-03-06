class CfgPatches
{
	class cntr
	{
		name = "CNTR";
		author = "Shakan";
		requiredAddons[] = {"A3_Functions_F"};
		units[] = {};
		weapons[] = {};
	};
};

class CfgFunctions
{
	class cntr
	{
		class null
		{
			file = "cntr\functions";
			class init {postInit = 1;};
			class startCapture {};
			class startCaptureLoop {};
			class stopCapture {};
			class writeEvent {};
			class addMissionEventHandlers {};
			class removeMissionEventHandlers {};
			class addEntityEventHandlers {};
			class removeEntityEventHandlers {};
			class initEntity {};
			class processEntity {};
			class eventHandlerFired {};
			class getUnitKind {};
			class getVehicleKind {};
			class round {};
			class logDebug {};
			class addDebugPlayerActions {};
			class processMapMarkers {};
			class initMapMarkers {};
		};
	};
};
