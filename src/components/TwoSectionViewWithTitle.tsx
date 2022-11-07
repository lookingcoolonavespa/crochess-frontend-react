import styles from '../styles/TwoSectionViewWithTitle.module.scss';

interface TwoSectionViewWithTitleProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function TwoSectionViewWithTitle({
  title,
  className,
  children,
}: TwoSectionViewWithTitleProps) {
  return (
    <section className={styles.main + ' two-section-view ' + (className || '')}>
      <h3 className={styles.title}>
        <span className={styles['text-wrapper']}>{title}</span>
      </h3>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
