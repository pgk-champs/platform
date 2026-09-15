import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import {
  fetchContentMeta,
  fetchProfile,
  isLoggedIn,
  login,
  logout,
  subscribe,
  type Profile,
} from '../lib/account';
import './accountNav.css';

/** Пункт навбара: кнопка «Войти» для гостя, аватар с меню для вошедшего.
 *  Роли (наставник, автор) выносятся отдельными ссылками рядом — их видит
 *  только тот, у кого роль есть: ссылка, ведущая к «нет доступа», — мусор. */
export default function AccountNav(): React.ReactElement | null {
  // 'wait' — пока не знаем: на сервере и до первого ответа /me. Показывать в
  // этот момент «Войти» нельзя, иначе у вошедшего кнопка мигает при каждом
  // переходе.
  const [state, setState] = useState<'wait' | 'anon' | 'user'>('wait');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  // Меню открывается кликом, а не наведением: на телефоне аватар остаётся в
  // шапке, а наведения там нет — по наведению меню было бы мёртвым.
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (!isLoggedIn()) {
        setProfile(null);
        setCanEdit(false);
        setState('anon');
        return;
      }
      void fetchProfile().then((p) => {
        if (!alive) return;
        setProfile(p);
        setState(p ? 'user' : 'anon');
      });
      void fetchContentMeta().then((m) => alive && setCanEdit(!!m?.canEdit));
    };
    load();
    // вход и выход случаются на других страницах — подписка держит шапку в
    // согласии с состоянием, не дожидаясь перезагрузки
    const unsubscribe = subscribe(load);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  if (state === 'wait') return null;

  if (state === 'anon' || !profile)
    return (
      <button type="button" className="an-login button button--primary button--sm" onClick={() => login()}>
        Войти
      </button>
    );

  return (
    <>
      {profile.mentor && (
        <Link className="navbar__item navbar__link an-role" to="/mentor">
          Наставнику
        </Link>
      )}
      {canEdit && (
        <Link className="navbar__item navbar__link an-role" to="/edit">
          Правка
        </Link>
      )}
      <div
        ref={wrap}
        className={`navbar__item dropdown dropdown--right an-wrap${open ? ' dropdown--show' : ''}`}
      >
        <button
          type="button"
          className="an-trigger"
          aria-label={`Профиль: ${profile.login}`}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <img className="an-avatar" src={profile.avatar} alt="" width={30} height={30} />
        </button>
        <ul className="dropdown__menu" onClick={() => setOpen(false)}>
          <li className="an-who">
            <strong>{profile.name || profile.login}</strong>
            <span>@{profile.login}</span>
          </li>
          <li>
            <Link className="dropdown__link" to="/account">Личный кабинет</Link>
          </li>
          <li>
            <Link className="dropdown__link" to="/achievements">Достижения и рекорды</Link>
          </li>
          <li>
            <Link className="dropdown__link" to="/favorites">Избранное</Link>
          </li>
          <li>
            <button type="button" className="dropdown__link an-logout" onClick={() => logout()}>
              Выйти
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
