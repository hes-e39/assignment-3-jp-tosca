import { usePersistedState } from '../hooks/usePersistedState';
import { ContentView } from '../utils/Styled';

const HistoryView = () => {
    const [history, setHistory] = usePersistedState<string[]>('history', []);
    return (
        <ContentView className="bg-slate-500 fixed bottom-0 left-0 right-0 top-16 ">
            <br />
            <button
                className="bg-gray-900 text-white rounded-md p-3 font-medium w-64 text-center"
                onClick={() => {
                    setHistory([]);
                }}
            >
                Clear History
            </button>
            <br />

            {history.length > 0 ? (
                <table className="table-auto bg-slate-300">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((date, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <h3 className="text-2xl text-center">No history yet</h3>
            )}
        </ContentView>
    );
};

export default HistoryView;
