
import {createRoot} from 'react-dom/client';


const App = () =>{
  return <h1>Hello, Pylotix!</h1>
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App/>);