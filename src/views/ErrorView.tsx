import { ContentView } from '../utils/Styled';

const ErrorView = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
    return (
        <ContentView className="bg-slate-500 fixed bottom-0 left-0 right-0 top-16 ">
            <div role="alert">
                <p>Something went wrong:</p>
                <pre>{error.message}</pre>
                <button onClick={resetErrorBoundary}>Try again</button>
            </div>
        </ContentView>
    );
};

export default ErrorView;
