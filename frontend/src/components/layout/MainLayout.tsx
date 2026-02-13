import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-brand-dark overflow-hidden font-sans">
      <Sidebar />

      <main
        className="flex-1 flex flex-col bg-surface-bg overflow-hidden shadow-2xl transition-all duration-300
        m-0 lg:my-4 lg:mr-4 lg:rounded-[2.5rem] rounded-none"
      >
        <div className="px-6 lg:px-8 pt-6 lg:pt-8 bg-surface-bg z-20">
          <Header />
        </div>

        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8 custom-scrollbar">
          <section className="mt-4 lg:mt-2">{children}</section>
        </div>
      </main>
    </div>
  );
}
