"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  CollectionKind,
  eventWorks,
  memberFor,
  personalWorks,
  typeLabel,
  withBasePath,
  Work,
} from "./data";

export function WorkCard({
  work,
  onClick,
  showCreator = false,
}: {
  work: Work;
  onClick: () => void;
  showCreator?: boolean;
}) {
  const creators = work.creatorIds.map((id) => memberFor(id).name).join(" / ");
  return (
    <button className="work-card" onClick={onClick}>
      <span className="thumb">
        <img
          src={withBasePath(work.thumbnail)}
          alt={`${work.title}のサムネイル`}
          loading="lazy"
        />
      </span>
      <span className="work-copy">
        <span className="eyebrow">{typeLabel[work.type]}</span>
        <strong>{work.title}</strong>
        {showCreator && <small>{creators}</small>}
      </span>
    </button>
  );
}

export function WorkModal({
  work,
  kind,
  onClose,
}: {
  work: Work;
  kind: CollectionKind;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const source = kind === "event" ? eventWorks : personalWorks;
  const related = source
    .filter(
      (item) =>
        item.id !== work.id &&
        item.creatorIds.some((id) => work.creatorIds.includes(id)),
    )
    .slice(0, 3);
  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const nodes = [
        ...document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(
          ".modal a, .modal button",
        ),
      ];
      const index = nodes.indexOf(document.activeElement as HTMLButtonElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        nodes.at(-1)?.focus();
      }
      if (!event.shiftKey && index === nodes.length - 1) {
        event.preventDefault();
        nodes[0]?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const eventWork =
    kind === "event" ? (work as (typeof eventWorks)[number]) : null;
  const soundcloudLink =
    work.type === "Music"
      ? work.links.find((link) => link.url.includes("soundcloud.com"))
      : undefined;
  const soundcloudEmbedUrl = soundcloudLink
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudLink.url)}&color=%23f58318&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`
    : undefined;
  const bandcampLink =
    work.type === "Music"
      ? work.links.find(
          (link) => link.url.includes("bandcamp.com") && link.embedUrl,
        )
      : undefined;
  const bandcampEmbedUrl = bandcampLink?.embedUrl;
  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          ref={closeRef}
          className="close"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <img
          className="modal-image"
          src={withBasePath(work.thumbnail)}
          alt={`${work.title}のサムネイル`}
        />
        <div className="modal-content">
          <p className="eyebrow">{typeLabel[work.type]}</p>
          <h2 id="modal-title">{work.title}</h2>
          <dl>
            <dt>制作者</dt>
            <dd>
              {work.creatorIds.map((id, index) => (
                <span key={id}>
                  {index > 0 && " / "}
                  <Link href={`/members/${id}`}>{memberFor(id).name}</Link>
                </span>
              ))}
            </dd>
            <dt>{kind === "event" ? "イベント" : "制作日"}</dt>
            <dd>
              {eventWork
                ? `${eventWork.event} · ${eventWork.year}`
                : (work as (typeof personalWorks)[number]).createdAt}
            </dd>
          </dl>
          <p className="description">{work.description}</p>
          {soundcloudEmbedUrl && (
            <div className="soundcloud-player">
              <iframe
                title={`${work.title}のSoundCloudプレーヤー`}
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                loading="lazy"
                src={soundcloudEmbedUrl}
              />
            </div>
          )}
          {bandcampEmbedUrl && (
            <div className="bandcamp-player">
              <iframe
                title={`${work.title}のBandcampプレーヤー`}
                width="100%"
                height="120"
                scrolling="no"
                frameBorder="0"
                loading="lazy"
                src={bandcampEmbedUrl}
              >
                <a href={bandcampLink.url}>{work.title}</a>
              </iframe>
            </div>
          )}
          {work.links.map((link) => (
            <a
              key={link.name}
              className="external"
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              {link.name} ↗
            </a>
          ))}
        </div>
        {related.length > 0 && (
          <div className="related">
            <h3>関連作品</h3>
            <div className="related-grid">
              {related.map((item) => (
                <span key={item.id}>
                  <img src={withBasePath(item.thumbnail)} alt="" />
                  <b>{item.title}</b>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
