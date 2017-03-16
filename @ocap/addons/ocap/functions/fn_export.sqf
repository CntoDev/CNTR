params ["_callName", "_args"];

switch (_callName) do {
    case "start": { "ocap_exporter" callExtension format ["start::%1", _args]; };
    case "append": { "ocap_exporter" callExtension format ["append::%1", _args]; };
    case "stop": { "ocap_exporter" callExtension format ["stop::%1", _args]; };
};
