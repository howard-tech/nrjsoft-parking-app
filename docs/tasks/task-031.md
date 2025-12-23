# TASK-031: Vehicle Management Screen

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-031 |
| **Module** | Account |
| **Priority** | High |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-030 |
| **Status** | 🔴 Not Started |

## Description

Implement the vehicle management screen with license plate registration, OCR plate scanning, and fleet vehicle support.

## Context from Technical Proposal (Page 16)

- License plate input with country code
- Nickname for vehicles
- OCR-based plate scanning
- Fleet garage vehicles displayed

## Acceptance Criteria

- [ ] Vehicle list display
- [ ] Add new vehicle form
- [ ] OCR plate scanning
- [ ] Edit existing vehicle
- [ ] Delete vehicle
- [ ] Country code selection
- [ ] Fleet vehicles section

## Technical Implementation

### Vehicles Tab

```typescript
// src/screens/account/tabs/VehiclesTab.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { useVehicles } from '@hooks/useVehicles';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleFormModal } from '../components/VehicleFormModal';

export const VehiclesTab: React.FC = () => {
  const theme = useTheme();
  const { vehicles, fleetVehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.neutral.textSecondary }]}>
          VEHICLES
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.neutral.textSecondary }]}>
          Manage license plates across fleets.
        </Text>
      </View>

      {/* User Vehicles */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onEdit={() => {
              setEditingVehicle(item);
              setShowForm(true);
            }}
            onDelete={() => deleteVehicle(item.id)}
          />
        )}
        ListFooterComponent={
          <Button
            title="Add Vehicle"
            onPress={() => setShowForm(true)}
            variant="secondary"
          />
        }
      />

      {/* Fleet Vehicles */}
      {fleetVehicles.length > 0 && (
        <View style={styles.fleetSection}>
          <Text style={styles.fleetTitle}>FLEET GARAGE</Text>
          {fleetVehicles.map((vehicle) => (
            <FleetVehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </View>
      )}

      <VehicleFormModal
        visible={showForm}
        vehicle={editingVehicle}
        onClose={() => {
          setShowForm(false);
          setEditingVehicle(null);
        }}
        onSave={(data) => {
          if (editingVehicle) {
            updateVehicle(editingVehicle.id, data);
          } else {
            addVehicle(data);
          }
          setShowForm(false);
          setEditingVehicle(null);
        }}
      />
    </View>
  );
};
```

### Vehicle Form with OCR

```typescript
// src/screens/account/components/VehicleFormModal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export const VehicleFormModal: React.FC<Props> = ({ visible, vehicle, onClose, onSave }) => {
  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate || '');
  const [countryCode, setCountryCode] = useState(vehicle?.countryCode || 'EU');
  const [nickname, setNickname] = useState(vehicle?.nickname || '');
  const [isScanning, setIsScanning] = useState(false);

  const handleScanPlate = async () => {
    try {
      setIsScanning(true);
      const result = await launchCamera({ mediaType: 'photo' });
      
      if (result.assets?.[0]?.uri) {
        const textResult = await TextRecognition.recognize(result.assets[0].uri);
        // Extract license plate pattern
        const platePattern = /[A-Z]{1,3}[\s-]?[A-Z]{1,2}[\s-]?\d{1,4}/g;
        const matches = textResult.text.match(platePattern);
        if (matches?.[0]) {
          setLicensePlate(matches[0].replace(/[\s-]/g, ' ').trim());
        }
      }
    } catch (error) {
      console.error('OCR failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>License plate</Text>
          <TextInput
            style={styles.input}
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="NRJ 123E"
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Country code</Text>
          <Dropdown
            value={countryCode}
            options={[
              { label: 'EU', value: 'EU' },
              { label: 'DE', value: 'DE' },
              { label: 'BG', value: 'BG' },
              // Add more countries
            ]}
            onChange={setCountryCode}
          />

          <Text style={styles.label}>Nickname</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Fleet Van"
          />

          <TouchableOpacity style={styles.scanButton} onPress={handleScanPlate}>
            <CameraIcon />
            <Text style={styles.scanText}>
              {isScanning ? 'Scanning...' : 'Scan plate (OCR)'}
            </Text>
          </TouchableOpacity>

          <Button
            title="Save vehicle"
            onPress={() => onSave({ licensePlate, countryCode, nickname })}
            disabled={!licensePlate}
          />
        </View>
      </View>
    </Modal>
  );
};
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/account/tabs/VehiclesTab.tsx` | Vehicles list |
| `src/screens/account/components/VehicleCard.tsx` | Vehicle item |
| `src/screens/account/components/VehicleFormModal.tsx` | Add/edit form |
| `src/hooks/useVehicles.ts` | Vehicles hook |

## Dependencies

```bash
npm install @react-native-ml-kit/text-recognition react-native-image-picker
```

## Testing Checklist

- [ ] Vehicle list displays
- [ ] Add vehicle works
- [ ] OCR scans plate correctly
- [ ] Edit vehicle works
- [ ] Delete vehicle works
- [ ] Fleet vehicles display

## Related Tasks

- **Previous**: [TASK-030](task-030.md)
- **Next**: [TASK-032](task-032.md)
