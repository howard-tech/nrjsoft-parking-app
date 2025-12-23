# TASK-014: Search Bar & Parking Filters

## Task Overview

| Field | Value |
|-------|-------|
| **Task ID** | TASK-014 |
| **Module** | Home / Smart Map |
| **Priority** | Medium |
| **Estimated Effort** | 6 hours |
| **Dependencies** | TASK-011 |
| **Status** | 🔴 Not Started |

## Description

Implement the search functionality and filter options for finding parking garages by name, street, destination, or applying filters like "Nearest", "Cheapest", "EV ready", etc.

## Context from Technical Proposal

- Search bar for streets, destinations, or specific garages
- Suggested results appear instantly
- Filter options: Nearest, Cheapest, EV ready, Max time

## Acceptance Criteria

- [ ] Search bar with autocomplete
- [ ] Search results list
- [ ] Filter chips (Nearest, Cheapest, EV ready, Max time)
- [ ] Clear search/filters
- [ ] Recent searches history
- [ ] Map updates based on filters
- [ ] Results sorted by selected filter

## Technical Implementation

### 1. Search Bar Component

```typescript
// src/screens/home/components/SearchBar.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Text,
} from 'react-native';
import { useTheme } from '@theme';
import { useSearch } from '@hooks/useSearch';
import { SearchIcon, CloseIcon, HistoryIcon } from '@components/icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onResultSelect: (result: SearchResult) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onResultSelect }) => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { results, recentSearches, isLoading } = useSearch(query);

  const handleClear = () => {
    setQuery('');
  };

  const handleResultPress = (result: SearchResult) => {
    onResultSelect(result);
    setQuery(result.name);
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: theme.colors.neutral.surface,
          borderColor: isFocused ? theme.colors.primary.main : theme.colors.neutral.border,
        }
      ]}>
        <SearchIcon color={theme.colors.neutral.textSecondary} size={20} />
        <TextInput
          style={[styles.input, { color: theme.colors.neutral.textPrimary }]}
          placeholder="Search garages, streets..."
          placeholderTextColor={theme.colors.neutral.textSecondary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(query)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <CloseIcon color={theme.colors.neutral.textSecondary} size={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Dropdown */}
      {isFocused && (
        <View style={[
          styles.resultsContainer,
          { backgroundColor: theme.colors.neutral.surface }
        ]}>
          {query.length === 0 && recentSearches.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.neutral.textSecondary }]}>
                Recent
              </Text>
              {recentSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => handleResultPress(item)}
                >
                  <HistoryIcon color={theme.colors.neutral.textSecondary} size={16} />
                  <Text style={[styles.resultText, { color: theme.colors.neutral.textPrimary }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {query.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleResultPress(item)}
                >
                  <SearchIcon color={theme.colors.neutral.textSecondary} size={16} />
                  <View style={styles.resultContent}>
                    <Text style={[styles.resultText, { color: theme.colors.neutral.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.resultSubtext, { color: theme.colors.neutral.textSecondary }]}>
                      {item.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isLoading && query.length > 2 ? (
                  <Text style={[styles.emptyText, { color: theme.colors.neutral.textSecondary }]}>
                    No results found
                  </Text>
                ) : null
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 8,
  },
  resultsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '500',
  },
  resultSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
});
```

### 2. Filter Chips Component

```typescript
// src/screens/home/components/FilterChips.tsx
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme';

type FilterType = 'nearest' | 'cheapest' | 'ev_ready' | 'max_time';

interface FilterChipsProps {
  activeFilter: FilterType | null;
  onFilterChange: (filter: FilterType | null) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'nearest', label: 'Nearest' },
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'ev_ready', label: 'EV ready' },
  { key: 'max_time', label: 'Max time' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const theme = useTheme();

  const handlePress = (filter: FilterType) => {
    onFilterChange(activeFilter === filter ? null : filter);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map(({ key, label }) => {
        const isActive = activeFilter === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? theme.colors.primary.main
                  : theme.colors.neutral.surface,
                borderColor: isActive
                  ? theme.colors.primary.main
                  : theme.colors.neutral.border,
              },
            ]}
            onPress={() => handlePress(key)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: isActive
                    ? theme.colors.primary.contrast
                    : theme.colors.neutral.textPrimary,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/screens/home/components/SearchBar.tsx` | Search input with autocomplete |
| `src/screens/home/components/FilterChips.tsx` | Filter chip selector |
| `src/hooks/useSearch.ts` | Search logic and history |
| `src/hooks/useFilters.ts` | Filter state management |

## Testing Checklist

- [ ] Search input focuses correctly
- [ ] Autocomplete shows results
- [ ] Recent searches display
- [ ] Result selection updates map
- [ ] Filter chips toggle correctly
- [ ] Filtered results update on map
- [ ] Clear button works

## Related Tasks

- **Previous**: [TASK-013](task-013.md) - Bottom Sheet
- **Next**: [TASK-015](task-015.md) - QR Scanner
