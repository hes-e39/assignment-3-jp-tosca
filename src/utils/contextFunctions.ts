import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { Timer } from '../components/context/TimersContextProvider';

/*
 * This function starts the workout and handles the logic for the 4 different timers.
 */
export function startWorkout(
    running: Timer | Partial<Timer> | null,
    setTimers: Dispatch<SetStateAction<Timer[]>>,
    setRunning: (value: Timer | Partial<Timer> | null) => void,
    setHistory: (value: string[]) => void,
    history: string[],
    intervalRef: MutableRefObject<NodeJS.Timeout | undefined>,
): void {
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
}

/*
 * This function stops the workout and resets the timers to their initial values.
 */
export function stopWorkout(setTimers: Dispatch<SetStateAction<Timer[]>>, setRunning: (value: Timer | Partial<Timer> | null) => void): void {
    setRunning(null);

    setTimers(prevTimers =>
        prevTimers.map(timer => ({
            ...timer,
            status: 'stopped',
            duration: timer.type === 'Stopwatch' ? 0 : timer.initialDuration,
            restDuration: timer.initialRestDuration,
            rounds: timer.initialRounds,
        })),
    );
}
