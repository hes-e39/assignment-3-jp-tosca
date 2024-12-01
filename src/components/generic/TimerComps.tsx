import { type Dispatch, type SetStateAction, useContext } from 'react';
import { Link } from 'react-router-dom';
import { RemoveButtonStyle } from '../../utils/Styled';
import { type Timer, TimersContext } from '../context/TimersContextProvider';
import Countdown from '../timers/Countdown';
import Stopwatch from '../timers/Stopwatch';
import Tabata from '../timers/Tabata';
import XY from '../timers/XY';

/*
 *
 */
type TimeDisplayProps = {
    value: string;
    label?: string;
};

export const TimeDisplay = ({ value, label }: TimeDisplayProps) => {
    return (
        <h1 className="text-2xl font text-center p-1">
            {label !== undefined ? `${label}: ` : ''}
            {value}
        </h1>
    );
};

/*
 * Props for the TimerButton component.
 */
type TimerButtonProps = {
    onClickParam: () => void;
    timerButtonLabel: string;
};

/*
 * Button to controll the workout.
 */
export const TimerButton = ({ onClickParam, timerButtonLabel }: TimerButtonProps) => {
    return <button onClick={onClickParam}> {timerButtonLabel} </button>;
};

/*
 * Component for the controllers of the workout.
 */
export const ControlsDiv = ({ children }: { children: React.ReactNode }) => {
    // mx-auto px-6 py-3 flex items-center
    return <div className="bg-gray-800 absolute bottom-0 right-0 left-0 flex-col text-center space-x-4 text-6xl p-5 ">{children}</div>;
};

/**
 * Props for the TimerTypeSelect component.
 */
type selectTimerProps = {
    timerTypes: {
        title: string;
        durationDefault: number;
        roundsDefault: number;
        restDurationDefault: number;
    }[];
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
    setDuration: Dispatch<SetStateAction<number>>;
    setTimerLabel: Dispatch<SetStateAction<string>>;
    setRounds: Dispatch<SetStateAction<number>>;
    setRestDuration: Dispatch<SetStateAction<number>>;
};

/*
 * Component to handle the selection of the time of timer to add.
 */
export const TimerTypeSelect = ({ timerTypes, selected, setSelected, setDuration, setTimerLabel, setRounds, setRestDuration }: selectTimerProps) => {
    return (
        <div className="w-64">
            <label htmlFor="timerType" className="px-4 font-bold">
                Timer Type
            </label>
            <select
                id="timerType"
                className="bg-gray-900 text-white rounded-md px-3 py-3 text-sm font-medium"
                value={selected}
                onChange={event => {
                    const selected = Number.parseInt(event.target.value);
                    setSelected(selected);
                    setDuration(timerTypes[selected].durationDefault || 0);
                    setTimerLabel(timerTypes[selected].title);
                    setRounds(timerTypes[selected].roundsDefault || 0);
                    setRestDuration(timerTypes[selected].restDurationDefault || 0);
                }}
            >
                {timerTypes.map((timer, index) => (
                    <option key={timer.title} value={index}>
                        {timer.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export const TimerInputsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-wrap w-full">
            <div className="w-full">{children}</div>
        </div>
    );
};

export type TimerInputComponentProps<T> = {
    label: string;
    id: string;
    defaultValue?: number | string | undefined;
    min?: number;
    max?: number;
    type?: string;
    value?: number | string;
    setValue?: Dispatch<SetStateAction<T>>;
};

export const TimerInputComponent = <T extends string | number>({ label, id, min, max, type = 'number', value, setValue }: TimerInputComponentProps<T>) => {
    return (
        <>
            <div className="flex items-center ">
                <label className="text-white font-bold mb-1 md:mb-0 whitespace-nowrap mr-2" htmlFor={id}>
                    {label}
                </label>
            </div>
            <div className="flex items-center col-span-3 w-64">
                <input
                    className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-800"
                    id={id}
                    type={type}
                    min={min}
                    max={max}
                    value={value}
                    onChange={event => {
                        if (setValue) {
                            if (typeof value === 'number') {
                                setValue(Number.parseInt(event.target.value) as T);
                            } else {
                                setValue(event.target.value as T);
                            }
                        }
                    }}
                />
            </div>
        </>
    );
};

/**
 * Props for the TimerInput component.
 */
type TimerInputProps = {
    duration: number;
    setDuration: Dispatch<SetStateAction<number>>;
    inputLabel: string;
    timerLabel: string;
    setTimerLabel: Dispatch<SetStateAction<string>>;
};

/**
 * Component for the input of the time of the countdown or Stopwatch timers.
 */
export const TimerInput = ({ duration, setDuration, inputLabel, timerLabel, setTimerLabel }: TimerInputProps) => {
    return (
        <TimerInputsContainer>
            <TimerInputComponent label="Title" id="titleInput" type="text" value={timerLabel} setValue={setTimerLabel} defaultValue={'asd'} />
            <TimerInputComponent label={inputLabel} id="timeInput" min={1000} max={84400000} defaultValue={3000} value={duration} setValue={setDuration} />
        </TimerInputsContainer>
    );
};

/*
 * Props for the XYTimerInput component.
 */
type XYTimerInputProps = {
    duration: number;
    setDuration: Dispatch<SetStateAction<number>>;
    rounds: number;
    setRounds: Dispatch<SetStateAction<number>>;
    labelDuration?: string;
    labelRounds?: string;
    timerLabel?: string;
    setTimerLabel?: Dispatch<SetStateAction<string>>;
};

/*
 * Component for the input of the time and rounds of the XY timer.
 */
export const XYTimerInput = ({ duration, setDuration, rounds, setRounds, timerLabel, setTimerLabel, labelDuration = 'Round Duration (MS)', labelRounds = 'Rounds' }: XYTimerInputProps) => {
    return (
        <TimerInputsContainer>
            <TimerInputComponent label="Title" id="titleInput" type="text" value={timerLabel} setValue={setTimerLabel} />
            <TimerInputComponent label={labelDuration} id="timeInput" min={1000} max={84400000} defaultValue={3000} value={duration} setValue={setDuration} />
            <TimerInputComponent label={labelRounds} id="roundsInput" min={1} max={100} defaultValue={3} value={rounds} setValue={setRounds} />
        </TimerInputsContainer>
    );
};

/*
 * Props for the TabataTimerInput component.
 */
type TabataTimerInputProps = {
    duration: number;
    setDuration: Dispatch<SetStateAction<number>>;
    restDuration: number;
    setRestDuration: Dispatch<SetStateAction<number>>;
    rounds: number;
    setRounds: Dispatch<SetStateAction<number>>;
    labelDuration?: string;
    labelRestDuration?: string;
    labelRounds?: string;
    timerLabel?: string;
    setTimerLabel?: Dispatch<SetStateAction<string>>;
};

/*
 * Component for the input of the time, rest time and rounds of the Tabata timer.
 */
export const TabataTimerInput = ({
    duration,
    setDuration,
    rounds,
    setRounds,
    restDuration,
    setRestDuration,
    labelDuration = 'Active Duration',
    labelRestDuration = 'Rest Duration',
    labelRounds = 'Rounds',
    timerLabel,
    setTimerLabel,
}: TabataTimerInputProps) => {
    return (
        <TimerInputsContainer>
            <TimerInputComponent label="Title" id="titleInput" type="text" defaultValue={timerLabel} value={timerLabel} setValue={setTimerLabel} />
            <TimerInputComponent label={labelDuration} id="timeInput" min={1000} max={84400000} defaultValue={3000} value={duration} setValue={setDuration} />
            <TimerInputComponent label={labelRestDuration} id="restInput" min={1000} max={84400000} defaultValue={2000} value={restDuration} setValue={setRestDuration} />
            <TimerInputComponent label={labelRounds} id="roundsInput" min={1} max={100} defaultValue={3} value={rounds} setValue={setRounds} />
        </TimerInputsContainer>
    );
};

/*
 * Component for the removal of a timer.
 */
export const RemoveButton = ({ removeId }: { removeId: string }) => {
    const timersContext = useContext(TimersContext);
    return <RemoveButtonStyle onClick={() => timersContext.deleteTimer(removeId)}>❌</RemoveButtonStyle>;
};

/*
 * Button to move the timer to the left.
 */
export const LeftButton = ({ editId }: { editId: string }) => {
    const timersContext = useContext(TimersContext);
    return (
        <RemoveButtonStyle
            onClick={() => {
                const index = timersContext.timers.findIndex(timer => timer.id === editId);
                timersContext.swapTimers(editId, timersContext.timers[index - 1].id);
            }}
        >
            ⬅️
        </RemoveButtonStyle>
    );
};

/*
 * Button to move the timer to the right.
 */
export const RightButton = ({ editId }: { editId: string }) => {
    const timersContext = useContext(TimersContext);
    return (
        <RemoveButtonStyle
            onClick={() => {
                const index = timersContext.timers.findIndex(timer => timer.id === editId);
                timersContext.swapTimers(editId, timersContext.timers[index + 1].id);
            }}
        >
            ➡️
        </RemoveButtonStyle>
    );
};

export const EditButton = ({ editId }: { editId: string }) => {
    return (
        <Link to={`/add?timerId=${editId}`}>
            <RemoveButtonStyle>✏️</RemoveButtonStyle>
        </Link>
    );
};

/*
 * Component to display all the timers of the workout.
 */
export const TimersDisplay = ({ timers }: { timers: Timer[] }) => {
    return (
        <>
            {timers.map(timer => (
                <div key={timer.id}>
                    {timer.type === 'Countdown' ? (
                        <Countdown id={timer.id} />
                    ) : timer.type === 'Stopwatch' ? (
                        <Stopwatch id={timer.id} />
                    ) : timer.type === 'XY' ? (
                        <XY id={timer.id} />
                    ) : timer.type === 'Tabata' ? (
                        <Tabata id={timer.id} />
                    ) : null}
                </div>
            ))}
        </>
    );
};

export const StatusDisplay = ({ status, children }: { status: string | undefined; children: React.ReactNode }) => {
    const classNameColor = status === 'finished' ? 'bg-slate-800' : status === 'stopped' ? 'bg-white' : 'bg-lime-200';

    return <div className={`${classNameColor} rounded-lg m-3 border-2 border-gray-800`}>{children}</div>;
};

export const HeaderButton = ({ targetParam, buttonLabel }: { targetParam: string; buttonLabel: string }) => {
    return (
        <Link className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium" to={targetParam}>
            {buttonLabel}
        </Link>
    );
};
