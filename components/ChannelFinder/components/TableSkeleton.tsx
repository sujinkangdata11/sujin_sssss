import React from 'react';
import styles from '../../../styles/ChannelFinder.module.css';

const TableSkeleton: React.FC = () => (
  <>
    {Array.from({ length: 40 }).map((_, i) => (
      <tr key={`skeleton-${i}`} className={styles.skeletonRow}>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonRank}`}>{i + 1}</div></td>
        <td>
          <div className={styles.skeletonCellGroup}>
            <div className={`${styles.skeletonCell} ${styles.skeletonChannelName}`}></div>
          </div>
        </td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonCategory}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonSubscribers}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonGrowth}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonGrowth}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonGrowth}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonNumber}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonPeriod}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonViewsLarge}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonViewsMedium}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonVideosCount}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonFrequency}`}></div></td>
        <td><div className={`${styles.skeletonCell} ${styles.skeletonCountry}`}></div></td>
      </tr>
    ))}
  </>
);

export default TableSkeleton;