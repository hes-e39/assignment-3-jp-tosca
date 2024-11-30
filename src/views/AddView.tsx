import { useEffect, useState } from 'react';

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TimersContext } from '../components/context/TimersContextProvider';
import { TabataTimerInput, TimerInput, TimerTypeSelect, XYTimerInput } from '../components/generic/TimerComps';
import { ContentView } from '../utils/Styled';
import { calculateRestDurationVal, calculateRoundsVal } from '../utils/helpers';

const AddView = () => {
    //Values used by the inputs
    const [duration, setDuration] = useState(3000);
    const [timerLabel, setTimerLabel] = useState('');
    const [rounds, setRounds] = useState(0);
    const [restDuration, setRestDuration] = useState(0);
    //Value used for the selector
    const [selected, setSelected] = useState(0);
    //Context
    const timersContext = useContext(TimersContext);

    useEffect(() => {
        setTimerLabel(timerTypes[selected].C.props.timerLabel);
    }, [selected]);

    //Timer types inputs and mapping to the values.
    const timerTypes = [
        { title: 'Countdown', C: <TimerInput setDuration={setDuration} inputLabel="Duration (MS)" timerLabel="Countdown" setTimerLabel={setTimerLabel} /> },
        { title: 'Stopwatch', C: <TimerInput setDuration={setDuration} inputLabel="Time limit (MS)" timerLabel="Stopwatch" setTimerLabel={setTimerLabel} /> },
        { title: 'XY', C: <XYTimerInput setDuration={setDuration} setRounds={setRounds} timerLabel="XY" setTimerLabel={setTimerLabel} /> },
        { title: 'Tabata', C: <TabataTimerInput setDuration={setDuration} setRounds={setRounds} setRestDuration={setRestDuration} timerLabel="Tabata" setTimerLabel={setTimerLabel} /> },
    ];

    return (
        <ContentView className="bg-slate-500 fixed bottom-0 left-0 right-0 top-16">
            <br />
            <TimerTypeSelect timerTypes={timerTypes} selected={selected} setSelected={setSelected} />
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
        </ContentView>
    );
};

export default AddView;
