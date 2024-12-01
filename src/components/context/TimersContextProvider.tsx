import { type MutableRefObject, createContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePersistedState } from '../../hooks/usePersistedState';
import { startWorkout, stopWorkout } from '../../utils/contextFunctions';

export type Timer = {
    id: string;
    timerLabel?: string;
    status: string;
    type: string;
    initialDuration: number;
    duration: number;
    initialRounds?: number;
    rounds?: number;
    initialRestDuration?: number;
    restDuration?: number;
};

export type TimersContextType = {
    timers: Timer[];
    running: Timer | Partial<Timer> | null;
    setRunning: (timer: Timer | Partial<Timer> | null) => void;
    createTimer: (timer: {
        status?: string;
        timerLabel?: string;
        type: string;
        duration: number;
        initialDuration: number;
        rounds?: number;
        initialRounds?: number;
        restDuration?: number;
        initialRestDuration?: number;
    }) => Timer;
    updateTimer: (
        id: string,
        timer: {
            status?: string;
            timerLabel?: string;
            type?: string;
            duration?: number;
            initialDuration?: number;
            rounds?: number;
            initialRounds?: number;
            restDuration?: number;
            initialRestDuration?: number;
        },
    ) => void;
    deleteTimer: (id: string) => void;
    swapTimers: (id1: string, id2: string) => void;
    startWorkout: () => void;
    stopWorkout: () => void;
    fastForward: () => void;
};

export const TimersContext = createContext<TimersContextType>({
    timers: [],
    running: null,
    createTimer: () => ({
        id: '',
        status: '',
        type: '',
        duration: 0,
        initialDuration: 0,
        setDuration: () => {},
    }),
    updateTimer: () => {},
    setRunning: () => {},
    deleteTimer: () => {},
    startWorkout: () => {},
    stopWorkout: () => {},
    fastForward: () => {},
    swapTimers: () => {},
});

const TimersContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [timers, setTimers] = useState<Timer[]>([]);
    //const [running, setRunning] = useState<Timer | Partial<Timer> | null>(null);
    const [running, setRunning] = usePersistedState<Timer | Partial<Timer> | null>('running', null);
    const intervalRef: MutableRefObject<NodeJS.Timeout | undefined> = useRef();
    const [history, setHistory] = usePersistedState<string[]>('history', []);
    const [params, setParams] = useSearchParams();

    useEffect(() => {
        if (running === null) {
            clearInterval(intervalRef.current);
        }
    }, [running]);

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        const timersParam = params.get('timers');
        if (timers.length === 0 && timersParam) {
            //We initialize the timers with the timers from the URL and reset the workout if it was not running.
            setTimers(JSON.parse(timersParam));
            if (running === null) {
                stopWorkout(setTimers, setRunning);
            } else {
                startWorkout(null, setTimers, setRunning, setHistory, history, intervalRef);
            }
        } else if (timers.length > 0) {
            //We update the URL with the current timers.
            const timersString = JSON.stringify(timers);
            params.set('timers', timersString);
            setParams(params);
        }
    }, [params, timers, setParams, running, setRunning, history, setHistory]);

    return (
        <TimersContext.Provider
            value={{
                timers,
                running,
                setRunning,
                createTimer: ({ type, timerLabel, duration, initialDuration, rounds, initialRounds, restDuration, initialRestDuration }) => {
                    const newTimer = {
                        id: `${Date.now()}`,
                        status: 'stopped',
                        timerLabel,
                        type,
                        duration,
                        initialDuration,
                        initialRounds,
                        rounds,
                        initialRestDuration,
                        restDuration,
                    };
                    setTimers([...timers, newTimer]);
                    return newTimer;
                },
                updateTimer: (id, { status, timerLabel, type, duration, initialDuration, rounds, initialRounds, restDuration, initialRestDuration }) => {
                    const timerIndex = timers.findIndex(timer => timer.id === id);
                    if (timerIndex === -1) return;
                    const updatedTimers = [...timers];
                    const updatedTimer = { ...updatedTimers[timerIndex] };
                    if (status) updatedTimer.status = status;
                    if (timerLabel) updatedTimer.timerLabel = timerLabel;
                    if (type) updatedTimer.type = type;
                    if (duration) updatedTimer.duration = duration;
                    if (initialDuration) updatedTimer.initialDuration = initialDuration;
                    if (rounds) updatedTimer.rounds = rounds;
                    if (initialRounds) updatedTimer.initialRounds = initialRounds;
                    if (restDuration) updatedTimer.restDuration = restDuration;
                    if (initialRestDuration) updatedTimer.initialRestDuration = initialRestDuration;
                    updatedTimers[timerIndex] = updatedTimer;
                    setTimers(updatedTimers);
                },
                deleteTimer: id => {
                    if (timers.length === 1) {
                        params.delete('timers');
                        setParams(params);
                    }
                    setTimers(timers.filter(t => t.id !== id));
                },
                startWorkout: () => {
                    startWorkout(running, setTimers, setRunning, setHistory, history, intervalRef);
                },
                stopWorkout: () => {
                    stopWorkout(setTimers, setRunning);
                },
                fastForward: () => {
                    if (running !== null) {
                        setTimers(prevTimers => {
                            const timerIndex = prevTimers.findIndex(timer => timer.id === running.id);
                            if (timerIndex === -1) return prevTimers;
                            const updatedTimers = [...prevTimers];
                            const nextTimer = { ...updatedTimers[timerIndex] };
                            nextTimer.duration = nextTimer.type === 'Stopwatch' ? nextTimer.initialDuration : 0;
                            nextTimer.restDuration = nextTimer.restDuration === undefined ? undefined : 0;
                            nextTimer.rounds = nextTimer.rounds === undefined ? undefined : 0;
                            nextTimer.status = 'finished';
                            updatedTimers[timerIndex] = nextTimer;
                            setRunning(updatedTimers[timerIndex + 1] || null);
                            return updatedTimers;
                        });
                    }
                },
                swapTimers: (id1, id2) => {
                    const index1 = timers.findIndex(t => t.id === id1);
                    const index2 = timers.findIndex(t => t.id === id2);
                    const newTimers = [...timers];
                    const temp = newTimers[index1];
                    newTimers[index1] = newTimers[index2];
                    newTimers[index2] = temp;
                    setTimers(newTimers);
                },
            }}
        >
            {children}
        </TimersContext.Provider>
    );
};

export default TimersContextProvider;
