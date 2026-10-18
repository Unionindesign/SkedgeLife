import Link from "next/link";
import styles from "./landing.module.css";

export default function NotFound() {
  return (
    <main className={styles.landing}>
      <h1>Page not found</h1>
      <p>There&rsquo;s no SkedgeLife page at this address. Check the spelling of the name in the link.</p>
      <p>
        <Link href="/">Go to SkedgeLife</Link>
      </p>
    </main>
  );
}
