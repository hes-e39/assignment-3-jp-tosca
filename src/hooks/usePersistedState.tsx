import { useEffect, useState } from 'react';

function getInitialValue<T>(storageKey: string, defaultValue: T): T {
    const storedValue = window.localStorage.getItem(storageKey);

    if (storedValue === null) {
        return defaultValue;
    }

    try {
        return JSON.parse(storedValue);
    } catch (e) {
        return defaultValue;
    }
}

// ...
export function usePersistedState<T>(storageKey: string, defaultValue: T): [T, (value: T) => void] {
    const [value, setValue] = useState(() => getInitialValue(storageKey, defaultValue));

    useEffect(() => {
        if (value) {
            window.localStorage.setItem(storageKey, JSON.stringify(value));
        } else {
            window.localStorage.removeItem(storageKey);
        }

        const storageEvent = new StorageEvent('storage', {
            key: storageKey,
            newValue: JSON.stringify(value),
            storageArea: window.localStorage,
        });
        window.dispatchEvent(storageEvent);
    }, [storageKey, value]);

    useEffect(() => {
        const listener = (event: StorageEvent) => {
            if (event.key === storageKey && event.newValue !== JSON.stringify(value)) {
                setValue(event.newValue === null ? defaultValue : JSON.parse(event.newValue));
            }
        };
        window.addEventListener('storage', listener);
        return () => window.removeEventListener('storage', listener);
    }, [storageKey, value, defaultValue]);

    return [value, setValue];
}
