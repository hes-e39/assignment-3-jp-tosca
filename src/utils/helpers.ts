// Add helpers here. This is usually code that is just JS and not React code. Example: write a function that
// calculates number of minutes when passed in seconds. Things of this nature that you don't want to copy/paste

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { Timer } from '../components/context/TimersContextProvider';

export function milisecondsToTime(miliseconds: number): string {
    const seconds = Math.floor((miliseconds / 1000) % 60);
    const minutes = Math.floor((miliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((miliseconds / (1000 * 60 * 60)) % 24);

    const formattedTime = `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
    return formattedTime;
}

export function calculateRoundsVal(rounds: number, type: string): number | undefined {
    const defaultValue = 3;
    if (type === 'Stopwatch' || type === 'Countdown') {
        return undefined;
    } else if (type === 'Tabata') {
        return rounds === 0 ? defaultValue * 2 : rounds * 2;
    }
    return rounds === 0 ? defaultValue : rounds;
}

export function calculateRestDurationVal(restDuration: number, type: string): number | undefined {
    const defaultValue = 2000;
    if (type !== 'Tabata') {
        return undefined;
    }
    return restDuration === 0 ? defaultValue : restDuration;
}

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

export function getTotalTime(timers: Timer[]): string {
    const totalTime = timers.reduce((acc, timer) => {
        if (timer.initialRestDuration && timer.initialRounds) {
            return acc + timer.initialDuration * (timer.initialRounds / 2) + timer.initialRestDuration * (timer.initialRounds / 2);
        } else if (timer.initialRounds) {
            return acc + timer.initialDuration * (timer.initialRounds ?? 0);
        } else {
            return acc + timer.initialDuration;
        }
    }, 0);
    return milisecondsToTime(totalTime);
}

export function getTotalTimeLeft(timers: Timer[]): string {
    const totalTime = timers.reduce((acc, timer) => {
        let time = 0;
        if (timer.restDuration && timer.rounds) {
            if (timer.rounds % 2 === 0) {
                time = timer.initialDuration * (timer.rounds / 2 - 1) + timer.restDuration * (timer.rounds / 2) + timer.duration;
            } else {
                time = timer.initialDuration * (timer.rounds / 2) + timer.restDuration * (timer.rounds / 2 - 1) + timer.duration;
            }
            //return acc + timer.duration * (timer.rounds / 2) + timer.duration * (timer.rounds / 2);
        } else if (timer.rounds && timer.initialRounds) {
            time = timer.initialDuration * (timer.rounds - 1) + timer.duration; //+  - timer.duration * timer.rounds;
        } else {
            if (timer.type === 'Stopwatch') {
                time = timer.initialDuration - timer.duration;
            } else {
                time = timer.duration;
            }
        }
        return acc + time;
    }, 0);
    return milisecondsToTime(totalTime);
}

export function startWorkout(
    running: Timer | Partial<Timer> | null,
    setTimers: Dispatch<SetStateAction<Timer[]>>,
    setRunning: (value: Timer | Partial<Timer> | null) => void,
    setHistory: (value: string[]) => void,
    history: string[],
    intervalRef: MutableRefObject<number | undefined>,
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
