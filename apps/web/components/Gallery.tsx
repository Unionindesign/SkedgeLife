"use client";

import { useRef, useState } from "react";
import styles from "./Gallery.module.css";

export type GalleryPhoto = { id: string; src: string; caption: string | null };

// A grid of photos; tap one to see it large (a native <dialog>, so Escape
// and the back gesture close it, and focus stays inside while it's open).
export function Gallery({ photos, name }: { photos: GalleryPhoto[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<GalleryPhoto | null>(null);

  const show = (photo: GalleryPhoto) => {
    setOpen(photo);
    dialog.current?.showModal();
  };

  return (
    <>
      <ul className={styles.grid}>
        {photos.map((photo) => (
          <li key={photo.id}>
            <button type="button" className={styles.thumb} onClick={() => show(photo)}>
              {/* Plain <img>: photos are already resized on upload, and this avoids Vercel's image-optimization quota. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.caption ?? `Photo of ${name}`} loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className={styles.dialog}
        onClose={() => setOpen(null)}
        onClick={() => dialog.current?.close()}
      >
        {open ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.src} alt={open.caption ?? `Photo of ${name}`} />
            {open.caption ? <figcaption>{open.caption}</figcaption> : null}
          </figure>
        ) : null}
        <button type="button" className={styles.close} aria-label="Close">
          ×
        </button>
      </dialog>
    </>
  );
}
