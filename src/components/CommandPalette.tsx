/**
 * Command palette (⌘K / Ctrl+K, or the nav's search button): jump to a section, open a
 * project's details or a paper, copy the email address, open the résumé, switch theme.
 * Native <dialog> + the ARIA combobox/listbox pattern; arrow keys, Enter, Escape.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Dialog from './Dialog';
import { LINKS } from '../content/site';
import { papers, projects, splitTitle } from '../content/data';
import { jumpTo, loadAllScenes } from '../lib/jump';
import { toggleHierarchy } from '../lib/eggs';
import { currentScheme, setScheme } from '../lib/theme';
import { toast } from '../lib/toast';

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  /** Hidden until the query starts one of these (easter eggs). */
  secret?: string[];
  run: () => void;
}

const open = (href: string) => window.open(href, '_blank', 'noopener');

function buildCommands(close: () => void): Command[] {
  const go = (id: string) => () => {
    close();
    void jumpTo(id);
  };
  const sections: [string, string][] = [
    ['hero', 'Top'],
    ['about', 'About'],
    ['disciplines', 'What I do'],
    ['toolbox', 'Tools I use'],
    ['projects', 'Projects'],
    ['experience', 'Experience'],
    ['papers', 'Papers'],
    ['certificates', 'Certificates'],
    ['contact', 'Contact'],
  ];
  return [
    ...sections.map(([id, label]) => ({ id: `go-${id}`, group: 'Go to', label, run: go(id) })),
    ...projects.map((p) => {
      const [name, sub] = splitTitle(p.title);
      return {
        id: `project-${name}`,
        group: 'Projects',
        label: name,
        hint: sub ?? undefined,
        keywords: p.technologies.join(' '),
        run: () => {
          close();
          void loadAllScenes().then(() => window.dispatchEvent(new CustomEvent('open-project', { detail: p.title })));
        },
      };
    }),
    ...papers
      .filter((p) => p.doi)
      .map((p) => ({
        id: `paper-${p.doi}`,
        group: 'Papers',
        label: p.title,
        hint: p.venue,
        keywords: p.keywords.join(' '),
        run: () => {
          close();
          open(`https://doi.org/${p.doi}`);
        },
      })),
    { id: 'resume', group: 'Actions', label: 'Open résumé (PDF)', run: () => (close(), open(LINKS.resume)) },
    {
      id: 'copy-email',
      group: 'Actions',
      label: 'Copy email address',
      hint: LINKS.email,
      run: () => {
        void navigator.clipboard?.writeText(LINKS.email);
        close();
      },
    },
    { id: 'email', group: 'Actions', label: 'Write an email', run: () => (close(), (window.location.href = `mailto:${LINKS.email}`)) },
    {
      id: 'theme',
      group: 'Actions',
      label: 'Switch light or dark theme',
      run: () => {
        setScheme(currentScheme() === 'dark' ? 'light' : 'dark');
        close();
      },
    },
    { id: 'linkedin', group: 'Links', label: 'LinkedIn', run: () => (close(), open(LINKS.linkedin)) },
    { id: 'github', group: 'Links', label: 'GitHub', run: () => (close(), open(LINKS.github)) },
    { id: 'scholar', group: 'Links', label: 'Google Scholar', run: () => (close(), open(LINKS.scholar)) },
    {
      id: 'sudo',
      group: 'Hidden',
      label: 'sudo hire gading',
      hint: 'Permission granted',
      secret: ['sudo', 'hire'],
      run: () => {
        close();
        window.location.href = `mailto:${LINKS.email}?subject=${encodeURIComponent("Let's talk")}`;
      },
    },
    {
      id: 'rm',
      group: 'Hidden',
      label: 'rm -rf /',
      hint: 'Go on',
      secret: ['rm -r'],
      run: () => {
        close();
        toast('Permission denied. Everything is still here.');
      },
    },
    {
      id: 'hierarchy',
      group: 'Hidden',
      label: 'View hierarchy',
      hint: 'Outline every view, like a view debugger',
      secret: ['hierarchy', 'debug', 'wireframe', 'konami'],
      run: () => {
        close();
        toggleHierarchy();
      },
    },
  ];
}

export default function CommandPalette({ open: isOpen, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const commands = useMemo(() => buildCommands(onClose), [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = commands.filter((c) => !c.secret);
    if (!q) return visible.filter((c) => c.group !== 'Papers' && c.group !== 'Projects').concat(visible.filter((c) => c.group === 'Projects').slice(0, 4));
    const found = commands.filter((c) => c.secret?.some((t) => (q.length >= 3 && t.startsWith(q)) || q.startsWith(t)));
    return found.concat(visible.filter((c) => `${c.label} ${c.hint ?? ''} ${c.group} ${c.keywords ?? ''}`.toLowerCase().includes(q)));
  }, [commands, query]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActive(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, listId]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      results[active]?.run();
    }
  };

  let lastGroup = '';
  return (
    <Dialog open={isOpen} onClose={onClose} title="Search and jump" hideTitle className="palette">
      <div className="palette__field">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          aria-label="Search sections, projects, papers and actions"
          placeholder="Search sections, projects, papers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="palette__esc">esc</kbd>
      </div>
      <ul id={listId} role="listbox" className="palette__list" aria-label="Results" data-lenis-prevent>
        {results.length === 0 ? <li className="palette__empty">No matches</li> : null}
        {results.map((c, i) => {
          const header = c.group !== lastGroup ? c.group : null;
          lastGroup = c.group;
          return (
            <li key={c.id} role="presentation">
              {header ? <p className="palette__group mono" aria-hidden="true">{header}</p> : null}
              <div
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className="palette__item"
                onMouseMove={() => setActive(i)}
                onClick={() => c.run()}
              >
                <span className="palette__label">{c.label}</span>
                {c.hint ? <span className="palette__hint">{c.hint}</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}
