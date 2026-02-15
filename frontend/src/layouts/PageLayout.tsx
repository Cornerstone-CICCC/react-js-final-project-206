import { Outlet } from 'react-router';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import { useUIStore } from '../store/ui.store';
import AddExpenseModal from '../components/expenses/AddExpenseModal';

export default function AppLayout() {
  const { isAddExpenseModalOpen, closeAddExpenseModal } = useUIStore();

  return (
    <div className="bg-[#0F1115]">
      <div className="flex h-screen w-full bg-[#0F1115] overflow-hidden font-sans max-w-360 mx-auto">
        <Sidebar />
        <main
          className="
          flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden shadow-2xl transition-all duration-300
          m-0 lg:my-4 lg:mr-4 lg:rounded-[2.5rem] rounded-none relative
        "
        >
          <div className="px-6 lg:px-8 bg-[#F8FAFC] z-20">
            <TopHeader />
          </div>
          <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8 custom-scrollbar">
            <section className="mt-4 lg:mt-2 h-full">
              <Outlet />
            </section>
          </div>

          {isAddExpenseModalOpen && (
            <AddExpenseModal isOpen={true} onClose={closeAddExpenseModal} />
          )}
        </main>
      </div>
    </div>
  );
}
