import { useEffect, useState } from 'react';

import { useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TimersContext } from '../components/context/TimersContextProvider';
import { TabataTimerInput, TimerInput, TimerTypeSelect, XYTimerInput } from '../components/generic/TimerComps';
import { ContentView } from '../utils/Styled';
import { calculateRestDurationVal, calculateRoundsVal } from '../utils/helpers';

const AddView = () => {
    //Values used by the inputs
    const [duration, setDuration] = useState(3000);
    const [timerLabel, setTimerLabel] = useState('Countdown');
    const [rounds, setRounds] = useState(0);
    const [restDuration, setRestDuration] = useState(0);

    //Value used for the selector
    const [selected, setSelected] = useState(0);
    //Context
    const timersContext = useContext(TimersContext);

    //Timer types inputs and mapping to the values.
    const timerTypes = [
        {
            title: 'Countdown',
            C: <TimerInput duration={duration} setDuration={setDuration} inputLabel="Duration (MS)" timerLabel={timerLabel} setTimerLabel={setTimerLabel} />,
            durationDefault: 3000,
            roundsDefault: 0,
            restDurationDefault: 0,
        },
        {
            title: 'Stopwatch',
            C: <TimerInput duration={duration} setDuration={setDuration} inputLabel="Time limit (MS)" timerLabel={timerLabel} setTimerLabel={setTimerLabel} />,
            durationDefault: 3000,
            roundsDefault: 0,
            restDurationDefault: 0,
        },
        {
            title: 'XY',
            C: <XYTimerInput duration={duration} setDuration={setDuration} rounds={rounds} setRounds={setRounds} timerLabel={timerLabel} setTimerLabel={setTimerLabel} />,
            durationDefault: 3000,
            roundsDefault: 2,
            restDurationDefault: 0,
        },
        {
            title: 'Tabata',
            C: (
                <TabataTimerInput
                    duration={duration}
                    setDuration={setDuration}
                    rounds={rounds}
                    setRounds={setRounds}
                    restDuration={restDuration}
                    setRestDuration={setRestDuration}
                    timerLabel={timerLabel}
                    setTimerLabel={setTimerLabel}
                />
            ),
            durationDefault: 3000,
            roundsDefault: 3,
            restDurationDefault: 2000,
        },
    ];

    const [params] = useSearchParams();

    useEffect(() => {
        const timerId = params.get('timerId');
        if (timerId) {
            const timer = timersContext.timers.find(t => t.id === timerId);
            if (timer) {
                const roundsDivisor = timer.type === 'Tabata' ? 2 : 1;
                setSelected(timerTypes.findIndex(t => t.title === timer.type));
                setDuration(timer.initialDuration || 0);
                setTimerLabel(timer.timerLabel || '');
                setRounds((timer.initialRounds ?? 0) / roundsDivisor || 0);
                setRestDuration(timer.initialRestDuration || 0);
            }
        }
    }, [params, timersContext.timers, timerTypes.findIndex]);

    return (
        <ContentView className="bg-slate-500 fixed bottom-0 left-0 right-0 top-16">
            {params.get('timerId') ? (
                <>
                    <br />
                    <div>{timerTypes[selected].C}</div>
                    <br />
                    <Link
                        className="bg-gray-900 text-white rounded-md p-3 font-medium w-64 text-center"
                        onClick={() => {
                            //These values are calculated diferently depending on the timer type
                            const durationVal = timerTypes[selected].title === 'Stopwatch' ? 0 : duration;
                            const roundsVal = calculateRoundsVal(rounds, timerTypes[selected].title);
                            const restDurationVal = calculateRestDurationVal(restDuration, timerTypes[selected].title);

                            const timerId = params.get('timerId');
                            if (timerId) {
                                timersContext.updateTimer(timerId, {
                                    status: 'stopped',
                                    type: timerTypes[selected].title,
                                    timerLabel: timerLabel,
                                    duration: durationVal,
                                    initialDuration: duration,
                                    rounds: roundsVal,
                                    initialRounds: roundsVal,
                                    restDuration: restDurationVal,
                                    initialRestDuration: restDurationVal,
                                });
                            }
                        }}
                        to="/"
                    >
                        UPDATE
                    </Link>
                </>
            ) : (
                <>
                    <br />
                    <TimerTypeSelect
                        timerTypes={timerTypes}
                        selected={selected}
                        setSelected={setSelected}
                        setDuration={setDuration}
                        setTimerLabel={setTimerLabel}
                        setRounds={setRounds}
                        setRestDuration={setRestDuration}
                    />
                    <br />
                    <div>{timerTypes[selected].C}</div>
                    <br />
                    <Link
                        className="bg-gray-900 text-white rounded-md p-3 font-medium w-64 text-center"
                        onClick={() => {
                            //These values are calculated diferently depending on the timer type
                            const durationVal = timerTypes[selected].title === 'Stopwatch' ? 0 : duration;
                            const roundsVal = calculateRoundsVal(rounds, timerTypes[selected].title);
                            const restDurationVal = calculateRestDurationVal(restDuration, timerTypes[selected].title);

                            timersContext.createTimer({
                                status: 'stopped',
                                type: timerTypes[selected].title,
                                timerLabel: timerLabel,
                                duration: durationVal,
                                initialDuration: duration,
                                rounds: roundsVal,
                                initialRounds: roundsVal,
                                restDuration: restDurationVal,
                                initialRestDuration: restDurationVal,
                            });
                        }}
                        to="/"
                    >
                        ➕ Add
                    </Link>
                </>
            )}
        </ContentView>
    );
};

export default AddView;
