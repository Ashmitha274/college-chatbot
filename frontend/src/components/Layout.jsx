import Sidebar from './Sidebar.jsx';
import ChatbotButton from './common/Chatbot/ChatbotButton.jsx';
import PageWrapper from './common/PageWrapper.jsx';

import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-slate-100">
    <Sidebar />
    <main className="flex-1 p-6 space-y-6">
      {children || <Outlet />}
    </main>
    <ChatbotButton />
  </div>
);

export default Layout;


