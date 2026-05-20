import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import siteData from "./data/site_data.json";
import "./styles.css";

const visibilityOrder = ["public", "soft_spoiler", "major_spoiler"];

function App() {
  const [activeRoute, setActiveRoute] = useState("/");
  const [activeWork, setActiveWork] = useState("all");
  const [visibleLevel, setVisibleLevel] = useState("public");

  const visibleRank = siteData.visibilityLevels[visibleLevel].rank;

  const filteredCharacters = useMemo(() => {
    return siteData.characters.filter((character) => {
      const level = siteData.visibilityLevels[character.visibility];
      const matchesWork = activeWork === "all" || character.workId === activeWork;
      return matchesWork && level.rank <= visibleRank;
    });
  }, [activeWork, visibleRank]);

  const filteredGlossary = useMemo(() => {
    return siteData.glossary.filter((term) => {
      const level = siteData.visibilityLevels[term.visibility];
      return level.rank <= visibleRank;
    });
  }, [visibleRank]);

  return (
    <div className="app-shell">
      <Header activeRoute={activeRoute} onNavigate={setActiveRoute} />
      <main>
        {activeRoute === "/" && <Home onNavigate={setActiveRoute} />}
        {activeRoute === "/works" && <Works onNavigate={setActiveRoute} />}
        {activeRoute === "/works/stay-awake" && <WorkDetail workId="stay-awake" />}
        {activeRoute === "/works/rule-reader" && <WorkDetail workId="rule-reader" />}
        {activeRoute === "/characters" && (
          <Characters
            activeWork={activeWork}
            onWorkChange={setActiveWork}
            visibleLevel={visibleLevel}
            onLevelChange={setVisibleLevel}
            characters={filteredCharacters}
          />
        )}
        {activeRoute === "/world" && (
          <World
            visibleLevel={visibleLevel}
            onLevelChange={setVisibleLevel}
            glossary={filteredGlossary}
          />
        )}
      </main>
    </div>
  );
}

function Header({ activeRoute, onNavigate }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => onNavigate("/")}>
        <span>
          <strong>{siteData.meta.headerTitle ?? siteData.meta.siteTitle}</strong>
        </span>
      </button>
      <nav aria-label="주요 메뉴">
        {siteData.routes
          .filter((route) => !route.path.startsWith("/works/"))
          .map((route) => (
            <button
              key={route.id}
              className={activeRoute === route.path ? "active" : ""}
              onClick={() => onNavigate(route.path)}
            >
              {route.label}
            </button>
          ))}
      </nav>
    </header>
  );
}

function Home({ onNavigate }) {
  const { home } = siteData.pages;
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <h1>{home.hero.headline}</h1>
          <p>{home.hero.lines.join(" ")}</p>
          <div className="hero-actions">
            <button onClick={() => onNavigate("/works")}>작품 보기</button>
            <button className="secondary" onClick={() => onNavigate("/world")}>
              용어집 보기
            </button>
          </div>
        </div>
        <HeroIndex onNavigate={onNavigate} />
      </section>

      <section className="text-band">
        {home.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="work-preview-grid">
        {home.worksPreview.map((work) => (
          <article key={work.workId} className="work-preview">
            <h2>{work.title}</h2>
            <p>{work.text}</p>
            <button onClick={() => onNavigate(`/works/${work.workId}`)}>상세 보기</button>
          </article>
        ))}
      </section>
    </>
  );
}

function HeroIndex({ onNavigate }) {
  return (
    <div className="hero-index" aria-label="작품 바로가기">
      {siteData.works.map((work, index) => (
        <button key={work.id} onClick={() => onNavigate(`/works/${work.slug}`)}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{work.title}</strong>
          <small>{work.genre}</small>
        </button>
      ))}
    </div>
  );
}

function Works({ onNavigate }) {
  const { works } = siteData.pages;
  return (
    <section className="page-section">
      <PageHeader title={works.title} intro={works.intro} />
      <div className="work-list">
        {siteData.works.map((work) => (
          <article key={work.id} className="work-row">
            <div>
              <p className="meta-line">{work.genre}</p>
              <h2>{work.title}</h2>
              <p>{work.cardText}</p>
              <div className="keyword-row">
                {work.keywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </div>
            <button onClick={() => onNavigate(`/works/${work.slug}`)}>상세 보기</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkDetail({ workId }) {
  const work = siteData.works.find((item) => item.id === workId);
  const publicLockedTopics = work.lockedTopics.filter((topic) => topic.visibility !== "internal");
  return (
    <section className="page-section">
      <div className="detail-header">
        <p className="meta-line">{work.genre}</p>
        <h1>{work.title}</h1>
        <p>{work.shortCopy}</p>
      </div>
      <div className="detail-body">
        <section className="wiki-section">
          <h2>개요</h2>
          <div className="prose">
            {work.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        {work.wikiSections.map((section) => (
          <section key={section.title} className="wiki-section">
            <h2>{section.title}</h2>
            <div className="prose">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {work.incidentIndex && (
          <section className="wiki-section">
            <h2>사건 인덱스</h2>
            <div className="incident-list">
              {work.incidentIndex.map((incident) => (
                <article key={incident.title} className="incident-row">
                  <div>
                    <h3>{incident.title}</h3>
                    <p>{incident.summary}</p>
                  </div>
                  <VisibilityTag value={incident.visibility} />
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="wiki-section">
          <h2>키워드</h2>
          <div className="detail-keywords" aria-label="키워드">
            {work.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </section>

        <section className="wiki-section lock-section">
          <h2>스포일러 주제</h2>
          <p>{work.spoilerLockNotice}</p>
          <ul>
            {publicLockedTopics.map((topic) => (
              <li key={topic.topic}>
                <VisibilityTag value={topic.visibility} />
                <span>{topic.topic}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

function Characters({ activeWork, onWorkChange, visibleLevel, onLevelChange, characters }) {
  const { characters: page } = siteData.pages;
  return (
    <section className="page-section">
      <PageHeader title={page.title} intro={page.intro} />
      <Toolbar
        activeWork={activeWork}
        onWorkChange={onWorkChange}
        visibleLevel={visibleLevel}
        onLevelChange={onLevelChange}
      />
      {page.notice && <p className="notice">{page.notice}</p>}
      <div className="character-grid">
        {characters.map((character) => (
          <article key={character.id} className="character-card">
            <p className="meta-line">{character.work}</p>
            <h2>{character.name}</h2>
            <strong>{character.role}</strong>
            <p>{character.shortCopy}</p>
            <div className="profile-lines">
              {character.profile.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <VisibilityTag value={character.visibility} />
          </article>
        ))}
      </div>
    </section>
  );
}

function World({ visibleLevel, onLevelChange, glossary }) {
  const { world } = siteData.pages;
  return (
    <section className="page-section">
      <PageHeader title={world.title} intro={world.intro} />
      <div className="world-toolbar">
        <LevelSelector value={visibleLevel} onChange={onLevelChange} />
      </div>
      <div className="glossary-list">
        {glossary.map((term) => (
          <article key={`${term.workId}-${term.term}`} className="glossary-row">
            <div>
              <p className="meta-line">{term.work}</p>
              <h2>{term.term}</h2>
              <p>{term.definition}</p>
            </div>
            <VisibilityTag value={term.visibility} />
          </article>
        ))}
      </div>
    </section>
  );
}

function Toolbar({ activeWork, onWorkChange, visibleLevel, onLevelChange }) {
  return (
    <div className="toolbar">
      <label>
        작품
        <select value={activeWork} onChange={(event) => onWorkChange(event.target.value)}>
          <option value="all">전체</option>
          {siteData.works.map((work) => (
            <option key={work.id} value={work.id}>
              {work.title}
            </option>
          ))}
        </select>
      </label>
      <LevelSelector value={visibleLevel} onChange={onLevelChange} />
    </div>
  );
}

function LevelSelector({ value, onChange }) {
  return (
    <label>
      스포일러 범위
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {visibilityOrder.map((level) => (
          <option key={level} value={level}>
            {siteData.visibilityLevels[level].label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PageHeader({ title, intro }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function VisibilityTag({ value }) {
  const level = siteData.visibilityLevels[value];
  return <span className={`visibility-tag ${value}`}>{level.label}</span>;
}

createRoot(document.getElementById("root")).render(<App />);
