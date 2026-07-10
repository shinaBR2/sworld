import ReactDOM from 'react-dom/client';
import { Popup } from './popup';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Popup />);
}
