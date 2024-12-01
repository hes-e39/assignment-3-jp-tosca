import { useContext } from 'react';
import { Timer, TimerTitle } from '../../utils/Styled.tsx';
import { milisecondsToTime } from '../../utils/helpers';
import { TimersContext } from '../context/TimersContextProvider.tsx';
import { EditButton, LeftButton, RemoveButton, RightButton, StatusDisplay, TimeDisplay } from '../generic/TimerComps.tsx';

type CountdownProps = {
    id: string;
};

const Countdown = ({ id }: CountdownProps) => {
    const timersContext = useContext(TimersContext);
    const t = timersContext.timers.find(timer => timer.id === id);
    const timerIndex = timersContext.timers.findIndex(timer => timer.id === id);

    return (
        <StatusDisplay status={t?.status}>
            <Timer>
                <TimerTitle>
                    <RemoveButton removeId={id} />
                    <EditButton editId={id} />
                    {timerIndex > 0 && <LeftButton editId={id} />}
                    {timerIndex < timersContext.timers.length - 1 && <RightButton editId={id} />}
                    {t?.timerLabel || 'Countdown'}
                </TimerTitle>
                <TimeDisplay value={milisecondsToTime(t?.duration || 0)} />
            </Timer>
        </StatusDisplay>
    );
};

export default Countdown;
