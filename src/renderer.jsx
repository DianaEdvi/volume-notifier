import {createRoot} from "react-dom/client";
import Profile from "./components/Profile";
import MicOscilloscope from "./components/audioTracker";

const App = ()=>{
    return (
        <>
        <Profile/>
        <MicOscilloscope/>
        </>
    );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App/>);