import { useOutlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './AdminLayout.module.css';
import { AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../common/PageWrapper';

export function AdminLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <PageWrapper key={location.pathname}>
            {currentOutlet}
          </PageWrapper>
        </AnimatePresence>
      </main>
    </div>
  );
}
