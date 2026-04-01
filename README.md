# equilibrium

### TODOs:
- [ ] separate the UI elements into different objects, that relate store changes to UI changes through callbacks, basically encapsulating the current logic into an object, mimicing the react like declarative element approach (hopefully)
- [x] consolidate between the requestAnimationFrame time, and the simulation
      time
- [ ] modify state store to use the Conditions type to represent internal state
      of the simulation + reactor. when the store notifies the listeners, it
      should map the Conditions type to the ControlsState type.

### System Components

- UI
- Controller (reactor control system)
- Reactor (ammonia synthesis reactor)
- Cooler (heat exchanger)
- Heater (heat exchanger)
- Compressor (compressor)
- Physics simulation

### Data flow

- Targets (temperature, pressure, flow rate, etc.)
- Sensors (temperature, pressure, flow rate, etc.)
