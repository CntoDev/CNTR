params ["_callName", "_args"];

switch (_callName) do {
    case "start": { "cntr_exporter" callExtension format ["start::%1", _args]; };
    case "append": { "cntr_exporter" callExtension format ["append::%1", _args]; };
    case "stop": { "cntr_exporter" callExtension format ["stop::%1", _args]; };
};
