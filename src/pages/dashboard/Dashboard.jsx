import styles from "./Dashboard.module.scss";
import SupersetDashboard from "../../components/SupersetDashboard";

export default function Dashboard() {
  return (
    <div className={styles.fullViewWrap}>
      <SupersetDashboard className={styles.embedFull} />
    </div>
  );
}