import { useContext } from 'react';
import { Timer, TimerTitle } from '../../utils/Styled.tsx';
import { milisecondsToTime } from '../../utils/helpers';
import { TimersContext } from '../context/TimersContextProvider.tsx';
import { EditButton, LeftButton, RemoveButton, RightButton, StatusDisplay, TimeDisplay } from '../generic/TimerComps.tsx';

type XYProps = {
    id: string;
};

const XY = ({ id }: XYProps) => {
    const timersContext = useContext(TimersContext);
    const t = timersContext.timers.find(timer => timer.id === id);
    const timerIndex = timersContext.timers.findIndex(timer => timer.id === id);

    const roundsValue = `${t?.rounds?.toString()}/${t?.initialRounds}`;
    return (
        <StatusDisplay status={t?.status}>
            <Timer>
                <TimerTitle>
                    <RemoveButton removeId={id} />
                    <EditButton editId={id} />
                    {timerIndex > 0 && <LeftButton editId={id} />}
                    {timerIndex < timersContext.timers.length - 1 && <RightButton editId={id} />}
                    {t?.timerLabel || 'XY'}
                </TimerTitle>
                <TimeDisplay value={roundsValue} label={'Rounds'} />
                <TimeDisplay value={milisecondsToTime(t?.duration || 0)} />
            </Timer>
        </StatusDisplay>
    );
};

export default XY;
