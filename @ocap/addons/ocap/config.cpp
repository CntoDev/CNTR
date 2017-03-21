class CfgPatches
{
	class ocap
	{
		name = "OCAP";
		author = "Shakan";
		requiredAddons[] = {"A3_Functions_F"};
		units[] = {};
		weapons[] = {};
	};
};

class CfgFunctions
{
	class ocap
	{
		class null
		{
			file = "ocap\functions";
			class init {postInit = 1;};
			class startCapture {};
			class startCaptureLoop {};
			class stopCapture {};
			class export {};
			class writeEvent {};
			class addMissionEventHandlers {};
			class removeMissionEventHandlers {};
			class addEntityEventHandlers {};
			class removeEntityEventHandlers {};
			class initEntity {};
			class processEntity {};
			class eventHandlerFired {};
			class eventHandlerShot {};
			class getVehicleKind {};
			class round {};
			class logDebug {};
			class addDebugPlayerActions {};
			class flushWriteBuffer {};
		};
	};
};
