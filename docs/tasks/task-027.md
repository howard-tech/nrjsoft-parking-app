# TASK-027: On-Street Parking Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-027 |
| **Module** | On-Street Parking |
| **Priority** | Critical |
| **Estimated Effort** | 12 hours |
| **Dependencies** | TASK-026, TASK-020 |
| **Status** | 🔴 Not Started |

## Description

Implement the On-Street Parking screen that enables drivers to select city/zone, choose parking duration, pay upfront, and view countdown timer.

## Context from Technical Proposal (Pages 9-10)

### Features:
- Location & zone detection
- City/zone dropdowns
- Duration selector (+/- controls)
- Upfront payment
- Live countdown timer

## Acceptance Criteria

- [ ] Location detection suggests zones
- [ ] City and zone dropdowns
- [ ] Duration selection with steppers
- [ ] Real-time price calculation
- [ ] Payment method selection
- [ ] Countdown timer after payment
- [ ] Extend time option
- [ ] Stop session option

## Technical Implementation

### On-Street Screen

```typescript
// src/screens/onstreet/OnStreetParkingScreen.tsx
export const OnStreetParkingScreen: React.FC = () => {
  const { location } = useLocation();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<OnStreetZone | null>(null);
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 30 });
  const [quote, setQuote] = useState<OnStreetQuote | null>(null);

  const totalMinutes = duration.days * 1440 + duration.hours * 60 + duration.minutes;

  useEffect(() => {
    if (selectedZone && totalMinutes > 0) {
      onStreetService.getQuote(selectedZone.id, totalMinutes).then(setQuote);
    }
  }, [selectedZone, totalMinutes]);

  return (
    <View>
      <LocationHeader city={selectedCity} zone={selectedZone} />
      <Dropdown value={selectedCity} options={cities} onChange={setSelectedCity} />
      <Dropdown value={selectedZone?.id} options={zones} onChange={handleZoneChange} />
      <DurationSelector duration={duration} onChange={setDuration} />
      <Text>EUR {quote?.amount} upfront</Text>
      <Button title="Pay upfront" onPress={handlePayUpfront} />
    </View>
  );
};
```

### Duration Selector

```typescript
// src/screens/onstreet/components/DurationSelector.tsx
export const DurationSelector: React.FC<Props> = ({ duration, onChange }) => (
  <View style={styles.container}>
    <Stepper label="DAYS" value={duration.days} onDecrement={() => onChange({...duration, days: Math.max(0, duration.days - 1)})} onIncrement={() => onChange({...duration, days: duration.days + 1})} />
    <Stepper label="HOURS" value={duration.hours} onDecrement={() => onChange({...duration, hours: Math.max(0, duration.hours - 1)})} onIncrement={() => onChange({...duration, hours: Math.min(23, duration.hours + 1)})} />
    <Stepper label="MINUTES" value={duration.minutes} onDecrement={() => onChange({...duration, minutes: Math.max(0, duration.minutes - 5)})} onIncrement={() => onChange({...duration, minutes: Math.min(55, duration.minutes + 5)})} step={5} />
  </View>
);
```

### Active On-Street Session

```typescript
// src/screens/onstreet/ActiveOnStreetSession.tsx
export const ActiveOnStreetSession: React.FC = () => {
  const { session } = useOnStreetSession();
  const { remainingSeconds, formattedTime } = useCountdownTimer(session?.endTime);

  return (
    <View>
      <Text>Live on-street session</Text>
      <Text style={styles.timer}>{formattedTime}</Text>
      <Text>Countdown until prepaid time expires.</Text>
      <Button title="Extend time" onPress={handleExtend} />
      <Button title="Stop" variant="secondary" onPress={handleStop} />
    </View>
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/onstreet/OnStreetParkingScreen.tsx` | Main screen |
| `src/screens/onstreet/ActiveOnStreetSession.tsx` | Active session |
| `src/screens/onstreet/components/DurationSelector.tsx` | Time picker |
| `src/screens/onstreet/components/Stepper.tsx` | +/- control |
| `src/hooks/useOnStreetSession.ts` | Session hook |
| `src/hooks/useCountdownTimer.ts` | Countdown hook |

## Testing Checklist

- [ ] Location detection works
- [ ] Zone selection updates pricing
- [ ] Duration stepper works correctly
- [ ] Payment flow completes
- [ ] Countdown timer accurate
- [ ] Extend session works
- [ ] Stop session works

## Related Tasks

- **Previous**: [TASK-026](task-026.md)
- **Next**: [TASK-028](task-028.md)
