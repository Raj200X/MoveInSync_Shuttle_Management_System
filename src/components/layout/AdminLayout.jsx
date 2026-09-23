import { useOutlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './AdminLayout.module.css';
import { PageWrapper } from '../common/PageWrapper';

export function AdminLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <PageWrapper key={location.pathname}>
          {currentOutlet}
        </PageWrapper>
      </main>
    </div>
  );
}
