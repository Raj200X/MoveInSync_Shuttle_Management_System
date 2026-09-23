import { useOutlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import styles from './StudentLayout.module.css';
import { AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../common/PageWrapper';

export function StudentLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  return (
    <div className={styles.layout}>
      <Navbar />
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
