import { type MutableRefObject, createContext, useEffect, useRef, useState } from 'react';
import { usePersistedState } from '../../hooks/usePersistedState';
import { stopWorkout } from '../../utils/helpers';

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
    deleteTimer: (id: string) => void;
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
    setRunning: () => {},
    deleteTimer: () => {},
    startWorkout: () => {},
    stopWorkout: () => {},
    fastForward: () => {},
});

const TimersContextProvider = ({ children }: { children: React.ReactNode }) => {
    //const [timers, setTimers] = useState<Timer[]>([]);
    const [timers, setTimers] = useState<Timer[]>([]);
    const [running, setRunning] = useState<Timer | Partial<Timer> | null>(null);
    const intervalRef: MutableRefObject<number | undefined> = useRef();
    const [history, setHistory] = usePersistedState<string[]>('history', []);

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
                deleteTimer: id => setTimers(timers.filter(t => t.id !== id)),
                startWorkout: () => {
                    if (running === null) {
                        intervalRef.current = setInterval(() => {
                            setTimers(prevTimers => {
                                //We get the index ot the current timer on the array.
                                const timerIndex = prevTimers.findIndex(timer => timer.status === 'stopped' || timer.status === 'running');

                                //If no timer is left to run we restart the workout.
                                if (timerIndex === -1) {
                                    stopWorkout(setTimers, setRunning);
                                    return prevTimers;
                                }

                                const updatedTimers = [...prevTimers];
                                const nextTimer = { ...updatedTimers[timerIndex] };

                                //We increase or decrease the time depending on the type of timer, stopwatch is the only one that goes forward in time.
                                const timeIncrease = nextTimer.type === 'Stopwatch' ? 1000 : -1000;
                                nextTimer.duration += timeIncrease;

                                // The logic for the 4 timers is handled here.
                                if (nextTimer.duration <= 0) {
                                    if (nextTimer.rounds !== undefined && nextTimer.rounds > 1) {
                                        nextTimer.rounds -= 1;
                                        if (nextTimer.restDuration === undefined) {
                                            nextTimer.duration = nextTimer.initialDuration;
                                        } else {
                                            if (nextTimer.rounds % 2 === 0) {
                                                nextTimer.duration = nextTimer.initialDuration;
                                            } else {
                                                nextTimer.duration = nextTimer.initialRestDuration ? nextTimer.initialRestDuration : 0;
                                            }
                                        }
                                    } else {
                                        if (nextTimer.rounds !== undefined) {
                                            nextTimer.rounds -= 1;
                                        }
                                        nextTimer.status = 'finished';
                                    }
                                } else if (nextTimer.type === 'Stopwatch' && nextTimer.duration >= nextTimer.initialDuration) {
                                    nextTimer.status = 'finished';
                                } else {
                                    nextTimer.status = 'running';
                                }

                                updatedTimers[timerIndex] = nextTimer;
                                setRunning(updatedTimers[timerIndex]);

                                if (timerIndex === updatedTimers.length - 1 && nextTimer.status === 'finished') {
                                    setHistory([...history, new Date().toLocaleString()]);
                                }

                                return updatedTimers;
                            });
                        }, 1000);
                    } else {
                        //We pause the workout.
                        setRunning(null);
                    }
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
            }}
        >
            {children}
        </TimersContext.Provider>
    );
};

export default TimersContextProvider;
